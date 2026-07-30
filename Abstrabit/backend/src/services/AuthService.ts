import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { IRefreshTokenRepository } from '../repositories/interfaces/IRefreshTokenRepository';
import { IWorkspaceRepository } from '../repositories/interfaces/IWorkspaceRepository';
import { UserRepository } from '../repositories/UserRepository';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { WorkspaceRepository } from '../repositories/WorkspaceRepository';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  verifyResetToken,
  ResetTokenPayload,
} from '../utils/jwt';
import { ConflictError, UnauthorizedError, NotFoundError } from '../errors/AppError';
import { RegisterInput, LoginInput } from '../validators/authValidators';
import { UserResponseDTO } from '../models/user.model';
import { logger } from '../utils/logger';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private userRepo: IUserRepository;
  private refreshTokenRepo: IRefreshTokenRepository;
  private workspaceRepo: IWorkspaceRepository;

  constructor(
    userRepo?: IUserRepository,
    refreshTokenRepo?: IRefreshTokenRepository,
    workspaceRepo?: IWorkspaceRepository,
  ) {
    this.userRepo = userRepo || new UserRepository();
    this.refreshTokenRepo = refreshTokenRepo || new RefreshTokenRepository();
    this.workspaceRepo = workspaceRepo || new WorkspaceRepository();
  }

  public async register(
    input: RegisterInput,
    requestId?: string,
  ): Promise<{ user: UserResponseDTO; tokens: AuthTokens; defaultWorkspaceId: string }> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      logger.warn({ requestId, email: input.email }, 'Registration attempt with existing email');
      throw new ConflictError('A user with this email address already exists.');
    }

    const password_hash = await hashPassword(input.password);
    const user = await this.userRepo.create({
      email: input.email,
      password_hash,
      first_name: input.first_name,
      last_name: input.last_name,
    });

    logger.info({ requestId, userId: user.id }, 'User registered successfully');

    // Create default workspace for new user
    const defaultWorkspace = await this.workspaceRepo.create({
      user_id: user.id,
      name: `${user.first_name || 'My'} Workspace`,
      description: 'Default personal workspace',
    });

    const tokens = await this.issueTokenPair(user.id, user.email);

    return {
      user: this.toUserDTO(user),
      tokens,
      defaultWorkspaceId: defaultWorkspace.id,
    };
  }

  public async login(
    input: LoginInput,
    requestId?: string,
  ): Promise<{ user: UserResponseDTO; tokens: AuthTokens }> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      logger.warn({ requestId, email: input.email }, 'Failed login: User not found');
      // Generic error to resist user enumeration attacks
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await comparePassword(input.password, user.password_hash);
    if (!isValidPassword) {
      logger.warn({ requestId, userId: user.id }, 'Failed login: Password mismatch');
      throw new UnauthorizedError('Invalid email or password');
    }

    logger.info({ requestId, userId: user.id }, 'User logged in successfully');
    const tokens = await this.issueTokenPair(user.id, user.email);

    return {
      user: this.toUserDTO(user),
      tokens,
    };
  }

  public async refreshTokens(
    refreshTokenRaw: string,
    requestId?: string,
  ): Promise<AuthTokens> {
    try {
      const payload = verifyRefreshToken(refreshTokenRaw);
      const tokenHash = hashToken(refreshTokenRaw);

      const storedToken = await this.refreshTokenRepo.findByTokenHash(tokenHash);

      if (!storedToken) {
        logger.warn({ requestId, userId: payload.userId }, 'Refresh token not found in database');
        throw new UnauthorizedError('Invalid or revoked refresh token');
      }

      if (storedToken.revoked_at) {
        logger.warn(
          { requestId, userId: payload.userId },
          'REVOCATION ALERT: Attempted reuse of revoked refresh token. Invalidating all user sessions.',
        );
        // Security hardening: Revoke all tokens for this user upon reuse detection
        await this.refreshTokenRepo.revokeAllUserTokens(payload.userId);
        throw new UnauthorizedError('Security violation: Refresh token reuse detected');
      }

      if (new Date() > new Date(storedToken.expires_at)) {
        logger.warn({ requestId, userId: payload.userId }, 'Expired refresh token presented');
        throw new UnauthorizedError('Refresh token expired');
      }

      // Token Rotation: Revoke current token and issue new pair
      await this.refreshTokenRepo.revokeByHash(tokenHash);
      logger.info({ requestId, userId: payload.userId }, 'Rotated refresh token successfully');

      return await this.issueTokenPair(payload.userId, payload.email);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        throw err;
      }
      logger.warn({ requestId, err }, 'JWT Refresh Token verification failed');
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  public async logout(refreshTokenRaw: string, requestId?: string): Promise<void> {
    try {
      const tokenHash = hashToken(refreshTokenRaw);
      await this.refreshTokenRepo.revokeByHash(tokenHash);
      logger.info({ requestId }, 'User logged out and refresh token revoked');
    } catch (err) {
      logger.warn({ requestId, err }, 'Error during logout token revocation');
    }
  }

  public async getMe(userId: string): Promise<UserResponseDTO> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    return this.toUserDTO(user);
  }

  private async issueTokenPair(userId: string, email: string): Promise<AuthTokens> {
    const accessToken = generateAccessToken({ userId, email });
    const refreshToken = generateRefreshToken({ userId, email });

    const refreshTokenHash = hashToken(refreshToken);
    // Expires in 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.refreshTokenRepo.create({
      user_id: userId,
      token_hash: refreshTokenHash,
      expires_at: expiresAt,
    });

    return { accessToken, refreshToken };
  }

  public async forgotPassword(email: string, passwordRaw: string, requestId?: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      logger.info({ requestId, email }, 'Direct password change requested for non-existing email');
      throw new NotFoundError('No account found with this email address.');
    }

    const password_hash = await hashPassword(passwordRaw);
    await this.userRepo.update(user.id, { password_hash });

    await this.refreshTokenRepo.revokeAllUserTokens(user.id);
    logger.info({ requestId, userId: user.id }, 'Password changed directly via forgot-password flow and all user tokens revoked');
  }

  public async resetPassword(token: string, passwordRaw: string, requestId?: string): Promise<void> {
    let payload: ResetTokenPayload;
    try {
      payload = verifyResetToken(token);
      if (payload.type !== 'reset') {
        throw new UnauthorizedError('Invalid token type');
      }
    } catch (err) {
      logger.warn({ requestId, err }, 'Invalid or expired password reset token presented');
      throw new UnauthorizedError('Invalid or expired password reset token');
    }

    const user = await this.userRepo.findByEmail(payload.email);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const password_hash = await hashPassword(passwordRaw);
    await this.userRepo.update(user.id, { password_hash });

    await this.refreshTokenRepo.revokeAllUserTokens(user.id);
    logger.info({ requestId, userId: user.id }, 'Password reset successfully and all user tokens revoked');
  }

  private toUserDTO(user: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    created_at: Date;
  }): UserResponseDTO {
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name || undefined,
      last_name: user.last_name || undefined,
      created_at: new Date(user.created_at).toISOString(),
    };
  }
}

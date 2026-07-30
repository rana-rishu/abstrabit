import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/authValidators';
import { ApiResponse } from '../dto/response.dto';
import { ValidationError, UnauthorizedError } from '../errors/AppError';

export class AuthController {
  private authService: AuthService;

  constructor(authService?: AuthService) {
    this.authService = authService || new AuthService();
  }

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Invalid registration input', validation.error.format());
      }

      const result = await this.authService.register(validation.data, req.id);
      res.status(201).json(ApiResponse.success(result, undefined, req.id));
    } catch (err) {
      next(err);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Invalid login input', validation.error.format());
      }

      const result = await this.authService.login(validation.data, req.id);
      res.status(200).json(ApiResponse.success(result, undefined, req.id));
    } catch (err) {
      next(err);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = refreshSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Refresh token is required', validation.error.format());
      }

      const tokens = await this.authService.refreshTokens(validation.data.refreshToken, req.id);
      res.status(200).json(ApiResponse.success(tokens, undefined, req.id));
    } catch (err) {
      next(err);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = logoutSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Refresh token is required', validation.error.format());
      }

      await this.authService.logout(validation.data.refreshToken, req.id);
      res.status(200).json(ApiResponse.success({ message: 'Logged out successfully' }, undefined, req.id));
    } catch (err) {
      next(err);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User authentication required');
      }

      const user = await this.authService.getMe(req.user.userId);
      res.status(200).json(ApiResponse.success(user, undefined, req.id));
    } catch (err) {
      next(err);
    }
  };

  public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = forgotPasswordSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Email and password are required', validation.error.format());
      }

      await this.authService.forgotPassword(validation.data.email, validation.data.password, req.id);
      res
        .status(200)
        .json(
          ApiResponse.success(
            { message: 'Password has been reset successfully.' },
            undefined,
            req.id,
          ),
        );
    } catch (err) {
      next(err);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = resetPasswordSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Invalid inputs', validation.error.format());
      }

      await this.authService.resetPassword(validation.data.token, validation.data.password, req.id);
      res
        .status(200)
        .json(ApiResponse.success({ message: 'Password has been reset successfully.' }, undefined, req.id));
    } catch (err) {
      next(err);
    }
  };
}

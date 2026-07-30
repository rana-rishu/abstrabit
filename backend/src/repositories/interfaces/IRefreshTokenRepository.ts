import { RefreshToken } from '../../models/refreshToken.model';

export interface IRefreshTokenRepository {
  create(data: { user_id: string; token_hash: string; expires_at: Date }): Promise<RefreshToken>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  revokeByHash(tokenHash: string): Promise<void>;
  revokeAllUserTokens(userId: string): Promise<void>;
}

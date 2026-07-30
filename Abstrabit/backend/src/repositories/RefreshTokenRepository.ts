import { db } from '../config/db.config';
import { RefreshToken } from '../models/refreshToken.model';
import { IRefreshTokenRepository } from './interfaces/IRefreshTokenRepository';

export class RefreshTokenRepository implements IRefreshTokenRepository {
  public async create(data: {
    user_id: string;
    token_hash: string;
    expires_at: Date;
  }): Promise<RefreshToken> {
    const sql = `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, token_hash, expires_at, created_at, revoked_at;
    `;
    const res = await db.query<RefreshToken>(sql, [data.user_id, data.token_hash, data.expires_at]);
    return res.rows[0];
  }

  public async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const sql = `
      SELECT id, user_id, token_hash, expires_at, created_at, revoked_at
      FROM refresh_tokens
      WHERE token_hash = $1;
    `;
    const res = await db.query<RefreshToken>(sql, [tokenHash]);
    return res.rows[0] || null;
  }

  public async revokeByHash(tokenHash: string): Promise<void> {
    const sql = `
      UPDATE refresh_tokens
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE token_hash = $1 AND revoked_at IS NULL;
    `;
    await db.query(sql, [tokenHash]);
  }

  public async revokeAllUserTokens(userId: string): Promise<void> {
    const sql = `
      UPDATE refresh_tokens
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND revoked_at IS NULL;
    `;
    await db.query(sql, [userId]);
  }
}

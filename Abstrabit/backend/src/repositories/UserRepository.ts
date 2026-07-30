import { db } from '../config/db.config';
import { User } from '../models/user.model';
import { IUserRepository } from './interfaces/IUserRepository';

export class UserRepository implements IUserRepository {
  public async findById(id: string): Promise<User | null> {
    const sql = `
      SELECT id, email, password_hash, first_name, last_name, created_at, updated_at, deleted_at
      FROM users
      WHERE id = $1 AND deleted_at IS NULL;
    `;
    const res = await db.query<User>(sql, [id]);
    return res.rows[0] || null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const sql = `
      SELECT id, email, password_hash, first_name, last_name, created_at, updated_at, deleted_at
      FROM users
      WHERE email = $1 AND deleted_at IS NULL;
    `;
    const res = await db.query<User>(sql, [email.toLowerCase().trim()]);
    return res.rows[0] || null;
  }

  public async create(data: {
    email: string;
    password_hash: string;
    first_name?: string;
    last_name?: string;
  }): Promise<User> {
    const sql = `
      INSERT INTO users (email, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, password_hash, first_name, last_name, created_at, updated_at, deleted_at;
    `;
    const res = await db.query<User>(sql, [
      data.email.toLowerCase().trim(),
      data.password_hash,
      data.first_name || null,
      data.last_name || null,
    ]);
    return res.rows[0];
  }

  public async update(id: string, data: Partial<User>): Promise<User | null> {
    const sql = `
      UPDATE users
      SET first_name = COALESCE($2, first_name),
          last_name = COALESCE($3, last_name),
          password_hash = COALESCE($4, password_hash),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id, email, password_hash, first_name, last_name, created_at, updated_at, deleted_at;
    `;
    const res = await db.query<User>(sql, [
      id,
      data.first_name !== undefined ? data.first_name : null,
      data.last_name !== undefined ? data.last_name : null,
      data.password_hash !== undefined ? data.password_hash : null,
    ]);
    return res.rows[0] || null;
  }
}

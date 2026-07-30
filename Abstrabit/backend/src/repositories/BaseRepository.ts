import { QueryResultRow } from 'pg';
import { db } from '../config/db.config';

export abstract class BaseRepository<T extends QueryResultRow> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  public async count(workspaceId?: string): Promise<number> {
    let sql = `SELECT COUNT(*)::int AS count FROM ${this.tableName} WHERE 1=1`;
    const params: unknown[] = [];

    if (this.tableName !== 'users' && this.tableName !== 'refresh_tokens' && this.tableName !== 'doc_chunks') {
      sql += ` AND deleted_at IS NULL`;
    }

    if (workspaceId) {
      params.push(workspaceId);
      sql += ` AND workspace_id = $${params.length}`;
    }

    const res = await db.query<{ count: number }>(sql, params);
    return res.rows[0]?.count || 0;
  }

  public async exists(id: string): Promise<boolean> {
    let sql = `SELECT 1 FROM ${this.tableName} WHERE id = $1`;
    if (this.tableName !== 'users' && this.tableName !== 'refresh_tokens' && this.tableName !== 'doc_chunks') {
      sql += ` AND deleted_at IS NULL`;
    }
    const res = await db.query(sql, [id]);
    return (res.rowCount ?? 0) > 0;
  }

  public async softDelete(id: string, workspaceId?: string): Promise<boolean> {
    let sql = `UPDATE ${this.tableName} SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1`;
    const params: unknown[] = [id];

    if (workspaceId) {
      params.push(workspaceId);
      sql += ` AND workspace_id = $${params.length}`;
    }

    sql += ` AND deleted_at IS NULL`;

    const res = await db.query(sql, params);
    return (res.rowCount ?? 0) > 0;
  }
}

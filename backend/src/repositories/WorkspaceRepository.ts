import { db } from '../config/db.config';
import { Workspace, WorkspaceMemberRole } from '../models/workspace.model';
import { IWorkspaceRepository } from './interfaces/IWorkspaceRepository';

export class WorkspaceRepository implements IWorkspaceRepository {
  public async findById(id: string): Promise<Workspace | null> {
    const sql = `
      SELECT id, user_id, name, description, created_at, updated_at, deleted_at
      FROM workspaces
      WHERE id = $1 AND deleted_at IS NULL;
    `;
    const res = await db.query<Workspace>(sql, [id]);
    return res.rows[0] || null;
  }

  public async findByUserId(userId: string): Promise<Workspace[]> {
    const sql = `
      SELECT id, user_id, name, description, created_at, updated_at, deleted_at
      FROM workspaces
      WHERE user_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC;
    `;
    const res = await db.query<Workspace>(sql, [userId]);
    return res.rows;
  }

  public async create(data: {
    user_id: string;
    name: string;
    description?: string;
  }): Promise<Workspace> {
    const sql = `
      INSERT INTO workspaces (user_id, name, description)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, name, description, created_at, updated_at, deleted_at;
    `;
    const res = await db.query<Workspace>(sql, [
      data.user_id,
      data.name.trim(),
      data.description || null,
    ]);
    return res.rows[0];
  }

  public async verifyOwnership(workspaceId: string, userId: string): Promise<boolean> {
    const sql = `
      SELECT id FROM workspaces
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL;
    `;
    const res = await db.query(sql, [workspaceId, userId]);
    return res.rowCount !== null && res.rowCount > 0;
  }

  public async findUserRole(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMemberRole | null> {
    const isOwner = await this.verifyOwnership(workspaceId, userId);
    if (isOwner) {
      return 'OWNER';
    }

    const sql = `
      SELECT role FROM workspace_members
      WHERE workspace_id = $1 AND user_id = $2;
    `;
    const res = await db.query<{ role: WorkspaceMemberRole }>(sql, [workspaceId, userId]);
    return res.rows[0]?.role || null;
  }
}

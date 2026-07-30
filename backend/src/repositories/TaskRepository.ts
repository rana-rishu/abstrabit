import { db } from '../config/db.config';
import { BaseRepository } from './BaseRepository';
import { Task, TaskPriority, TaskStatus } from '../models/task.model';
import { ITaskRepository } from './interfaces/ITaskRepository';
import { PaginatedResult, buildPaginatedResult } from '../dto/pagination.dto';

export class TaskRepository extends BaseRepository<Task> implements ITaskRepository {
  constructor() {
    super('tasks');
  }

  public async findById(id: string, workspaceId: string): Promise<Task | null> {
    const sql = `
      SELECT id, workspace_id, title, description, priority, status, created_at, updated_at, deleted_at
      FROM tasks
      WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL;
    `;
    const res = await db.query<Task>(sql, [id, workspaceId]);
    return res.rows[0] || null;
  }

  public async listByWorkspace(
    workspaceId: string,
    status?: TaskStatus,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResult<Task>> {
    const offset = (page - 1) * limit;
    const params: unknown[] = [workspaceId];
    let whereClause = `WHERE workspace_id = $1 AND deleted_at IS NULL`;

    if (status) {
      params.push(status);
      whereClause += ` AND status = $${params.length}`;
    }

    const countSql = `SELECT COUNT(*)::int AS total FROM tasks ${whereClause};`;
    const countRes = await db.query<{ total: number }>(countSql, params);
    const total = countRes.rows[0]?.total || 0;

    const dataSql = `
      SELECT id, workspace_id, title, description, priority, status, created_at, updated_at, deleted_at
      FROM tasks
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;
    const dataRes = await db.query<Task>(dataSql, [...params, limit, offset]);

    return buildPaginatedResult(dataRes.rows, total, page, limit);
  }

  public async create(data: {
    workspace_id: string;
    title: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
  }): Promise<Task> {
    const sql = `
      INSERT INTO tasks (workspace_id, title, description, priority, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, workspace_id, title, description, priority, status, created_at, updated_at, deleted_at;
    `;
    const res = await db.query<Task>(sql, [
      data.workspace_id,
      data.title.trim(),
      data.description || null,
      data.priority || 'MEDIUM',
      data.status || 'PENDING',
    ]);
    return res.rows[0];
  }

  public async updateStatus(
    id: string,
    workspaceId: string,
    status: TaskStatus,
  ): Promise<Task | null> {
    const sql = `
      UPDATE tasks
      SET status = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL
      RETURNING id, workspace_id, title, description, priority, status, created_at, updated_at, deleted_at;
    `;
    const res = await db.query<Task>(sql, [id, workspaceId, status]);
    return res.rows[0] || null;
  }
}

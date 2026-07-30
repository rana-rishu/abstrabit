import { db } from '../config/db.config';
import { ToolLog, ToolExecutionStatus } from '../models/toolLog.model';
import { IToolLogRepository } from './interfaces/IToolLogRepository';
import { PaginatedResult, buildPaginatedResult } from '../dto/pagination.dto';

export class ToolLogRepository implements IToolLogRepository {
  public async create(data: {
    workspace_id: string;
    request_id: string;
    tool_name: string;
    input_args: Record<string, unknown>;
    output_result?: Record<string, unknown>;
    status: ToolExecutionStatus;
    error_message?: string;
    execution_ms: number;
  }): Promise<ToolLog> {
    const sql = `
      INSERT INTO tool_logs (workspace_id, request_id, tool_name, input_args, output_result, status, error_message, execution_ms)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, workspace_id, request_id, tool_name, input_args, output_result, status, error_message, execution_ms, created_at;
    `;
    const res = await db.query<ToolLog>(sql, [
      data.workspace_id,
      data.request_id,
      data.tool_name,
      JSON.stringify(data.input_args),
      data.output_result ? JSON.stringify(data.output_result) : null,
      data.status,
      data.error_message || null,
      data.execution_ms,
    ]);
    return res.rows[0];
  }

  public async listByWorkspace(
    workspaceId: string,
    toolName?: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResult<ToolLog>> {
    const offset = (page - 1) * limit;
    const params: unknown[] = [workspaceId];
    let whereClause = `WHERE workspace_id = $1`;

    if (toolName) {
      params.push(toolName);
      whereClause += ` AND tool_name = $${params.length}`;
    }

    const countSql = `SELECT COUNT(*)::int AS total FROM tool_logs ${whereClause};`;
    const countRes = await db.query<{ total: number }>(countSql, params);
    const total = countRes.rows[0]?.total || 0;

    const dataSql = `
      SELECT id, workspace_id, request_id, tool_name, input_args, output_result, status, error_message, execution_ms, created_at
      FROM tool_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;
    const dataRes = await db.query<ToolLog>(dataSql, [...params, limit, offset]);

    return buildPaginatedResult(dataRes.rows, total, page, limit);
  }
}

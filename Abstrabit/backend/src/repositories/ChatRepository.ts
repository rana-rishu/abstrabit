import { db } from '../config/db.config';
import { ChatMessage, CitationReference } from '../models/chat.model';
import { IChatRepository } from './interfaces/IChatRepository';
import { PaginatedResult, buildPaginatedResult } from '../dto/pagination.dto';

export class ChatRepository implements IChatRepository {
  public async create(data: {
    workspace_id: string;
    user_id: string;
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    citations?: CitationReference[];
  }): Promise<ChatMessage> {
    const sql = `
      INSERT INTO chat_messages (workspace_id, user_id, role, content, citations)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, workspace_id, user_id, role, content, citations, created_at;
    `;
    const res = await db.query<ChatMessage>(sql, [
      data.workspace_id,
      data.user_id,
      data.role,
      data.content,
      data.citations ? JSON.stringify(data.citations) : null,
    ]);
    return res.rows[0];
  }

  public async getHistory(
    workspaceId: string,
    page = 1,
    limit = 50,
  ): Promise<PaginatedResult<ChatMessage>> {
    const offset = (page - 1) * limit;

    const countSql = `SELECT COUNT(*)::int AS total FROM chat_messages WHERE workspace_id = $1;`;
    const countRes = await db.query<{ total: number }>(countSql, [workspaceId]);
    const total = countRes.rows[0]?.total || 0;

    const dataSql = `
      SELECT id, workspace_id, user_id, role, content, citations, created_at
      FROM chat_messages
      WHERE workspace_id = $1
      ORDER BY created_at ASC
      LIMIT $2 OFFSET $3;
    `;
    const dataRes = await db.query<ChatMessage>(dataSql, [workspaceId, limit, offset]);

    return buildPaginatedResult(dataRes.rows, total, page, limit);
  }
}

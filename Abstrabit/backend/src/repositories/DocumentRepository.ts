import { db } from '../config/db.config';
import { BaseRepository } from './BaseRepository';
import { Document } from '../models/document.model';
import { IDocumentRepository } from './interfaces/IDocumentRepository';
import { PaginatedResult, buildPaginatedResult } from '../dto/pagination.dto';

export class DocumentRepository extends BaseRepository<Document> implements IDocumentRepository {
  constructor() {
    super('documents');
  }

  public async findById(id: string, workspaceId: string): Promise<Document | null> {
    const sql = `
      SELECT id, workspace_id, filename, file_hash, doc_type, size_bytes, chunk_count, created_at, updated_at, deleted_at
      FROM documents
      WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL;
    `;
    const res = await db.query<Document>(sql, [id, workspaceId]);
    return res.rows[0] || null;
  }

  public async findByHash(workspaceId: string, fileHash: string): Promise<Document | null> {
    const sql = `
      SELECT id, workspace_id, filename, file_hash, doc_type, size_bytes, chunk_count, created_at, updated_at, deleted_at
      FROM documents
      WHERE workspace_id = $1 AND file_hash = $2 AND deleted_at IS NULL;
    `;
    const res = await db.query<Document>(sql, [workspaceId, fileHash]);
    return res.rows[0] || null;
  }

  public async listByWorkspace(
    workspaceId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResult<Document>> {
    const offset = (page - 1) * limit;

    const countSql = `
      SELECT COUNT(*)::int AS total 
      FROM documents 
      WHERE workspace_id = $1 AND deleted_at IS NULL;
    `;
    const countRes = await db.query<{ total: number }>(countSql, [workspaceId]);
    const total = countRes.rows[0]?.total || 0;

    const dataSql = `
      SELECT id, workspace_id, filename, file_hash, doc_type, size_bytes, chunk_count, created_at, updated_at, deleted_at
      FROM documents
      WHERE workspace_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const dataRes = await db.query<Document>(dataSql, [workspaceId, limit, offset]);

    return buildPaginatedResult(dataRes.rows, total, page, limit);
  }

  public async create(data: {
    workspace_id: string;
    filename: string;
    file_hash: string;
    doc_type: string;
    size_bytes: number;
    chunk_count: number;
  }): Promise<Document> {
    const sql = `
      INSERT INTO documents (workspace_id, filename, file_hash, doc_type, size_bytes, chunk_count)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, workspace_id, filename, file_hash, doc_type, size_bytes, chunk_count, created_at, updated_at, deleted_at;
    `;
    const res = await db.query<Document>(sql, [
      data.workspace_id,
      data.filename,
      data.file_hash,
      data.doc_type,
      data.size_bytes,
      data.chunk_count,
    ]);
    return res.rows[0];
  }

  public async updateChunkCount(id: string, workspaceId: string, count: number): Promise<void> {
    const sql = `
      UPDATE documents
      SET chunk_count = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL;
    `;
    await db.query(sql, [id, workspaceId, count]);
  }
}

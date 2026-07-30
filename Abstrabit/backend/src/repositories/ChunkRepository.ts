import { db } from '../config/db.config';
import { BaseRepository } from './BaseRepository';
import { DocChunk, ChunkWithSimilarity } from '../models/chunk.model';
import { IChunkRepository, CreateChunkInput } from './interfaces/IChunkRepository';

export class ChunkRepository extends BaseRepository<DocChunk> implements IChunkRepository {
  constructor() {
    super('doc_chunks');
  }

  public async insertBatch(chunks: CreateChunkInput[]): Promise<DocChunk[]> {
    if (chunks.length === 0) return [];

    const inserted: DocChunk[] = [];
    for (const c of chunks) {
      const sql = `
        INSERT INTO doc_chunks (
          workspace_id, document_id, chunk_index, content, section_id, section_title, page_number, token_count, checksum, embedding
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::vector)
        RETURNING id, workspace_id, document_id, chunk_index, content, section_id, section_title, page_number, token_count, checksum, created_at;
      `;
      const res = await db.query<DocChunk>(sql, [
        c.workspace_id,
        c.document_id,
        c.chunk_index,
        c.content,
        c.section_id || null,
        c.section_title || null,
        c.page_number || null,
        c.token_count,
        c.checksum,
        c.embedding ? JSON.stringify(c.embedding) : null,
      ]);
      if (res.rows[0]) {
        inserted.push(res.rows[0]);
      }
    }
    return inserted;
  }

  public async searchVector(
    workspaceId: string,
    queryEmbedding: number[],
    limit = 25,
  ): Promise<ChunkWithSimilarity[]> {
    // SECURITY CRITICAL: WHERE workspace_id = $2 is enforced directly inside pgvector cosine search
    // Returns raw unclamped cosine similarity
    const sql = `
      SELECT 
        id, workspace_id, document_id, chunk_index, content, section_id, section_title, page_number, token_count, checksum, created_at,
        1 - (embedding <=> $1::vector) AS similarity
      FROM doc_chunks
      WHERE workspace_id = $2 AND embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector
      LIMIT $3;
    `;
    const res = await db.query<ChunkWithSimilarity>(sql, [
      JSON.stringify(queryEmbedding),
      workspaceId,
      limit,
    ]);
    return res.rows;
  }

  public async deleteByDocument(documentId: string, workspaceId: string): Promise<number> {
    const sql = `
      DELETE FROM doc_chunks
      WHERE document_id = $1 AND workspace_id = $2;
    `;
    const res = await db.query(sql, [documentId, workspaceId]);
    return res.rowCount ?? 0;
  }

  public async countByWorkspace(workspaceId: string): Promise<number> {
    return await this.count(workspaceId);
  }
}

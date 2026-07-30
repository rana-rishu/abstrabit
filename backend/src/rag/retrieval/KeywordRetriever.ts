import { IKeywordRetriever, ScoredChunk } from '../interfaces/IRetriever';
import { db } from '../../config/db.config';

export class KeywordRetriever implements IKeywordRetriever {
  public async retrieveKeyword(
    workspaceId: string,
    queryText: string,
    limit = 20,
  ): Promise<ScoredChunk[]> {
    const cleanQuery = queryText.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    if (!cleanQuery) return [];

    // PostgreSQL Full-Text Search with TSVECTOR and ts_rank
    const sql = `
      SELECT 
        id, workspace_id, document_id, chunk_index, content, section_id, section_title, page_number, token_count, checksum, created_at,
        ts_rank(tsv, plainto_tsquery('english', $1)) AS similarity
      FROM doc_chunks
      WHERE workspace_id = $2 AND tsv @@ plainto_tsquery('english', $1)
      ORDER BY ts_rank(tsv, plainto_tsquery('english', $1)) DESC
      LIMIT $3;
    `;

    const res = await db.query<ScoredChunk>(sql, [cleanQuery, workspaceId, limit]);
    return res.rows.map((chunk, index) => ({
      ...chunk,
      keywordRank: index + 1,
    }));
  }
}

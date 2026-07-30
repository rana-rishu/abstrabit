import { DocChunk, ChunkWithSimilarity } from '../../models/chunk.model';

export interface CreateChunkInput {
  workspace_id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  section_id?: string;
  section_title?: string;
  page_number?: number;
  token_count: number;
  checksum: string;
  embedding?: number[];
}

export interface IChunkRepository {
  insertBatch(chunks: CreateChunkInput[]): Promise<DocChunk[]>;
  searchVector(
    workspaceId: string,
    queryEmbedding: number[],
    limit?: number,
  ): Promise<ChunkWithSimilarity[]>;
  deleteByDocument(documentId: string, workspaceId: string): Promise<number>;
  countByWorkspace(workspaceId: string): Promise<number>;
}

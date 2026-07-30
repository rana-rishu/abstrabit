export interface DocChunk {
  id: string;
  workspace_id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  section_id?: string | null;
  paragraph_index?: number | null;
  section_title?: string | null;
  page_number?: number | null;
  token_count: number;
  checksum: string;
  created_at: Date;
}

export interface ChunkWithSimilarity extends DocChunk {
  similarity: number;
}

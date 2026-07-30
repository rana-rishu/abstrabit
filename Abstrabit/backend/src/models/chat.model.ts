export interface CitationReference {
  document_id: string;
  filename: string;
  chunk_index: number;
  section_id?: string;
  section_title?: string;
  page_number?: number;
  vector_similarity?: number;
  retrieval_rank?: number;
  content?: string;
  char_start?: number;
  char_end?: number;
}

export interface ChatMessage {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  citations?: CitationReference[] | null;
  created_at: Date;
}

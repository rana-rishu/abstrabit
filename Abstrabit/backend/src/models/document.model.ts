export interface Document {
  id: string;
  workspace_id: string;
  filename: string;
  file_hash: string;
  doc_type: string;
  size_bytes: number;
  chunk_count: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

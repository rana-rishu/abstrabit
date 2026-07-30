import { Document } from '../../models/document.model';
import { PaginatedResult } from '../../dto/pagination.dto';

export interface IDocumentRepository {
  findById(id: string, workspaceId: string): Promise<Document | null>;
  findByHash(workspaceId: string, fileHash: string): Promise<Document | null>;
  listByWorkspace(workspaceId: string, page: number, limit: number): Promise<PaginatedResult<Document>>;
  create(data: {
    workspace_id: string;
    filename: string;
    file_hash: string;
    doc_type: string;
    size_bytes: number;
    chunk_count: number;
  }): Promise<Document>;
  updateChunkCount(id: string, workspaceId: string, count: number): Promise<void>;
  softDelete(id: string, workspaceId: string): Promise<boolean>;
}

import { ChatMessage, CitationReference } from '../../models/chat.model';
import { PaginatedResult } from '../../dto/pagination.dto';

export interface IChatRepository {
  create(data: {
    workspace_id: string;
    user_id: string;
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    citations?: CitationReference[];
  }): Promise<ChatMessage>;
  getHistory(workspaceId: string, page?: number, limit?: number): Promise<PaginatedResult<ChatMessage>>;
}

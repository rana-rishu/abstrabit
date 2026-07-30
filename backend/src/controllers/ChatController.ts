import { Request, Response, NextFunction } from 'express';
import { RagOrchestrator, ActiveContext } from '../rag/RagOrchestrator';
import { ChatRepository } from '../repositories/ChatRepository';
import { ApiResponse } from '../dto/response.dto';
import { ValidationError } from '../errors/AppError';
import { z } from 'zod';

const activeContextSchema = z.object({
  documentId: z.string().optional(),
  pageNumber: z.number().optional(),
  sectionId: z.string().optional(),
  sectionTitle: z.string().optional(),
}).optional();

const chatQuerySchema = z.object({
  message: z.string().min(1, 'Message query cannot be empty').max(2000),
  includeDebug: z.boolean().optional().default(false),
  activeContext: activeContextSchema,
});

export class ChatController {
  private ragOrchestrator: RagOrchestrator;
  private chatRepo: ChatRepository;

  constructor(ragOrchestrator?: RagOrchestrator, chatRepo?: ChatRepository) {
    this.ragOrchestrator = ragOrchestrator || new RagOrchestrator();
    this.chatRepo = chatRepo || new ChatRepository();
  }

  public chat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.params.workspaceId || (req.headers['x-workspace-id'] as string);
      const userId = req.user?.userId;

      if (!workspaceId || !userId) {
        throw new ValidationError('Workspace ID and user authentication are required');
      }

      const validation = chatQuerySchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Invalid chat request body', validation.error.format());
      }

      const { message, includeDebug, activeContext } = validation.data;

      // 1. Save User Message to History
      await this.chatRepo.create({
        workspace_id: workspaceId,
        user_id: userId,
        role: 'user',
        content: message,
      });

      // 2. Execute Integrated RAG + Active Context Boosting Pipeline
      const ragResult = await this.ragOrchestrator.execute(
        workspaceId,
        message,
        userId,
        activeContext as ActiveContext,
        includeDebug,
        req.id,
      );

      // 3. Save Assistant Message to History
      await this.chatRepo.create({
        workspace_id: workspaceId,
        user_id: userId,
        role: 'assistant',
        content: ragResult.answer,
        citations: ragResult.citations,
      });

      res.status(200).json(ApiResponse.success(ragResult, undefined, req.id));
    } catch (err) {
      next(err);
    }
  };

  public getDebugRetrieval = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const workspaceId = req.params.workspaceId || (req.headers['x-workspace-id'] as string);
      const userId = req.user?.userId || 'user-internal';
      const query = (req.query.query as string) || 'System architecture and vector isolation';

      const ragResult = await this.ragOrchestrator.execute(workspaceId, query, userId, undefined, true, req.id);

      res.status(200).json(ApiResponse.success(ragResult.debugPayload, undefined, req.id));
    } catch (err) {
      next(err);
    }
  };

  public getChatHistory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const workspaceId = req.params.workspaceId || (req.headers['x-workspace-id'] as string);
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const history = await this.chatRepo.getHistory(workspaceId, page, limit);

      res.status(200).json(ApiResponse.success(history.data, history.meta, req.id));
    } catch (err) {
      next(err);
    }
  };
}

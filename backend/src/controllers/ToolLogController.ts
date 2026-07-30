import { Request, Response, NextFunction } from 'express';
import { ToolLogRepository } from '../repositories/ToolLogRepository';
import { ApiResponse } from '../dto/response.dto';
import { paginationQuerySchema } from '../dto/pagination.dto';

export class ToolLogController {
  private logRepo: ToolLogRepository;

  constructor(logRepo?: ToolLogRepository) {
    this.logRepo = logRepo || new ToolLogRepository();
  }

  public listToolLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.params.workspaceId || (req.headers['x-workspace-id'] as string);
      const toolName = req.query.toolName as string | undefined;

      const queryValidation = paginationQuerySchema.safeParse(req.query);
      const { page, limit } = queryValidation.success
        ? queryValidation.data
        : { page: 1, limit: 20 };

      const result = await this.logRepo.listByWorkspace(workspaceId, toolName, page, limit);

      res.status(200).json(ApiResponse.success(result.data, result.meta, req.id));
    } catch (err) {
      next(err);
    }
  };
}

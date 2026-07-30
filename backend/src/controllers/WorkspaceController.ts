import { Request, Response, NextFunction } from 'express';
import { WorkspaceRepository } from '../repositories/WorkspaceRepository';
import { ApiResponse } from '../dto/response.dto';
import { ValidationError, UnauthorizedError } from '../errors/AppError';
import { createWorkspaceSchema } from '../validators/workspaceValidators';

export class WorkspaceController {
  private workspaceRepo = new WorkspaceRepository();

  public listWorkspaces = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User authentication required');
      }

      const workspaces = await this.workspaceRepo.findByUserId(req.user.userId);
      res.status(200).json(ApiResponse.success(workspaces, undefined, req.id));
    } catch (err) {
      next(err);
    }
  };

  public createWorkspace = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User authentication required');
      }

      const validation = createWorkspaceSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Invalid workspace input', validation.error.format());
      }

      const workspace = await this.workspaceRepo.create({
        user_id: req.user.userId,
        name: validation.data.name.trim(),
        description: validation.data.description,
      });

      res.status(201).json(ApiResponse.success(workspace, undefined, req.id));
    } catch (err) {
      next(err);
    }
  };
}

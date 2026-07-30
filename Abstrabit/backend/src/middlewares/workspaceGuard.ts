import { Request, Response, NextFunction } from 'express';
import { WorkspaceRepository } from '../repositories/WorkspaceRepository';
import { UnauthorizedError, ForbiddenError, ValidationError } from '../errors/AppError';
import { workspaceIdParamSchema } from '../validators/workspaceValidators';

const workspaceRepo = new WorkspaceRepository();

export const workspaceGuard = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User authentication required before workspace validation');
    }

    const workspaceId =
      req.params.workspaceId || (req.headers['x-workspace-id'] as string | undefined);

    if (!workspaceId) {
      throw new ValidationError('Workspace ID parameter or header is required');
    }

    const paramCheck = workspaceIdParamSchema.safeParse({ workspaceId });
    if (!paramCheck.success) {
      throw new ValidationError('Invalid workspace ID format');
    }

    const userRole = await workspaceRepo.findUserRole(workspaceId, req.user.userId);
    if (!userRole) {
      throw new ForbiddenError('You do not have access to this workspace');
    }

    next();
  } catch (err) {
    next(err);
  }
};

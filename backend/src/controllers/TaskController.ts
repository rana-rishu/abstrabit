import { Request, Response, NextFunction } from 'express';
import { TaskRepository } from '../repositories/TaskRepository';
import { ApiResponse } from '../dto/response.dto';
import { ValidationError, NotFoundError } from '../errors/AppError';
import { paginationQuerySchema } from '../dto/pagination.dto';
import {
  createTaskSchema,
  updateTaskStatusSchema,
  taskIdParamSchema,
} from '../validators/taskValidators';

export class TaskController {
  private taskRepo: TaskRepository;

  constructor(taskRepo?: TaskRepository) {
    this.taskRepo = taskRepo || new TaskRepository();
  }

  public listTasks = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const workspaceId = req.params.workspaceId;
      const queryValidation = paginationQuerySchema.safeParse(req.query);
      const { page, limit } = queryValidation.success
        ? queryValidation.data
        : { page: 1, limit: 100 };

      const status = req.query.status as any;
      const result = await this.taskRepo.listByWorkspace(workspaceId, status, page, limit);

      res.status(200).json(ApiResponse.success(result.data, result.meta, req.id));
    } catch (err) {
      next(err);
    }
  };

  public createTask = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const workspaceId = req.params.workspaceId;
      const validation = createTaskSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Invalid task input', validation.error.format());
      }

      const task = await this.taskRepo.create({
        workspace_id: workspaceId,
        title: validation.data.title.trim(),
        description: validation.data.description,
        priority: validation.data.priority,
        status: validation.data.status,
      });

      res.status(201).json(ApiResponse.success(task, undefined, req.id));
    } catch (err) {
      next(err);
    }
  };

  public updateTaskStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const paramValidation = taskIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        throw new ValidationError('Invalid workspace or task ID format', paramValidation.error.format());
      }

      const bodyValidation = updateTaskStatusSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        throw new ValidationError('Task status is required and must be valid', bodyValidation.error.format());
      }

      const { workspaceId, taskId } = paramValidation.data;
      const updatedTask = await this.taskRepo.updateStatus(taskId, workspaceId, bodyValidation.data.status);

      if (!updatedTask) {
        throw new NotFoundError('Task not found');
      }

      res.status(200).json(ApiResponse.success(updatedTask, undefined, req.id));
    } catch (err) {
      next(err);
    }
  };

  public deleteTask = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const paramValidation = taskIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        throw new ValidationError('Invalid workspace or task ID format', paramValidation.error.format());
      }

      const { workspaceId, taskId } = paramValidation.data;
      const deleted = await this.taskRepo.softDelete(taskId, workspaceId);

      if (!deleted) {
        throw new NotFoundError('Task not found');
      }

      res.status(200).json(ApiResponse.success({ success: true }, undefined, req.id));
    } catch (err) {
      next(err);
    }
  };
}

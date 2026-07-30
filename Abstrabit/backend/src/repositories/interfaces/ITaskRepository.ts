import { Task, TaskPriority, TaskStatus } from '../../models/task.model';
import { PaginatedResult } from '../../dto/pagination.dto';

export interface ITaskRepository {
  findById(id: string, workspaceId: string): Promise<Task | null>;
  listByWorkspace(
    workspaceId: string,
    status?: TaskStatus,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Task>>;
  create(data: {
    workspace_id: string;
    title: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
  }): Promise<Task>;
  updateStatus(id: string, workspaceId: string, status: TaskStatus): Promise<Task | null>;
  softDelete(id: string, workspaceId: string): Promise<boolean>;
}

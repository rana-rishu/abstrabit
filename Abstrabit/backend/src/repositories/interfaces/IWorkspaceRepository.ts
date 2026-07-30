import { Workspace, WorkspaceMemberRole } from '../../models/workspace.model';

export interface IWorkspaceRepository {
  findById(id: string): Promise<Workspace | null>;
  findByUserId(userId: string): Promise<Workspace[]>;
  create(data: { user_id: string; name: string; description?: string }): Promise<Workspace>;
  verifyOwnership(workspaceId: string, userId: string): Promise<boolean>;
  findUserRole(workspaceId: string, userId: string): Promise<WorkspaceMemberRole | null>;
}

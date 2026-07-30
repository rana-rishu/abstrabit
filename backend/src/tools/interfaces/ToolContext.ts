import { WorkspaceMemberRole } from '../../models/workspace.model';

export interface ToolContext {
  userId: string;
  workspaceId: string;
  requestId: string;
  userRole?: WorkspaceMemberRole;
}

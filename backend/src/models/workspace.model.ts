export type WorkspaceMemberRole = 'OWNER' | 'MEMBER' | 'VIEWER';

export interface Workspace {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceMemberRole;
  created_at: Date;
}

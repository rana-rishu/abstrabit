import { z } from 'zod';

export const workspaceIdParamSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID format'),
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters').max(100),
  description: z.string().max(255).optional(),
});

export type WorkspaceIdParam = z.infer<typeof workspaceIdParamSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

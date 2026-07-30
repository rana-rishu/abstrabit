import { z } from 'zod';
import { ToolContext } from './ToolContext';
import { ToolResult } from './ToolResult';
import { WorkspaceMemberRole } from '../../models/workspace.model';

export interface ITool<TInput = unknown> {
  name: string;
  description: string;
  version: string;
  category: 'TASK' | 'NOTIFICATION' | 'ANALYTICS';
  schema: z.ZodSchema<TInput>;
  requiredRole?: WorkspaceMemberRole;
  timeoutMs: number;

  validate(input: unknown): TInput;
  authorize(context: ToolContext): Promise<boolean>;
  execute(input: TInput, context: ToolContext): Promise<ToolResult>;
}

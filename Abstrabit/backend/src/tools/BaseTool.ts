import { z } from 'zod';
import { ITool } from './interfaces/ITool';
import { ToolContext } from './interfaces/ToolContext';
import { ToolResult } from './interfaces/ToolResult';
import { WorkspaceMemberRole } from '../models/workspace.model';
import { ToolValidationError, ToolAuthorizationError } from '../errors/ToolErrors';
import { WorkspaceRepository } from '../repositories/WorkspaceRepository';

export abstract class BaseTool<TInput = unknown> implements ITool<TInput> {
  public abstract name: string;
  public abstract description: string;
  public abstract version: string;
  public abstract category: 'TASK' | 'NOTIFICATION' | 'ANALYTICS';
  public abstract schema: z.ZodSchema<TInput>;
  public requiredRole?: WorkspaceMemberRole = 'MEMBER';
  public timeoutMs = 5000;

  private workspaceRepo = new WorkspaceRepository();

  public validate(input: unknown): TInput {
    const result = this.schema.safeParse(input);
    if (!result.success) {
      throw new ToolValidationError(
        `Validation failed for tool '${this.name}': ${result.error.message}`,
        result.error.format(),
      );
    }
    return result.data;
  }

  public async authorize(context: ToolContext): Promise<boolean> {
    const hasAccess = await this.workspaceRepo.verifyOwnership(
      context.workspaceId,
      context.userId,
    );

    if (!hasAccess) {
      throw new ToolAuthorizationError(
        `User ${context.userId} does not have access to workspace ${context.workspaceId}`,
      );
    }

    return true;
  }

  public abstract run(validatedInput: TInput, context: ToolContext): Promise<Record<string, unknown>>;

  public async execute(rawInput: unknown, context: ToolContext): Promise<ToolResult> {
    const t0 = Date.now();
    try {
      // 1. Validate Zod Schema
      const validatedInput = this.validate(rawInput);

      // 2. Authorize Workspace Credentials
      await this.authorize(context);

      // 3. Run Tool Logic with Timeout Race
      const executionPromise = this.run(validatedInput, context);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Tool ${this.name} execution timed out`)), this.timeoutMs),
      );

      const data = await Promise.race([executionPromise, timeoutPromise]);
      const executionMs = Date.now() - t0;

      return {
        success: true,
        toolName: this.name,
        data,
        executionMs,
      };
    } catch (err: unknown) {
      const executionMs = Date.now() - t0;
      const errorMessage = err instanceof Error ? err.message : 'Unknown tool error';
      return {
        success: false,
        toolName: this.name,
        error: errorMessage,
        executionMs,
      };
    }
  }
}

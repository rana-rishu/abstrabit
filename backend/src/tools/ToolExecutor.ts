import { ToolRegistry } from './ToolRegistry';
import { ToolContext } from './interfaces/ToolContext';
import { ToolResult } from './interfaces/ToolResult';
import { IToolLogRepository } from '../repositories/interfaces/IToolLogRepository';
import { ToolLogRepository } from '../repositories/ToolLogRepository';
import { logger } from '../utils/logger';

export class ToolExecutor {
  private registry: ToolRegistry;
  private logRepo: IToolLogRepository;

  constructor(registry?: ToolRegistry, logRepo?: IToolLogRepository) {
    this.registry = registry || new ToolRegistry();
    this.logRepo = logRepo || new ToolLogRepository();
  }

  public async executeTool(
    toolName: string,
    rawInput: unknown,
    context: ToolContext,
  ): Promise<ToolResult> {
    const t0 = Date.now();

    try {
      const tool = this.registry.getTool(toolName);
      const result = await tool.execute(rawInput, context);
      const executionMs = Date.now() - t0;

      // Persist audit log entry
      await this.logRepo.create({
        workspace_id: context.workspaceId,
        request_id: context.requestId,
        tool_name: toolName,
        input_args: (rawInput as Record<string, unknown>) || {},
        output_result: result.data,
        status: result.success ? 'SUCCESS' : 'FAILED',
        error_message: result.error,
        execution_ms: executionMs,
      });

      logger.info(
        {
          requestId: context.requestId,
          workspaceId: context.workspaceId,
          toolName,
          success: result.success,
          executionMs,
        },
        'Tool executed and audit log persisted',
      );

      return result;
    } catch (err: unknown) {
      const executionMs = Date.now() - t0;
      const errorMessage = err instanceof Error ? err.message : 'Unknown tool error';

      await this.logRepo.create({
        workspace_id: context.workspaceId,
        request_id: context.requestId,
        tool_name: toolName,
        input_args: (rawInput as Record<string, unknown>) || {},
        status: 'REJECTED',
        error_message: errorMessage,
        execution_ms: executionMs,
      });

      logger.warn(
        {
          requestId: context.requestId,
          workspaceId: context.workspaceId,
          toolName,
          err,
        },
        'Tool execution rejected or failed',
      );

      return {
        success: false,
        toolName,
        error: errorMessage,
        executionMs,
      };
    }
  }

  public getRegistry(): ToolRegistry {
    return this.registry;
  }
}

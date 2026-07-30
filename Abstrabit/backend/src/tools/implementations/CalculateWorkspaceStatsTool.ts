import { z } from 'zod';
import { BaseTool } from '../BaseTool';
import { ToolContext } from '../interfaces/ToolContext';
import { DocumentRepository } from '../../repositories/DocumentRepository';
import { ChunkRepository } from '../../repositories/ChunkRepository';
import { TaskRepository } from '../../repositories/TaskRepository';
import { TOOL_NAMES } from '../../constants/rag.constants';

const calculateStatsSchema = z.object({
  includeTasks: z.boolean().optional().default(true),
});

export type CalculateStatsInput = z.infer<typeof calculateStatsSchema>;

export class CalculateWorkspaceStatsTool extends BaseTool<CalculateStatsInput> {
  public name = TOOL_NAMES.CALCULATE_STATS;
  public description = 'Calculates total document count, vector chunk count, and active task count for the current workspace.';
  public version = '1.0.0';
  public category: 'ANALYTICS' = 'ANALYTICS';
  public schema = calculateStatsSchema as any;

  private docRepo = new DocumentRepository();
  private chunkRepo = new ChunkRepository();
  private taskRepo = new TaskRepository();

  public async run(input: CalculateStatsInput, context: ToolContext): Promise<Record<string, unknown>> {
    const documentCount = await this.docRepo.count(context.workspaceId);
    const chunkCount = await this.chunkRepo.countByWorkspace(context.workspaceId);
    const taskCount = input.includeTasks ? await this.taskRepo.count(context.workspaceId) : 0;

    return {
      workspaceId: context.workspaceId,
      documentCount,
      chunkCount,
      taskCount,
      calculatedAt: new Date().toISOString(),
      summary: `Workspace has ${documentCount} documents (${chunkCount} vector chunks) and ${taskCount} active tasks.`,
    };
  }
}

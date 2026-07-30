import { z } from 'zod';
import { BaseTool } from '../BaseTool';
import { ToolContext } from '../interfaces/ToolContext';
import { TaskRepository } from '../../repositories/TaskRepository';
import { TaskPriority, TaskStatus } from '../../models/task.model';
import { TOOL_NAMES } from '../../constants/rag.constants';

const saveTaskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters').max(200),
  description: z.string().max(500).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional().default('PENDING'),
});

export type SaveTaskInput = z.infer<typeof saveTaskSchema>;

export class SaveTaskTool extends BaseTool<SaveTaskInput> {
  public name = TOOL_NAMES.SAVE_TASK;
  public description = 'Saves an actionable task or note into the active workspace task board.';
  public version = '1.0.0';
  public category: 'TASK' = 'TASK';
  public schema = saveTaskSchema as any;

  private taskRepo = new TaskRepository();

  public async run(input: SaveTaskInput, context: ToolContext): Promise<Record<string, unknown>> {
    const task = await this.taskRepo.create({
      workspace_id: context.workspaceId,
      title: input.title,
      description: input.description,
      priority: input.priority as TaskPriority,
      status: input.status as TaskStatus,
    });

    return {
      taskId: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      message: `Task '${task.title}' saved successfully to workspace task board.`,
    };
  }
}

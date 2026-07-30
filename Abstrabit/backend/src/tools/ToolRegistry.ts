import { ITool } from './interfaces/ITool';
import { SaveTaskTool } from './implementations/SaveTaskTool';
import { SendWebhookTool } from './implementations/SendWebhookTool';
import { CalculateWorkspaceStatsTool } from './implementations/CalculateWorkspaceStatsTool';
import { ToolNotFoundError } from '../errors/ToolErrors';

export class ToolRegistry {
  private tools = new Map<string, ITool>();

  constructor() {
    this.registerDefaultTools();
  }

  public registerTool(tool: ITool): void {
    this.tools.set(tool.name, tool);
  }

  public getTool(name: string): ITool {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new ToolNotFoundError(`Requested tool '${name}' is not registered in the ToolRegistry.`);
    }
    return tool;
  }

  public listTools(): ITool[] {
    return Array.from(this.tools.values());
  }

  public getFunctionDeclarations(): Array<{ name: string; description: string }> {
    return this.listTools().map((t) => ({
      name: t.name,
      description: t.description,
    }));
  }

  private registerDefaultTools(): void {
    this.registerTool(new SaveTaskTool());
    this.registerTool(new SendWebhookTool());
    this.registerTool(new CalculateWorkspaceStatsTool());
  }
}

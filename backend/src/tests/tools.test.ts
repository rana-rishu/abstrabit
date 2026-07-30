import { ToolRegistry } from '../tools/ToolRegistry';
import { SaveTaskTool } from '../tools/implementations/SaveTaskTool';
import { SendWebhookTool } from '../tools/implementations/SendWebhookTool';
import { CalculateWorkspaceStatsTool } from '../tools/implementations/CalculateWorkspaceStatsTool';
import { ToolValidationError, ToolNotFoundError } from '../errors/ToolErrors';
import { ToolContext } from '../tools/interfaces/ToolContext';

describe('ToolRegistry Unit Tests', () => {
  it('should initialize default tools (save_task, send_webhook, calculate_workspace_stats)', () => {
    const registry = new ToolRegistry();
    const tools = registry.listTools();

    expect(tools.length).toBe(3);
    expect(registry.getTool('save_task')).toBeInstanceOf(SaveTaskTool);
    expect(registry.getTool('send_webhook')).toBeInstanceOf(SendWebhookTool);
    expect(registry.getTool('calculate_workspace_stats')).toBeInstanceOf(CalculateWorkspaceStatsTool);
  });

  it('should throw ToolNotFoundError when accessing unregistered tool', () => {
    const registry = new ToolRegistry();
    expect(() => registry.getTool('malicious_unregistered_tool')).toThrow(ToolNotFoundError);
  });
});

describe('SaveTaskTool Zod Validation Tests', () => {
  const tool = new SaveTaskTool();

  it('should validate and parse valid task payload', () => {
    const validPayload = {
      title: 'Deploy Q3 Production Release',
      description: 'Run deployment pipeline',
      priority: 'HIGH',
      status: 'PENDING',
    };

    const validated = tool.validate(validPayload);
    expect(validated.title).toBe(validPayload.title);
    expect(validated.priority).toBe('HIGH');
  });

  it('should throw ToolValidationError for invalid task payload', () => {
    const invalidPayload = {
      title: 'A', // Less than min 2 characters
      priority: 'INVALID_PRIORITY',
    };

    expect(() => tool.validate(invalidPayload)).toThrow(ToolValidationError);
  });
});

describe('SendWebhookTool Zod Validation Tests', () => {
  const tool = new SendWebhookTool();

  it('should validate valid webhook URL payload', () => {
    const payload = {
      webhook_url: 'https://discord.com/api/webhooks/123/xyz',
      title: 'Alert Summary',
      message: 'Workspace document count reached 50',
    };

    const validated = tool.validate(payload);
    expect(validated.webhook_url).toBe(payload.webhook_url);
  });

  it('should throw ToolValidationError for malformed webhook URL', () => {
    const payload = {
      webhook_url: 'not-a-valid-url',
      title: 'Test',
      message: 'Hello',
    };

    expect(() => tool.validate(payload)).toThrow(ToolValidationError);
  });
});

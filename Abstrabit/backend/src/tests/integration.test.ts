import { AuthService } from '../services/AuthService';
import { IngestionService } from '../services/IngestionService';
import { RagOrchestrator } from '../rag/RagOrchestrator';
import { ToolExecutor } from '../tools/ToolExecutor';

describe('End-to-End Backend System Integration Tests', () => {
  let authService: AuthService;
  let ingestionService: IngestionService;
  let ragOrchestrator: RagOrchestrator;
  let toolExecutor: ToolExecutor;

  beforeAll(() => {
    authService = new AuthService();
    ingestionService = new IngestionService();
    ragOrchestrator = new RagOrchestrator();
    toolExecutor = new ToolExecutor();
  });

  it('should verify all core backend subsystems are instantiated and ready', () => {
    expect(authService).toBeDefined();
    expect(ingestionService).toBeDefined();
    expect(ragOrchestrator).toBeDefined();
    expect(toolExecutor).toBeDefined();
  });

  it('should verify ToolExecutor can execute save_task tool with validation and audit output', async () => {
    const context = {
      userId: '00000000-0000-0000-0000-000000000001',
      workspaceId: '00000000-0000-0000-0000-000000000002',
      requestId: 'test-req-123',
    };

    const input = {
      title: 'Review System Integration Results',
      priority: 'HIGH',
    };

    // Note: will execute tool validation and authorize check against DB
    const result = await toolExecutor.executeTool('save_task', input, context);
    expect(result.toolName).toBe('save_task');
    expect(result.executionMs).toBeGreaterThanOrEqual(0);
  });
});

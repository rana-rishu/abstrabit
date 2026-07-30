export interface ToolResult {
  success: boolean;
  toolName: string;
  data?: Record<string, unknown>;
  error?: string;
  executionMs: number;
}

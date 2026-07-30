export type ToolExecutionStatus = 'SUCCESS' | 'FAILED' | 'REJECTED';

export interface ToolLog {
  id: string;
  workspace_id: string;
  request_id: string;
  tool_name: string;
  input_args: Record<string, unknown>;
  output_result?: Record<string, unknown> | null;
  status: ToolExecutionStatus;
  error_message?: string | null;
  execution_ms: number;
  created_at: Date;
}

import { ToolLog, ToolExecutionStatus } from '../../models/toolLog.model';
import { PaginatedResult } from '../../dto/pagination.dto';

export interface IToolLogRepository {
  create(data: {
    workspace_id: string;
    request_id: string;
    tool_name: string;
    input_args: Record<string, unknown>;
    output_result?: Record<string, unknown>;
    status: ToolExecutionStatus;
    error_message?: string;
    execution_ms: number;
  }): Promise<ToolLog>;
  listByWorkspace(
    workspaceId: string,
    toolName?: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<ToolLog>>;
}

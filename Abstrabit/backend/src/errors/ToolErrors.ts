import { AppError } from './AppError';

export class ToolValidationError extends AppError {
  constructor(message = 'Invalid tool argument payload', details?: unknown) {
    super(message, 400, 'TOOL_VALIDATION_FAILED', details);
  }
}

export class ToolAuthorizationError extends AppError {
  constructor(message = 'User unauthorized to execute this tool', details?: unknown) {
    super(message, 403, 'TOOL_UNAUTHORIZED', details);
  }
}

export class ToolExecutionError extends AppError {
  constructor(message = 'Tool execution encountered an internal error', details?: unknown) {
    super(message, 500, 'TOOL_EXECUTION_FAILED', details);
  }
}

export class ToolTimeoutError extends AppError {
  constructor(message = 'Tool execution exceeded timeout limit', details?: unknown) {
    super(message, 504, 'TOOL_TIMEOUT', details);
  }
}

export class ToolNotFoundError extends AppError {
  constructor(message = 'Requested tool is not registered', details?: unknown) {
    super(message, 404, 'TOOL_NOT_FOUND', details);
  }
}

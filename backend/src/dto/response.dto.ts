export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
  };
  requestId?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
  timestamp: string;
}

export class ApiResponse {
  public static success<T>(
    data: T,
    meta?: ApiSuccessResponse<T>['meta'],
    requestId?: string,
  ): ApiSuccessResponse<T> {
    return {
      success: true,
      data,
      ...(meta && { meta }),
      ...(requestId && { requestId }),
      timestamp: new Date().toISOString(),
    };
  }

  public static error(
    code: string,
    message: string,
    details?: unknown,
    requestId?: string,
  ): ApiErrorResponse {
    return {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
      ...(requestId && { requestId }),
      timestamp: new Date().toISOString(),
    };
  }
}

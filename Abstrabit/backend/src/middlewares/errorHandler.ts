import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ApiResponse } from '../dto/response.dto';
import { logger } from '../utils/logger';
import { env } from '../config/env.config';

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  const requestId = req.id;

  if (err instanceof AppError) {
    logger.warn(
      {
        requestId,
        statusCode: err.statusCode,
        errorCode: err.errorCode,
        message: err.message,
        details: err.details,
        path: req.originalUrl,
        method: req.method,
      },
      `AppError: ${err.message}`,
    );

    res
      .status(err.statusCode)
      .json(ApiResponse.error(err.errorCode, err.message, err.details, requestId));
    return;
  }

  // Handle Unhandled Errors (500)
  logger.error(
    {
      requestId,
      err: {
        message: err.message,
        stack: env.NODE_ENV === 'development' ? err.stack : undefined,
      },
      path: req.originalUrl,
      method: req.method,
    },
    'Unhandled Server Error',
  );

  const responseMessage =
    env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred.'
      : err.message || 'Internal Server Error';

  res
    .status(500)
    .json(
      ApiResponse.error(
        'INTERNAL_SERVER_ERROR',
        responseMessage,
        env.NODE_ENV === 'development' ? { stack: err.stack } : undefined,
        requestId,
      ),
    );
};

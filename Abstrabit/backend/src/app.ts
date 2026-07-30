import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.config';
import { correlationIdMiddleware } from './middlewares/correlationId';
import { globalRateLimiter } from './middlewares/rateLimiter';
import { globalErrorHandler } from './middlewares/errorHandler';
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import documentRoutes from './routes/documentRoutes';
import chatRoutes from './routes/chatRoutes';
import toolLogRoutes from './routes/toolLogRoutes';
import workspaceRoutes from './routes/workspaceRoutes';
import taskRoutes from './routes/taskRoutes';
import { ApiResponse } from './dto/response.dto';
import { logger } from './utils/logger';

export const createApp = (): Application => {
  const app: Application = express();

  // Security & Request Identification Middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(correlationIdMiddleware);
  app.use(globalRateLimiter);

  // Request Logging Middleware
  app.use((req: Request, _res: Response, next) => {
    logger.info(
      {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
      },
      `Incoming Request: ${req.method} ${req.originalUrl}`,
    );
    next();
  });

  // Health Monitoring API
  app.use('/health', healthRoutes);

  // Authentication API v1
  app.use('/api/v1/auth', authRoutes);

  // Workspace Management API v1
  app.use('/api/v1/workspaces', workspaceRoutes);

  // Document Ingestion API v1
  app.use('/api/v1/workspaces/:workspaceId/documents', documentRoutes);

  // RAG Chat API v1
  app.use('/api/v1/workspaces/:workspaceId/chat', chatRoutes);

  // Tool Call Audit Logs API v1
  app.use('/api/v1/workspaces/:workspaceId/tool-logs', toolLogRoutes);

  // Tasks Management API v1
  app.use('/api/v1/workspaces/:workspaceId/tasks', taskRoutes);

  // 404 Handler
  app.use((req: Request, res: Response) => {
    res
      .status(404)
      .json(
        ApiResponse.error('NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`, null, req.id),
      );
  });

  // Centralized Error Handling Middleware
  app.use(globalErrorHandler);

  return app;
};

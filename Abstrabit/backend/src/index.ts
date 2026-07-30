import { createApp } from './app';
import { env } from './config/env.config';
import { logger } from './utils/logger';
import { db } from './config/db.config';

const app = createApp();

const startServer = async () => {
  try {
    // Verify database connection at boot time
    const isDbUp = await db.checkConnection();
    if (!isDbUp) {
      logger.warn('⚠️ Server booting up without active PostgreSQL database connection.');
    } else {
      logger.info('✅ PostgreSQL Connection verified successfully.');
    }

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Abstrabit Backend API Server listening on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Initiating graceful server shutdown...`);
      server.close(() => {
        logger.info('HTTP Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (err) {
    logger.error({ err }, 'Failed to start backend server');
    process.exit(1);
  }
};

startServer();

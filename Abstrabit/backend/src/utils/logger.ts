import pino from 'pino';
import { env } from '../config/env.config';

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  base: {
    env: env.NODE_ENV,
  },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token', 'apiKey'],
    censor: '[REDACTED]',
  },
});

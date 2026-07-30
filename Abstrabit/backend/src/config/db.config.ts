import { Pool, QueryResult, QueryResultRow } from 'pg';
import { env } from './env.config';
import { logger } from '../utils/logger';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20, // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected error on idle PostgreSQL client');
});

export const db = {
  query: async <T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> => {
    const start = Date.now();
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    logger.debug({ text, duration, rows: res.rowCount }, 'Executed SQL Query');
    return res;
  },
  getClient: async () => {
    return await pool.connect();
  },
  checkConnection: async (): Promise<boolean> => {
    try {
      const res = await pool.query('SELECT 1 AS connected');
      return res.rows[0]?.connected === 1;
    } catch (err) {
      logger.error({ err }, 'PostgreSQL connection check failed');
      return false;
    }
  },
};

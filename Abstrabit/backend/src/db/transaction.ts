import { PoolClient } from 'pg';
import { pool } from '../config/db.config';
import { logger } from '../utils/logger';

export const runInTransaction = async <T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error({ err }, 'Transaction rolled back due to failure');
    throw err;
  } finally {
    client.release();
  }
};

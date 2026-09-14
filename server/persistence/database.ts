import pg from 'pg';
import { config } from '../config';

export const pool = config.DATABASE_URL ? new pg.Pool({ connectionString: config.DATABASE_URL, max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000 }) : null;

export async function withTenant<T>(companyId: string, operation: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  if (!pool) throw new Error('Persistent database is not configured');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.company_id', $1, true)", [companyId]);
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}


import fs from 'fs/promises';
import path from 'path';
import { pool } from './database';

if (!pool) throw new Error('DATABASE_URL is required to run migrations');
const sql = await fs.readFile(path.join(process.cwd(), 'server/persistence/migrations/001_initial.sql'), 'utf8');
await pool.query(sql);
await pool.end();
console.log('Database migration completed');


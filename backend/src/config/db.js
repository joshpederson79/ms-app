import pg from 'pg';
import { env } from './env.js';

// Pool connects lazily, so the server can boot (and serve /api/health) without a database.
export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : undefined,
});

export const query = (text, params) => pool.query(text, params);

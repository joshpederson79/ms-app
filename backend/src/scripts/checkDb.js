import { pool } from '../config/db.js';
import { env } from '../config/env.js';

// Usage: npm run db:check -w backend
if (!env.databaseUrl) {
  console.error('DATABASE_URL is not set. Copy backend/.env.example to backend/.env and fill it in.');
  process.exit(1);
}

try {
  const { rows } = await pool.query('SELECT NOW() AS now, current_database() AS db');
  console.log(`Connected to "${rows[0].db}" at ${rows[0].now.toISOString()}`);

  const tables = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  const found = tables.rows.map((r) => r.table_name);
  console.log(found.length ? `Tables: ${found.join(', ')}` : 'No tables yet. Run database/schema.sql.');
} catch (err) {
  console.error(`Connection failed: ${err.code || ''} ${err.message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}

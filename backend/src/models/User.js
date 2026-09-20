import { pool, query } from '../config/db.js';

const PUBLIC_COLUMNS = 'id, name, email, role, is_admin AS "isAdmin", created_at AS "createdAt"';

export const findByEmail = async (email) =>
  (await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])).rows[0];

export const findById = async (id) =>
  (await query(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`, [id])).rows[0];

export const count = async () => Number((await query('SELECT COUNT(*) FROM users')).rows[0].count);

// Claims the invite code and creates the user atomically. Returns null if the code is invalid/used.
// The first user to sign up becomes admin (can assign roles, manage invites).
export const createWithInvite = async ({ name, email, passwordHash, inviteCode }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const code = await client.query(
      'SELECT code FROM invite_codes WHERE code = $1 AND used_by IS NULL FOR UPDATE',
      [inviteCode]
    );
    if (!code.rows[0]) {
      await client.query('ROLLBACK');
      return null;
    }
    const total = Number((await client.query('SELECT COUNT(*) FROM users')).rows[0].count);
    const user = await client.query(
      `INSERT INTO users (name, email, password_hash, is_admin) VALUES ($1, $2, $3, $4)
       RETURNING ${PUBLIC_COLUMNS}`,
      [name, email.toLowerCase(), passwordHash, total === 0]
    );
    await client.query('UPDATE invite_codes SET used_by = $1 WHERE code = $2', [user.rows[0].id, inviteCode]);
    await client.query('COMMIT');
    return user.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const isInviteValid = async (code) =>
  Boolean((await query('SELECT 1 FROM invite_codes WHERE code = $1 AND used_by IS NULL', [code])).rows[0]);

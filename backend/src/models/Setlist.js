import { query } from '../config/db.js';

const SELECT = `
  SELECT s.id, s.name, s.created_by AS "createdBy", u.name AS "createdByName", s.created_at AS "createdAt",
         (SELECT COUNT(*) FROM setlist_items si WHERE si.setlist_id = s.id)::int AS "songCount"
  FROM setlists s LEFT JOIN users u ON u.id = s.created_by`;

export const list = async () => (await query(`${SELECT} ORDER BY lower(s.name), s.id`)).rows;

export const findById = async (id) => (await query(`${SELECT} WHERE s.id = $1`, [id])).rows[0];

export const create = async (name, userId) =>
  (await query('INSERT INTO setlists (name, created_by) VALUES ($1, $2) RETURNING id', [name, userId])).rows[0].id;

export const rename = (id, name) => query('UPDATE setlists SET name = $2 WHERE id = $1', [id, name]);

export const remove = (id) => query('DELETE FROM setlists WHERE id = $1', [id]);

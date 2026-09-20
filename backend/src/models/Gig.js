import { query } from '../config/db.js';
import { updateRow } from './sql.js';

// date/time are formatted in SQL so the driver doesn't turn them into timezone-shifted JS Dates.
const GIG_SELECT = `
  SELECT g.id, g.name, g.venue, to_char(g.date, 'YYYY-MM-DD') AS date, to_char(g.time, 'HH24:MI') AS time,
         g.created_at AS "createdAt",
         (SELECT COUNT(*) FROM setlist_items si WHERE si.gig_id = g.id)::int AS "songCount"
  FROM gigs g`;

const EDITABLE = ['name', 'venue', 'date', 'time'];

export const list = async () => (await query(`${GIG_SELECT} ORDER BY g.date, g.time NULLS LAST, g.id`)).rows;

export const findById = async (id) => (await query(`${GIG_SELECT} WHERE g.id = $1`, [id])).rows[0];

export const create = async ({ name, venue, date, time }, userId) =>
  (
    await query(
      'INSERT INTO gigs (name, venue, date, time, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name ?? null, venue, date, time ?? null, userId]
    )
  ).rows[0].id;

export const update = async (id, fields) => {
  await updateRow('gigs', id, fields, EDITABLE);
};

export const remove = async (id) => query('DELETE FROM gigs WHERE id = $1', [id]);

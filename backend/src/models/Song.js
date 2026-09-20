import { pool, query } from '../config/db.js';
import { updateRow } from './sql.js';
import * as Tab from './Tab.js';

const SONG_SELECT = `
  SELECT s.id, s.name, s.status, s.is_duet AS "isDuet", s.lyrics, s.songwriters,
         s.created_at AS "createdAt",
         s.lead_singer_id AS "leadSingerId", ls.name AS "leadSingerName",
         s.second_singer_id AS "secondSingerId", ss.name AS "secondSingerName",
         (SELECT COUNT(*) FROM tabs t WHERE t.song_id = s.id)::int AS "versionCount"
  FROM songs s
  LEFT JOIN users ls ON ls.id = s.lead_singer_id
  LEFT JOIN users ss ON ss.id = s.second_singer_id`;

const EDITABLE = ['name', 'status', 'lead_singer_id', 'second_singer_id', 'is_duet', 'songwriters', 'lyrics'];

export const list = async ({ singer, status, search }) =>
  (
    await query(
      `${SONG_SELECT}
       WHERE ($1::int IS NULL OR s.lead_singer_id = $1 OR s.second_singer_id = $1)
         AND ($2::text IS NULL OR s.status = $2)
         AND ($3::text IS NULL OR strpos(lower(s.name), lower($3)) > 0)
       ORDER BY lower(s.name)`,
      [singer ?? null, status ?? null, search ?? null]
    )
  ).rows;

export const findById = async (id) => (await query(`${SONG_SELECT} WHERE s.id = $1`, [id])).rows[0];

// Song and its first tab are saved together so a failed tab never leaves a tab-less song behind.
export const createWithTab = async (song, tabFields, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO songs (name, status, lead_singer_id, second_singer_id, is_duet, songwriters, lyrics)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [song.name, song.status, song.lead_singer_id, song.second_singer_id ?? null, song.is_duet, song.songwriters, song.lyrics ?? null]
    );
    if (tabFields) await Tab.createVersion(rows[0].id, tabFields, userId, client);
    await client.query('COMMIT');
    return rows[0].id;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const update = async (id, fields) => {
  await updateRow('songs', id, fields, EDITABLE);
};

export const remove = async (id) => query('DELETE FROM songs WHERE id = $1', [id]);

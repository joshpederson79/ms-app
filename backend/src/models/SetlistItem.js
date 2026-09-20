import { pool, query } from '../config/db.js';

export const forGig = async (gigId) =>
  (
    await query(
      `SELECT si.id, si.position, s.id AS "songId", s.name AS "songName", s.status, s.is_duet AS "isDuet",
              ls.name AS "leadSingerName", ss.name AS "secondSingerName"
       FROM setlist_items si
       JOIN songs s ON s.id = si.song_id
       LEFT JOIN users ls ON ls.id = s.lead_singer_id
       LEFT JOIN users ss ON ss.id = s.second_singer_id
       WHERE si.gig_id = $1 ORDER BY si.position`,
      [gigId]
    )
  ).rows;

export const hasSong = async (gigId, songId) =>
  Boolean((await query('SELECT 1 FROM setlist_items WHERE gig_id = $1 AND song_id = $2', [gigId, songId])).rows[0]);

export const add = async (gigId, songId) =>
  (
    await query(
      `INSERT INTO setlist_items (gig_id, song_id, position)
       VALUES ($1, $2, (SELECT COALESCE(MAX(position), 0) + 1 FROM setlist_items WHERE gig_id = $1))
       RETURNING id`,
      [gigId, songId]
    )
  ).rows[0].id;

// Rewrites positions 1..n to match the given id order.
const renumber = (client, orderedIds) =>
  client.query(
    `UPDATE setlist_items SET position = v.pos
     FROM unnest($1::int[], $2::int[]) AS v(id, pos) WHERE setlist_items.id = v.id`,
    [orderedIds, orderedIds.map((_, i) => i + 1)]
  );

// Runs fn(client, orderedIds) inside a transaction with the gig's items locked.
const withOrderedItems = async (gigId, fn) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT id FROM setlist_items WHERE gig_id = $1 ORDER BY position, id FOR UPDATE',
      [gigId]
    );
    const result = await fn(client, rows.map((r) => r.id));
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Returns false if the item isn't in this gig's setlist.
export const move = (gigId, itemId, newPosition) =>
  withOrderedItems(gigId, async (client, ids) => {
    const from = ids.indexOf(itemId);
    if (from === -1) return false;
    ids.splice(from, 1);
    ids.splice(Math.min(newPosition, ids.length + 1) - 1, 0, itemId);
    await renumber(client, ids);
    return true;
  });

export const remove = (gigId, itemId) =>
  withOrderedItems(gigId, async (client, ids) => {
    if (!ids.includes(itemId)) return false;
    await client.query('DELETE FROM setlist_items WHERE id = $1', [itemId]);
    await renumber(client, ids.filter((id) => id !== itemId));
    return true;
  });

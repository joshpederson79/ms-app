import { pool, query } from '../config/db.js';

// Items belong to a gig or to a saved setlist. The column name is picked from this fixed map
// (never from user input), so interpolating it into SQL is safe.
const OWNER_COLUMN = { gig: 'gig_id', setlist: 'setlist_id' };

export const forOwner = async (owner, ownerId) =>
  (
    await query(
      `SELECT si.id, si.position, s.id AS "songId", s.name AS "songName", s.status, s.is_duet AS "isDuet",
              ls.name AS "leadSingerName", ss.name AS "secondSingerName"
       FROM setlist_items si
       JOIN songs s ON s.id = si.song_id
       LEFT JOIN users ls ON ls.id = s.lead_singer_id
       LEFT JOIN users ss ON ss.id = s.second_singer_id
       WHERE si.${OWNER_COLUMN[owner]} = $1 ORDER BY si.position`,
      [ownerId]
    )
  ).rows;

// Everything the stage view needs in one request: each song with its latest tab.
export const stageEntries = async (owner, ownerId) =>
  (
    await query(
      `SELECT si.position, s.id AS "songId", s.name AS "songName", s.is_duet AS "isDuet",
              ls.name AS "leadSingerName", ss.name AS "secondSingerName",
              (SELECT to_jsonb(t) FROM (
                 SELECT id, version_number AS "versionNumber", capo, tuning, key, tempo, display_format AS "displayFormat"
                 FROM tabs WHERE song_id = s.id ORDER BY version_number DESC LIMIT 1
               ) t) AS tab
       FROM setlist_items si
       JOIN songs s ON s.id = si.song_id
       LEFT JOIN users ls ON ls.id = s.lead_singer_id
       LEFT JOIN users ss ON ss.id = s.second_singer_id
       WHERE si.${OWNER_COLUMN[owner]} = $1 ORDER BY si.position`,
      [ownerId]
    )
  ).rows;

export const hasSong = async (owner, ownerId, songId) =>
  Boolean(
    (await query(`SELECT 1 FROM setlist_items WHERE ${OWNER_COLUMN[owner]} = $1 AND song_id = $2`, [ownerId, songId])).rows[0]
  );

export const add = async (owner, ownerId, songId) => {
  const column = OWNER_COLUMN[owner];
  return (
    await query(
      `INSERT INTO setlist_items (${column}, song_id, position)
       VALUES ($1, $2, (SELECT COALESCE(MAX(position), 0) + 1 FROM setlist_items WHERE ${column} = $1))
       RETURNING id`,
      [ownerId, songId]
    )
  ).rows[0].id;
};

// Copies a saved setlist's songs onto the end of a gig's setlist. Skips songs already on the gig
// and songs no longer Final. Returns how many were added.
export const attachToGig = async (gigId, setlistId) => {
  const { rowCount } = await query(
    `INSERT INTO setlist_items (gig_id, song_id, position)
     SELECT $1, si.song_id,
            (SELECT COALESCE(MAX(position), 0) FROM setlist_items WHERE gig_id = $1) + ROW_NUMBER() OVER (ORDER BY si.position)
     FROM setlist_items si
     JOIN songs s ON s.id = si.song_id
     WHERE si.setlist_id = $2 AND s.status = 'Final'
       AND NOT EXISTS (SELECT 1 FROM setlist_items g WHERE g.gig_id = $1 AND g.song_id = si.song_id)`,
    [gigId, setlistId]
  );
  return rowCount;
};

// Rewrites positions 1..n to match the given id order.
const renumber = (client, orderedIds) =>
  client.query(
    `UPDATE setlist_items SET position = v.pos
     FROM unnest($1::int[], $2::int[]) AS v(id, pos) WHERE setlist_items.id = v.id`,
    [orderedIds, orderedIds.map((_, i) => i + 1)]
  );

// Runs fn(client, orderedIds) inside a transaction with the owner's items locked.
const withOrderedItems = async (owner, ownerId, fn) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT id FROM setlist_items WHERE ${OWNER_COLUMN[owner]} = $1 ORDER BY position, id FOR UPDATE`,
      [ownerId]
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

// Returns false if the item isn't in this setlist.
export const move = (owner, ownerId, itemId, newPosition) =>
  withOrderedItems(owner, ownerId, async (client, ids) => {
    const from = ids.indexOf(itemId);
    if (from === -1) return false;
    ids.splice(from, 1);
    ids.splice(Math.min(newPosition, ids.length + 1) - 1, 0, itemId);
    await renumber(client, ids);
    return true;
  });

export const remove = (owner, ownerId, itemId) =>
  withOrderedItems(owner, ownerId, async (client, ids) => {
    if (!ids.includes(itemId)) return false;
    await client.query('DELETE FROM setlist_items WHERE id = $1', [itemId]);
    await renumber(client, ids.filter((id) => id !== itemId));
    return true;
  });

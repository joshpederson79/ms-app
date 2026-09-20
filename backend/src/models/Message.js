import { query } from '../config/db.js';

const SELECT = `
  SELECT m.id, m.thread_id AS "threadId", m.content, m.sender_id AS "senderId", u.name AS "senderName",
         m.is_resolved AS "isResolved", m.created_at AS "createdAt",
         m.song_id AS "songId", s.name AS "songName",
         m.gig_id AS "gigId", g.venue AS "gigVenue", to_char(g.date, 'YYYY-MM-DD') AS "gigDate",
         (SELECT COUNT(*) FROM messages r WHERE r.thread_id = m.id)::int AS "replyCount",
         (SELECT MAX(r.created_at) FROM messages r WHERE r.thread_id = m.id) AS "lastReplyAt"
  FROM messages m
  JOIN users u ON u.id = m.sender_id
  LEFT JOIN songs s ON s.id = m.song_id
  LEFT JOIN gigs g ON g.id = m.gig_id`;

// Newest `limit` thread roots (older ones via the `before` id cursor), returned oldest-first for a chat timeline.
export const listRoots = async ({ song, gig, resolved, before, limit }) => {
  const { rows } = await query(
    `${SELECT}
     WHERE m.thread_id IS NULL
       AND ($1::int IS NULL OR m.song_id = $1)
       AND ($2::int IS NULL OR m.gig_id = $2)
       AND ($3::boolean IS NULL OR m.is_resolved = $3)
       AND ($4::int IS NULL OR m.id < $4)
     ORDER BY m.id DESC LIMIT $5`,
    [song ?? null, gig ?? null, resolved ?? null, before ?? null, limit + 1]
  );
  return { messages: rows.slice(0, limit).reverse(), hasMore: rows.length > limit };
};

export const findById = async (id) => (await query(`${SELECT} WHERE m.id = $1`, [id])).rows[0];

export const replies = async (threadId) =>
  (await query(`${SELECT} WHERE m.thread_id = $1 ORDER BY m.id`, [threadId])).rows;

// Replies point at their root through both thread_id and parent_message_id (threads are one level deep).
export const create = async ({ content, senderId, threadId, songId, gigId }) =>
  (
    await query(
      `INSERT INTO messages (content, sender_id, thread_id, parent_message_id, song_id, gig_id)
       VALUES ($1, $2, $3, $3, $4, $5) RETURNING id`,
      [content, senderId, threadId ?? null, songId ?? null, gigId ?? null]
    )
  ).rows[0].id;

export const setResolved = (id, value) => query('UPDATE messages SET is_resolved = $2 WHERE id = $1', [id, value]);

// Deleting a root removes its replies (ON DELETE CASCADE on thread_id).
export const remove = (id) => query('DELETE FROM messages WHERE id = $1', [id]);

import { query } from '../config/db.js';
import { updateRow } from './sql.js';

export const TAB_COLUMNS = `
  id, song_id AS "songId", version_number AS "versionNumber", capo, tuning, key, tempo,
  source_type AS "sourceType", source_url AS "sourceUrl", chordpro_source AS chordpro,
  display_format AS "displayFormat", created_by AS "createdBy", created_at AS "createdAt"`;

const EDITABLE = ['chordpro_source', 'display_format', 'key', 'tempo', 'capo', 'tuning', 'source_type', 'source_url'];

export const findById = async (id) =>
  (await query(`SELECT ${TAB_COLUMNS} FROM tabs WHERE id = $1`, [id])).rows[0];

export const latestForSong = async (songId) =>
  (await query(`SELECT ${TAB_COLUMNS} FROM tabs WHERE song_id = $1 ORDER BY version_number DESC LIMIT 1`, [songId]))
    .rows[0];

// Only major versions exist as rows; minor edits update a row in place.
export const versionsForSong = async (songId) =>
  (
    await query(
      `SELECT t.id, t.version_number AS "versionNumber", t.created_at AS "createdAt", u.name AS "createdByName"
       FROM tabs t LEFT JOIN users u ON u.id = t.created_by
       WHERE t.song_id = $1 ORDER BY t.version_number DESC`,
      [songId]
    )
  ).rows;

// Inserts the next major version. Callers pass column-named fields (see EDITABLE).
export const createVersion = async (songId, fields, userId, client = { query }) =>
  (
    await client.query(
      `INSERT INTO tabs (song_id, version_number, chordpro_source, display_format, key, tempo, capo, tuning,
                         source_type, source_url, created_by)
       VALUES ($1, (SELECT COALESCE(MAX(version_number), 0) + 1 FROM tabs WHERE song_id = $1),
               $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING ${TAB_COLUMNS}`,
      [
        songId, fields.chordpro_source, fields.display_format, fields.key ?? null, fields.tempo ?? null,
        fields.capo ?? null, fields.tuning ?? null, fields.source_type, fields.source_url ?? null, userId,
      ]
    )
  ).rows[0];

export const update = (id, fields) => updateRow('tabs', id, fields, EDITABLE, TAB_COLUMNS);

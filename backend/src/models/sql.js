import { query } from '../config/db.js';

// Builds a partial UPDATE from the provided fields. `table` and the column names come from
// code (the allowed list), never from user input, so interpolating them is safe.
export const updateRow = async (table, id, fields, allowed, returning = '*') => {
  const entries = Object.entries(fields).filter(([key, value]) => allowed.includes(key) && value !== undefined);
  if (entries.length === 0) return null;
  const sets = entries.map(([key], i) => `${key} = $${i + 1}`);
  const values = entries.map(([, value]) => value);
  const { rows } = await query(
    `UPDATE ${table} SET ${sets.join(', ')} WHERE id = $${entries.length + 1} RETURNING ${returning}`,
    [...values, id]
  );
  return rows[0];
};

import { HttpError } from '../middleware/errorHandler.js';

// Route ids are SERIAL ints; anything else can't exist, so report 404 rather than hitting the DB.
export const parseId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(404, 'Not found', 'not_found');
  return id;
};

import { z } from 'zod';
import { HttpError } from '../middleware/errorHandler.js';
import * as Gig from '../models/Gig.js';
import * as SetlistItem from '../models/SetlistItem.js';
import { parseId } from '../utils/parseId.js';

const isRealDate = (value) => new Date(`${value}T00:00:00Z`).toISOString().startsWith(value);

const gigFields = z.object({
  name: z.string().trim().max(255).nullish(),
  venue: z.string().trim().min(1, 'Venue is required').max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').refine(isRealDate, 'Not a real date'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM').nullish(),
});

export const createGigSchema = gigFields;
export const updateGigSchema = gigFields.partial();

// A blank name is the same as no name.
const clean = (body) => ({ ...body, ...(body.name !== undefined && { name: body.name || null }) });

const requireGig = async (id) => {
  const gig = await Gig.findById(id);
  if (!gig) throw new HttpError(404, 'Gig not found', 'not_found');
  return gig;
};

export const listGigs = async (req, res) => res.json(await Gig.list());

export const getGig = async (req, res) => {
  const gig = await requireGig(parseId(req.params.id));
  res.json({ ...gig, setlist: await SetlistItem.forGig(gig.id) });
};

export const createGig = async (req, res) => {
  const id = await Gig.create(clean(req.body), req.user.id);
  res.status(201).json(await Gig.findById(id));
};

export const updateGig = async (req, res) => {
  const id = parseId(req.params.id);
  await requireGig(id);
  await Gig.update(id, clean(req.body));
  res.json(await Gig.findById(id));
};

export const deleteGig = async (req, res) => {
  const gig = await requireGig(parseId(req.params.id));
  await Gig.remove(gig.id);
  res.status(204).end();
};

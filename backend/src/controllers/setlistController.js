import { z } from 'zod';
import { HttpError } from '../middleware/errorHandler.js';
import * as Gig from '../models/Gig.js';
import * as SetlistItem from '../models/SetlistItem.js';
import * as Song from '../models/Song.js';
import { parseId } from '../utils/parseId.js';

export const addItemSchema = z.object({ song_id: z.number().int() });
export const moveItemSchema = z.object({ position: z.number().int().min(1) });

const requireGig = async (id) => {
  if (!(await Gig.findById(id))) throw new HttpError(404, 'Gig not found', 'not_found');
};

export const getSetlist = async (req, res) => {
  const gigId = parseId(req.params.id);
  await requireGig(gigId);
  res.json(await SetlistItem.forGig(gigId));
};

export const addSetlistItem = async (req, res) => {
  const gigId = parseId(req.params.id);
  await requireGig(gigId);
  const song = await Song.findById(req.body.song_id);
  if (!song) throw new HttpError(404, 'Song not found', 'not_found');
  // WIP songs aren't gig-ready.
  if (song.status !== 'Final') throw new HttpError(400, 'Only Final songs can be added to a setlist', 'validation_error');
  if (await SetlistItem.hasSong(gigId, song.id)) throw new HttpError(409, 'That song is already in the setlist', 'duplicate');
  await SetlistItem.add(gigId, song.id);
  res.status(201).json(await SetlistItem.forGig(gigId));
};

export const updateSetlistItem = async (req, res) => {
  const gigId = parseId(req.params.id);
  await requireGig(gigId);
  if (!(await SetlistItem.move(gigId, parseId(req.params.itemId), req.body.position))) {
    throw new HttpError(404, 'Setlist item not found', 'not_found');
  }
  res.json(await SetlistItem.forGig(gigId));
};

export const removeSetlistItem = async (req, res) => {
  const gigId = parseId(req.params.id);
  await requireGig(gigId);
  if (!(await SetlistItem.remove(gigId, parseId(req.params.itemId)))) {
    throw new HttpError(404, 'Setlist item not found', 'not_found');
  }
  res.status(204).end();
};

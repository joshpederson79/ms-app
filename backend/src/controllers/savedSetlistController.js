import { z } from 'zod';
import { HttpError } from '../middleware/errorHandler.js';
import * as Setlist from '../models/Setlist.js';
import * as SetlistItem from '../models/SetlistItem.js';
import { parseId } from '../utils/parseId.js';
import { makeItemHandlers } from './setlistController.js';

export const nameSchema = z.object({ name: z.string().trim().min(1, 'Name is required').max(100) });

const requireSetlist = async (id) => {
  const setlist = await Setlist.findById(id);
  if (!setlist) throw new HttpError(404, 'Setlist not found', 'not_found');
  return setlist;
};

export const listSetlists = async (req, res) => res.json(await Setlist.list());

export const getSetlist = async (req, res) => {
  const setlist = await requireSetlist(parseId(req.params.id));
  res.json({ ...setlist, items: await SetlistItem.forOwner('setlist', setlist.id) });
};

export const createSetlist = async (req, res) => {
  const id = await Setlist.create(req.body.name, req.user.id);
  res.status(201).json(await Setlist.findById(id));
};

export const renameSetlist = async (req, res) => {
  const setlist = await requireSetlist(parseId(req.params.id));
  await Setlist.rename(setlist.id, req.body.name);
  res.json(await Setlist.findById(setlist.id));
};

// Anyone in the band can edit setlists, but only the creator (or an admin) can delete one.
export const deleteSetlist = async (req, res) => {
  const setlist = await requireSetlist(parseId(req.params.id));
  if (setlist.createdBy !== req.user.id && !req.user.isAdmin) {
    throw new HttpError(403, 'Only the creator can delete this setlist', 'forbidden');
  }
  await Setlist.remove(setlist.id);
  res.status(204).end();
};

export const getSetlistStage = async (req, res) => {
  const setlist = await requireSetlist(parseId(req.params.id));
  res.json({ title: setlist.name, entries: await SetlistItem.stageEntries('setlist', setlist.id) });
};

const items = makeItemHandlers('setlist', Setlist.findById, 'Setlist not found');
export const addItem = items.addItem;
export const moveItem = items.moveItem;
export const removeItem = items.removeItem;

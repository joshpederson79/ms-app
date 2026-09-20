import { z } from 'zod';
import { HttpError } from '../middleware/errorHandler.js';
import * as Gig from '../models/Gig.js';
import * as Setlist from '../models/Setlist.js';
import * as SetlistItem from '../models/SetlistItem.js';
import * as Song from '../models/Song.js';
import { parseId } from '../utils/parseId.js';

export const addItemSchema = z.object({ song_id: z.number().int() });
export const moveItemSchema = z.object({ position: z.number().int().min(1) });
export const attachSchema = z.object({ setlist_id: z.number().int() });

// The same song-list behaviour serves gig setlists and saved setlists; only the owner differs.
export const makeItemHandlers = (owner, findOwner, notFound) => {
  const requireOwner = async (id) => {
    if (!(await findOwner(id))) throw new HttpError(404, notFound, 'not_found');
  };

  return {
    getItems: async (req, res) => {
      const id = parseId(req.params.id);
      await requireOwner(id);
      res.json(await SetlistItem.forOwner(owner, id));
    },

    addItem: async (req, res) => {
      const id = parseId(req.params.id);
      await requireOwner(id);
      const song = await Song.findById(req.body.song_id);
      if (!song) throw new HttpError(404, 'Song not found', 'not_found');
      // WIP songs aren't gig-ready.
      if (song.status !== 'Final') throw new HttpError(400, 'Only Final songs can be added to a setlist', 'validation_error');
      if (await SetlistItem.hasSong(owner, id, song.id)) throw new HttpError(409, 'That song is already in the setlist', 'duplicate');
      await SetlistItem.add(owner, id, song.id);
      res.status(201).json(await SetlistItem.forOwner(owner, id));
    },

    moveItem: async (req, res) => {
      const id = parseId(req.params.id);
      await requireOwner(id);
      if (!(await SetlistItem.move(owner, id, parseId(req.params.itemId), req.body.position))) {
        throw new HttpError(404, 'Setlist item not found', 'not_found');
      }
      res.json(await SetlistItem.forOwner(owner, id));
    },

    removeItem: async (req, res) => {
      const id = parseId(req.params.id);
      await requireOwner(id);
      if (!(await SetlistItem.remove(owner, id, parseId(req.params.itemId)))) {
        throw new HttpError(404, 'Setlist item not found', 'not_found');
      }
      res.status(204).end();
    },
  };
};

const gigItems = makeItemHandlers('gig', Gig.findById, 'Gig not found');
export const getSetlist = gigItems.getItems;
export const addSetlistItem = gigItems.addItem;
export const updateSetlistItem = gigItems.moveItem;
export const removeSetlistItem = gigItems.removeItem;

// Copy a saved setlist's songs onto the gig (append; the saved setlist is untouched).
export const attachSetlist = async (req, res) => {
  const gigId = parseId(req.params.id);
  if (!(await Gig.findById(gigId))) throw new HttpError(404, 'Gig not found', 'not_found');
  const saved = await Setlist.findById(req.body.setlist_id);
  if (!saved) throw new HttpError(404, 'Setlist not found', 'not_found');

  const added = await SetlistItem.attachToGig(gigId, saved.id);
  res.json({ added, skipped: saved.songCount - added, setlist: await SetlistItem.forOwner('gig', gigId) });
};

export const getGigStage = async (req, res) => {
  const gig = await Gig.findById(parseId(req.params.id));
  if (!gig) throw new HttpError(404, 'Gig not found', 'not_found');
  res.json({ title: gig.venue, entries: await SetlistItem.stageEntries('gig', gig.id) });
};

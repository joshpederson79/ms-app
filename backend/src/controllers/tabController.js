import { z } from 'zod';
import { HttpError } from '../middleware/errorHandler.js';
import * as Song from '../models/Song.js';
import * as Tab from '../models/Tab.js';
import { parseChordPro } from '../utils/parseChordPro.js';
import { parseId } from '../utils/parseId.js';

export const tabSchema = z.object({
  chordpro: z.string().trim().min(1, 'Tab is empty').max(50000),
  key: z.string().trim().max(50).nullish(),
  tempo: z.number().int().min(20).max(400).nullish(),
  capo: z.number().int().min(0).max(12).nullish(),
  tuning: z.string().trim().max(50).nullish(),
  source_type: z.enum(['original', 'cover', 'ug_link', 'ug_file']).default('original'),
  source_url: z.string().trim().url().nullish(),
});

// PATCH: every field optional (zod skips defaults for omitted optional fields, so nothing gets reset).
export const updateTabSchema = tabSchema.partial();

// Maps validated request fields to tabs columns; the parsed chart is cached so views don't re-parse.
export const toTabFields = (body) => ({
  chordpro_source: body.chordpro,
  display_format: body.chordpro === undefined ? undefined : parseChordPro(body.chordpro),
  key: body.key,
  tempo: body.tempo,
  capo: body.capo,
  tuning: body.tuning,
  source_type: body.source_type,
  source_url: body.source_url,
});

const requireTab = async (id) => {
  const tab = await Tab.findById(id);
  if (!tab) throw new HttpError(404, 'Tab not found', 'not_found');
  return tab;
};

export const listTabs = async (req, res) => {
  const songId = parseId(req.params.id);
  if (!(await Song.findById(songId))) throw new HttpError(404, 'Song not found', 'not_found');
  res.json(await Tab.versionsForSong(songId));
};

// New major version (new arrangement).
export const createTab = async (req, res) => {
  const songId = parseId(req.params.id);
  if (!(await Song.findById(songId))) throw new HttpError(404, 'Song not found', 'not_found');
  res.status(201).json(await Tab.createVersion(songId, toTabFields(req.body), req.user.id));
};

export const getTab = async (req, res) => res.json(await requireTab(parseId(req.params.id)));

// Minor edit: updates the row in place, no new version.
export const updateTab = async (req, res) => {
  const id = parseId(req.params.id);
  await requireTab(id);
  const updated = await Tab.update(id, toTabFields(req.body));
  res.json(updated ?? (await Tab.findById(id)));
};

export const listTabVersions = async (req, res) => {
  const tab = await requireTab(parseId(req.params.id));
  res.json(await Tab.versionsForSong(tab.songId));
};

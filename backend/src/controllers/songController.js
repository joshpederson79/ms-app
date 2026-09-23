import { z } from 'zod';
import { HttpError } from '../middleware/errorHandler.js';
import * as Song from '../models/Song.js';
import * as Tab from '../models/Tab.js';
import * as User from '../models/User.js';
import { parseId } from '../utils/parseId.js';
import { tabSchema, toTabFields } from './tabController.js';

const songFields = z.object({
  name: z.string().trim().min(1).max(255),
  lead_singer_id: z.number().int(),
  is_duet: z.boolean().default(false),
  second_singer_id: z.number().int().nullish(),
  songwriters: z.array(z.number().int()), // required unless the tab marks the song as a cover (see createSongSchema)
  status: z.enum(['WIP', 'Final']),
  lyrics: z.string().max(20000).nullish(),
});

// Original songs need at least one credited songwriter; covers (tab source_type !== 'original') don't,
// since nobody in the band wrote them. No tab yet counts as "not a cover" (source_type defaults to 'original').
export const createSongSchema = songFields.extend({ tab: tabSchema.optional() }).superRefine((data, ctx) => {
  const isCover = data.tab && data.tab.source_type !== 'original';
  if (!isCover && data.songwriters.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['songwriters'], message: 'Pick at least one songwriter' });
  }
});
export const updateSongSchema = songFields.partial();

const listQuery = z.object({
  singer: z.coerce.number().int().optional(),
  status: z.enum(['WIP', 'Final']).optional(),
  search: z.string().trim().max(100).optional(),
});

// Songwriters own the lyrics and credits (admin can step in, e.g. to fix a wrong credit).
const ownsSong = (song, user) => song.songwriters.includes(user.id) || user.isAdmin;

// Duets need a distinct second singer; non-duets must not keep one.
const checkSingers = ({ lead_singer_id, is_duet, second_singer_id }) => {
  if (is_duet && (!second_singer_id || second_singer_id === lead_singer_id)) {
    throw new HttpError(400, 'A duet needs a second singer different from the lead', 'validation_error');
  }
};

const assertUsersExist = async (ids) => {
  const unique = [...new Set(ids.filter(Boolean))];
  if ((await User.namesByIds(unique)).length !== unique.length) {
    throw new HttpError(400, 'Unknown band member selected', 'validation_error');
  }
};

const requireSong = async (id) => {
  const song = await Song.findById(id);
  if (!song) throw new HttpError(404, 'Song not found', 'not_found');
  return song;
};

export const listSongs = async (req, res) => res.json(await Song.list(listQuery.parse(req.query)));

export const getSong = async (req, res) => {
  const song = await requireSong(parseId(req.params.id));
  const [songwriterList, latestTab, versions] = await Promise.all([
    User.namesByIds(song.songwriters),
    Tab.latestForSong(song.id),
    Tab.versionsForSong(song.id),
  ]);
  res.json({ ...song, songwriterList, latestTab: latestTab ?? null, versions });
};

export const createSong = async (req, res) => {
  const { tab, ...song } = req.body;
  checkSingers(song);
  const secondSingerId = song.is_duet ? song.second_singer_id : null;
  await assertUsersExist([song.lead_singer_id, secondSingerId, ...song.songwriters]);
  const id = await Song.createWithTab(
    { ...song, second_singer_id: secondSingerId },
    tab ? toTabFields(tab) : null,
    req.user.id
  );
  res.status(201).json(await Song.findById(id));
};

export const updateSong = async (req, res) => {
  const id = parseId(req.params.id);
  const song = await requireSong(id);
  const changes = { ...req.body };

  // Whether this is a cover decides two things below: who may edit lyrics, and whether songwriters can be
  // cleared entirely. A song with no tab yet is treated as not-a-cover (same default as creation).
  const latestTab =
    changes.lyrics !== undefined || changes.songwriters !== undefined ? await Tab.latestForSong(id) : null;
  const isCover = Boolean(latestTab && latestTab.sourceType !== 'original');

  // Lyrics: owner-only for originals. Open to anyone for covers, since the actual writer isn't a band
  // member, so there may be no owner at all to lock the field to.
  if (changes.lyrics !== undefined && !isCover && !ownsSong(song, req.user)) {
    throw new HttpError(403, 'Only the song writer can edit lyrics', 'forbidden');
  }
  // Credits stay owner-only regardless of cover status.
  if (changes.songwriters !== undefined && !ownsSong(song, req.user)) {
    throw new HttpError(403, 'Only the song writer can edit credits', 'forbidden');
  }
  if (changes.songwriters?.length === 0 && !isCover) {
    throw new HttpError(400, 'Pick at least one songwriter', 'validation_error');
  }

  const merged = {
    lead_singer_id: changes.lead_singer_id ?? song.leadSingerId,
    is_duet: changes.is_duet ?? song.isDuet,
    second_singer_id: changes.second_singer_id === undefined ? song.secondSingerId : changes.second_singer_id,
  };
  checkSingers(merged);
  if (!merged.is_duet) changes.second_singer_id = null;
  await assertUsersExist([merged.lead_singer_id, merged.second_singer_id, ...(changes.songwriters ?? [])]);

  await Song.update(id, changes);
  res.json(await Song.findById(id));
};

export const deleteSong = async (req, res) => {
  const song = await requireSong(parseId(req.params.id));
  if (!ownsSong(song, req.user)) throw new HttpError(403, 'Only the song writer can delete a song', 'forbidden');
  await Song.remove(song.id);
  res.status(204).end();
};

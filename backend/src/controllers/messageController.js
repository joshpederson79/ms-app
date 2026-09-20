import { z } from 'zod';
import { HttpError } from '../middleware/errorHandler.js';
import * as Gig from '../models/Gig.js';
import * as Message from '../models/Message.js';
import * as Song from '../models/Song.js';
import { parseId } from '../utils/parseId.js';

export const createMessageSchema = z
  .object({
    content: z.string().trim().min(1, 'Message is empty').max(5000),
    thread_id: z.number().int().nullish(), // set => this is a reply
    song_id: z.number().int().nullish(),
    gig_id: z.number().int().nullish(),
  })
  .refine((m) => !(m.song_id && m.gig_id), 'Tag a song or a gig, not both');

export const resolveSchema = z.object({ is_resolved: z.boolean() });

const listQuery = z.object({
  song: z.coerce.number().int().optional(),
  gig: z.coerce.number().int().optional(),
  resolved: z.enum(['true', 'false']).optional().transform((v) => (v === undefined ? undefined : v === 'true')),
  before: z.coerce.number().int().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const requireRoot = async (id) => {
  const message = await Message.findById(id);
  if (!message || message.threadId !== null) throw new HttpError(404, 'Thread not found', 'not_found');
  return message;
};

export const listMessages = async (req, res) => res.json(await Message.listRoots(listQuery.parse(req.query)));

export const createMessage = async (req, res) => {
  const { content, thread_id, song_id, gig_id } = req.body;
  let tags = {};

  if (thread_id) {
    await requireRoot(thread_id); // replies always attach to a thread root
  } else {
    if (song_id && !(await Song.findById(song_id))) throw new HttpError(400, 'Unknown song', 'validation_error');
    if (gig_id && !(await Gig.findById(gig_id))) throw new HttpError(400, 'Unknown gig', 'validation_error');
    tags = { songId: song_id, gigId: gig_id };
  }

  const id = await Message.create({ content, senderId: req.user.id, threadId: thread_id, ...tags });
  res.status(201).json(await Message.findById(id));
};

export const getThread = async (req, res) => {
  const root = await requireRoot(parseId(req.params.threadId));
  res.json({ ...root, replies: await Message.replies(root.id) });
};

// Anyone in the band can resolve or reopen a thread.
export const updateMessage = async (req, res) => {
  const root = await requireRoot(parseId(req.params.id));
  await Message.setResolved(root.id, req.body.is_resolved);
  res.json(await Message.findById(root.id));
};

export const deleteMessage = async (req, res) => {
  const message = await Message.findById(parseId(req.params.id));
  if (!message) throw new HttpError(404, 'Message not found', 'not_found');
  if (message.senderId !== req.user.id && !req.user.isAdmin) {
    throw new HttpError(403, 'You can only delete your own messages', 'forbidden');
  }
  await Message.remove(message.id);
  res.status(204).end();
};

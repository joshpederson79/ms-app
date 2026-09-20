import { z } from 'zod';
import { HttpError } from '../middleware/errorHandler.js';
import * as User from '../models/User.js';
import { parseId } from '../utils/parseId.js';

export const roleSchema = z.object({ role: z.enum(['member', 'gig_lead', 'songwriter']) });

// Feeds the singer/songwriter pickers and the admin role manager.
export const listUsers = async (req, res) => res.json(await User.listMembers());

export const updateRole = async (req, res) => {
  const user = await User.setRole(parseId(req.params.id), req.body.role);
  if (!user) throw new HttpError(404, 'User not found', 'not_found');
  res.json(user);
};

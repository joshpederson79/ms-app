import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { HttpError } from '../middleware/errorHandler.js';
import * as User from '../models/User.js';

export const signupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
  invite_code: z.string().trim().min(1),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const inviteSchema = z.object({ invite_code: z.string().trim().min(1) });

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role, isAdmin: user.isAdmin }, env.jwtSecret, { expiresIn: env.jwtExpiration });

export const signup = async (req, res) => {
  const { name, email, password, invite_code } = req.body;
  if (await User.findByEmail(email)) throw new HttpError(409, 'Email already registered', 'email_taken');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.createWithInvite({ name, email, passwordHash, inviteCode: invite_code });
  if (!user) throw new HttpError(400, 'Invalid or already-used invite code', 'invalid_invite');
  res.status(201).json({ token: signToken(user), user });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const row = await User.findByEmail(email);
  // Same message for unknown email and bad password to avoid leaking which emails exist.
  if (!row || !(await bcrypt.compare(password, row.password_hash))) {
    throw new HttpError(401, 'Invalid email or password', 'invalid_credentials');
  }
  const user = await User.findById(row.id);
  res.json({ token: signToken(user), user });
};

// Used by the onboarding welcome screen before sign-up; `name` pre-fills the sign-up form.
export const checkInvite = async (req, res) => {
  const invite = await User.findOpenInvite(req.body.invite_code);
  res.json({ valid: Boolean(invite), name: invite?.name ?? null });
};

export const verifyToken = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new HttpError(401, 'User no longer exists', 'unauthorized');
  res.json({ user, exp: req.user.exp });
};

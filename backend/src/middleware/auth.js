import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import * as User from '../models/User.js';
import { HttpError } from './errorHandler.js';

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new HttpError(401, 'Missing token', 'unauthorized'));
  try {
    req.user = jwt.verify(token, env.jwtSecret);
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired token', 'unauthorized'));
  }
};

// Role checks read the current role from the database, not the JWT, so an admin's role
// change takes effect immediately instead of after the member's token (7 days) expires.
const check = (allows) => async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !allows(user)) throw new HttpError(403, 'Insufficient permissions', 'forbidden');
    next();
  } catch (err) {
    next(err);
  }
};

export const requireRole = (...roles) => check((user) => user.isAdmin || roles.includes(user.role));
export const requireAdmin = check((user) => user.isAdmin);

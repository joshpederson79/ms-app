import { Router } from 'express';
import { wrap } from './asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import * as c from '../controllers/authController.js';

const router = Router();

router.post('/signup', validate(c.signupSchema), wrap(c.signup));
router.post('/login', validate(c.loginSchema), wrap(c.login));
router.post('/check-invite', validate(c.inviteSchema), wrap(c.checkInvite));
router.post('/logout', (req, res) => res.status(204).end()); // stateless JWT: client clears the token
router.post('/verify-token', requireAuth, wrap(c.verifyToken));

export default router;

import { Router } from 'express';
import { wrap } from './asyncHandler.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as users from '../controllers/userController.js';

const router = Router();
router.use(requireAuth);

router.get('/', wrap(users.listUsers));
router.patch('/:id/role', requireAdmin, validate(users.roleSchema), wrap(users.updateRole));

export default router;

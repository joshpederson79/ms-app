import { Router } from 'express';
import { wrap } from './asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import * as comments from '../controllers/commentController.js';

const router = Router();
router.use(requireAuth);

router.patch('/:id', wrap(comments.updateComment)); // resolve/unresolve
router.delete('/:id', wrap(comments.deleteComment));

export default router;

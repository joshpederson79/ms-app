import { Router } from 'express';
import { wrap } from './asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import * as messages from '../controllers/messageController.js';

const router = Router();
router.use(requireAuth);

router.get('/', wrap(messages.listMessages)); // ?search=&resolved=
router.post('/', wrap(messages.createMessage));
router.get('/:threadId', wrap(messages.getThread));
router.patch('/:id', wrap(messages.updateMessage));
router.delete('/:id', wrap(messages.deleteMessage));

export default router;

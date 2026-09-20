import { Router } from 'express';
import { wrap } from './asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as messages from '../controllers/messageController.js';

const router = Router();
router.use(requireAuth);

router.get('/', wrap(messages.listMessages)); // thread roots: ?song=&gig=&resolved=&before=&limit=
router.post('/', validate(messages.createMessageSchema), wrap(messages.createMessage)); // root, or reply if thread_id
router.get('/:threadId', wrap(messages.getThread));
router.patch('/:id', validate(messages.resolveSchema), wrap(messages.updateMessage)); // resolve/reopen
router.delete('/:id', wrap(messages.deleteMessage));

export default router;

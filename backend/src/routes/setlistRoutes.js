import { Router } from 'express';
import { wrap } from './asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as saved from '../controllers/savedSetlistController.js';
import { addItemSchema, moveItemSchema } from '../controllers/setlistController.js';

const router = Router();
router.use(requireAuth);

// Any band member can build and edit saved setlists; attaching one to a gig is a Gig Lead action (gigRoutes).
router.get('/', wrap(saved.listSetlists));
router.post('/', validate(saved.nameSchema), wrap(saved.createSetlist));
router.get('/:id', wrap(saved.getSetlist));
router.patch('/:id', validate(saved.nameSchema), wrap(saved.renameSetlist));
router.delete('/:id', wrap(saved.deleteSetlist)); // creator or admin
router.get('/:id/stage', wrap(saved.getSetlistStage)); // every song with its latest tab, for stage view / offline

router.post('/:id/items', validate(addItemSchema), wrap(saved.addItem));
router.patch('/:id/items/:itemId', validate(moveItemSchema), wrap(saved.moveItem));
router.delete('/:id/items/:itemId', wrap(saved.removeItem));

export default router;

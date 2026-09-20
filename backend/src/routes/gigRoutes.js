import { Router } from 'express';
import { wrap } from './asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as gigs from '../controllers/gigController.js';
import * as setlist from '../controllers/setlistController.js';

const router = Router();
router.use(requireAuth);

const gigLead = requireRole('gig_lead'); // admins pass too

router.get('/', wrap(gigs.listGigs));
router.post('/', gigLead, validate(gigs.createGigSchema), wrap(gigs.createGig));
router.get('/:id', wrap(gigs.getGig));
router.patch('/:id', gigLead, validate(gigs.updateGigSchema), wrap(gigs.updateGig));
router.delete('/:id', gigLead, wrap(gigs.deleteGig));

// Setlist: only Final songs may be added (enforced in the controller).
router.get('/:id/setlist', wrap(setlist.getSetlist));
router.post('/:id/setlist', gigLead, validate(setlist.addItemSchema), wrap(setlist.addSetlistItem));
router.patch('/:id/setlist/:itemId', gigLead, validate(setlist.moveItemSchema), wrap(setlist.updateSetlistItem)); // reorder
router.delete('/:id/setlist/:itemId', gigLead, wrap(setlist.removeSetlistItem));

export default router;

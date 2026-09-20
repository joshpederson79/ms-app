import { Router } from 'express';
import { wrap } from './asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as gigs from '../controllers/gigController.js';
import * as setlist from '../controllers/setlistController.js';

const router = Router();
router.use(requireAuth);

const gigLead = requireRole('gig_lead');

router.get('/', wrap(gigs.listGigs));
router.post('/', gigLead, wrap(gigs.createGig));
router.get('/:id', wrap(gigs.getGig));
router.patch('/:id', gigLead, wrap(gigs.updateGig));
router.delete('/:id', gigLead, wrap(gigs.deleteGig));

// Setlist: only Final songs may be added (enforce in controller).
router.get('/:id/setlist', wrap(setlist.getSetlist));
router.post('/:id/setlist', gigLead, wrap(setlist.addSetlistItem));
router.patch('/:id/setlist/:itemId', gigLead, wrap(setlist.updateSetlistItem)); // reorder
router.delete('/:id/setlist/:itemId', gigLead, wrap(setlist.removeSetlistItem));

export default router;

import { Router } from 'express';
import { wrap } from './asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as songs from '../controllers/songController.js';
import * as tabs from '../controllers/tabController.js';

const router = Router();
router.use(requireAuth);

router.get('/', wrap(songs.listSongs)); // ?singer=&status=&search=
router.post('/', validate(songs.createSongSchema), wrap(songs.createSong)); // song + optional first tab
router.get('/:id', wrap(songs.getSong));
router.patch('/:id', validate(songs.updateSongSchema), wrap(songs.updateSong));
router.delete('/:id', wrap(songs.deleteSong)); // songwriters only

router.get('/:id/tabs', wrap(tabs.listTabs));
router.post('/:id/tabs', validate(tabs.tabSchema), wrap(tabs.createTab)); // new major version

export default router;

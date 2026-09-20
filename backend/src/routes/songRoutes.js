import { Router } from 'express';
import { wrap } from './asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import * as songs from '../controllers/songController.js';
import * as tabs from '../controllers/tabController.js';
import { upload } from '../middleware/upload.js';

const router = Router();
router.use(requireAuth);

router.get('/', wrap(songs.listSongs)); // ?singer=&status=&search=
router.post('/', wrap(songs.createSong));
router.get('/:id', wrap(songs.getSong));
router.patch('/:id', wrap(songs.updateSong));
router.delete('/:id', wrap(songs.deleteSong)); // songwriters only

router.get('/:id/tabs', wrap(tabs.listTabs));
router.post('/:id/tabs', upload.single('file'), wrap(tabs.createTab)); // parses ChordPro via utils/parseChordPro.js

export default router;

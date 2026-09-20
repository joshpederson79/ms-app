import { Router } from 'express';
import { wrap } from './asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import * as tabs from '../controllers/tabController.js';
import * as recordings from '../controllers/recordingController.js';
import * as comments from '../controllers/commentController.js';

const router = Router();
router.use(requireAuth);

router.get('/:id', wrap(tabs.getTab));
router.patch('/:id', validate(tabs.updateTabSchema), wrap(tabs.updateTab)); // minor edit, in place
router.get('/:id/versions', wrap(tabs.listTabVersions));

router.post('/:id/recording', upload.single('file'), wrap(recordings.uploadRecording)); // file or YouTube link
router.get('/:id/recording', wrap(recordings.getRecording));
router.delete('/:id/recording', wrap(recordings.deleteRecording));

router.get('/:id/comments', wrap(comments.listComments));
router.post('/:id/comments', wrap(comments.createComment));

export default router;

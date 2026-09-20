import { Router } from 'express';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
import songRoutes from './songRoutes.js';
import tabRoutes from './tabRoutes.js';
import commentRoutes from './commentRoutes.js';
import gigRoutes from './gigRoutes.js';
import messageRoutes from './messageRoutes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/songs', songRoutes);
router.use('/tabs', tabRoutes);
router.use('/comments', commentRoutes);
router.use('/gigs', gigRoutes);
router.use('/messages', messageRoutes);

export default router;

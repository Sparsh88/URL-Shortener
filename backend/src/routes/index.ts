import { Router } from 'express';
import authRoutes from './authRoutes';
import urlRoutes from './urlRoutes';
import analyticsRoutes from './analyticsRoutes';
import userRoutes from './userRoutes';
import adminRoutes from './adminRoutes';
import apiKeyRoutes from './apiKeyRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/urls', urlRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/api-keys', apiKeyRoutes);

export default router;

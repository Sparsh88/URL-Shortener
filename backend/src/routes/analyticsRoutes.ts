import { Router } from 'express';
import { getUrlAnalytics, getOverallAnalytics } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/overview', authenticate, getOverallAnalytics);
router.get('/url/:id', authenticate, getUrlAnalytics);

export default router;

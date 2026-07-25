import { Router } from 'express';
import { handleRedirect } from '../controllers/redirectController';

const router = Router();

router.get('/:shortCode', handleRedirect);

export default router;

import { Router } from 'express';
import { createApiKey, getApiKeys, deleteApiKey } from '../controllers/apiKeyController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createApiKey);
router.get('/', getApiKeys);
router.delete('/:id', deleteApiKey);

export default router;

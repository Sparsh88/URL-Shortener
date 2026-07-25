import { Router } from 'express';
import {
  updateProfile,
  getFolders,
  createFolder,
  deleteFolder,
  getTags,
  createTag,
  deleteTag,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.put('/profile', updateProfile);

router.get('/folders', getFolders);
router.post('/folders', createFolder);
router.delete('/folders/:id', deleteFolder);

router.get('/tags', getTags);
router.post('/tags', createTag);
router.delete('/tags/:id', deleteTag);

export default router;

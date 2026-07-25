import { Router } from 'express';
import {
  getAdminStats,
  getUsers,
  toggleUserSuspension,
  toggleUserVerification,
  updateUserRole,
  deleteUser,
  getUserLinks,
} from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.get('/users/:id/links', getUserLinks);
router.put('/users/:id/suspend', toggleUserSuspension);
router.put('/users/:id/verify', toggleUserVerification);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;

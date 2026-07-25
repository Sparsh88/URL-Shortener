import { Router } from 'express';
import {
  createShortUrl,
  getUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
  bulkDeleteUrls,
  bulkImportUrls,
  verifyUrlPassword,
} from '../controllers/urlController';
import { authenticate } from '../middleware/auth';
import { shortenLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/shorten', shortenLimiter, (req, res, next) => {
  // Allow anonymous shortening or auth user shortening
  const authHeader = req.headers.authorization || req.headers['x-api-key'];
  if (authHeader) {
    return authenticate(req, res, next);
  }
  next();
}, createShortUrl);

router.get('/', authenticate, getUrls);
router.get('/:id', authenticate, getUrlById);
router.put('/:id', authenticate, updateUrl);
router.delete('/:id', authenticate, deleteUrl);

router.post('/bulk-delete', authenticate, bulkDeleteUrls);
router.post('/bulk-import', authenticate, bulkImportUrls);
router.post('/verify-password', verifyUrlPassword);

export default router;

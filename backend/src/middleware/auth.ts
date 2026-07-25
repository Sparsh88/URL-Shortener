import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { sendError } from '../utils/response';
import { ApiKey } from '../models/ApiKey';
import { User } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'user' | 'admin';
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // 1. Check Bearer Token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      return next();
    }

    // 2. Check X-API-KEY header (Developer API)
    const apiKeyHeader = req.headers['x-api-key'] as string;
    if (apiKeyHeader) {
      const apiKeyDoc = await ApiKey.findOne({ key: apiKeyHeader });
      if (apiKeyDoc) {
        const userDoc = await User.findById(apiKeyDoc.userId);
        if (userDoc && !userDoc.isSuspended) {
          apiKeyDoc.lastUsed = new Date();
          await apiKeyDoc.save();

          req.user = {
            userId: userDoc._id.toString(),
            email: userDoc.email,
            role: userDoc.role,
          };
          return next();
        }
      }
      return sendError(res, 'Invalid or revoked API Key', 401);
    }

    return sendError(res, 'Authorization token or API key required', 401);
  } catch (error) {
    return sendError(res, 'Invalid or expired access token', 401);
  }
};

export const requireRole = (role: 'user' | 'admin') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }
    if (role === 'admin' && req.user.role !== 'admin') {
      return sendError(res, 'Forbidden: Admin access required', 403);
    }
    next();
  };
};

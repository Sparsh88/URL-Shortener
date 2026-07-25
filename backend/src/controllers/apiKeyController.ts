import { Response } from 'express';
import { ApiKey } from '../models/ApiKey';
import { generateApiKey } from '../utils/nanoid';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const createApiKey = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { name } = req.body;
    if (!name) return sendError(res, 'Key name is required', 400);

    const key = generateApiKey();
    const apiKeyDoc = await ApiKey.create({
      name: name.trim(),
      key,
      userId: req.user?.userId,
    });

    return sendSuccess(res, apiKeyDoc, 'API Key generated successfully', 201);
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const getApiKeys = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const keys = await ApiKey.find({ userId: req.user?.userId }).sort({ createdAt: -1 });
    return sendSuccess(res, keys);
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const deleteApiKey = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    await ApiKey.findOneAndDelete({ _id: id, userId: req.user?.userId });
    return sendSuccess(res, null, 'API Key revoked successfully');
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

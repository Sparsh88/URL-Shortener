import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Folder } from '../models/Folder';
import { Tag } from '../models/Tag';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { name, avatar, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?.userId).select('+password');

    if (!user) return sendError(res, 'User not found', 404);

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    if (newPassword) {
      if (!currentPassword || !user.password) {
        return sendError(res, 'Current password is required to set new password', 400);
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return sendError(res, 'Current password is incorrect', 400);
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    return sendSuccess(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    }, 'Profile updated successfully');
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

// Folders
export const getFolders = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const folders = await Folder.find({ userId: req.user?.userId }).sort({ name: 1 }).lean();
    return sendSuccess(res, folders);
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const createFolder = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { name, color } = req.body;
    if (!name) return sendError(res, 'Folder name is required', 400);

    const folder = await Folder.create({
      name,
      color: color || '#6366F1',
      userId: req.user?.userId,
    });

    return sendSuccess(res, folder, 'Folder created', 201);
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const deleteFolder = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    await Folder.findOneAndDelete({ _id: id, userId: req.user?.userId });
    return sendSuccess(res, null, 'Folder deleted');
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

// Tags
export const getTags = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const tags = await Tag.find({ userId: req.user?.userId }).sort({ name: 1 }).lean();
    return sendSuccess(res, tags);
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const createTag = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { name, color } = req.body;
    if (!name) return sendError(res, 'Tag name is required', 400);

    const tag = await Tag.create({
      name,
      color: color || '#3B82F6',
      userId: req.user?.userId,
    });

    return sendSuccess(res, tag, 'Tag created', 201);
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const deleteTag = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    await Tag.findOneAndDelete({ _id: id, userId: req.user?.userId });
    return sendSuccess(res, null, 'Tag deleted');
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

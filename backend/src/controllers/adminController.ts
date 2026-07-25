import { Response } from 'express';
import { User } from '../models/User';
import { Url } from '../models/Url';
import { Analytics } from '../models/Analytics';
import { sendSuccess, sendError } from '../utils/response';

export const getAdminStats = async (req: any, res: Response): Promise<any> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLinks = await Url.countDocuments();

    const clicksAggregate = await Analytics.countDocuments();

    const topUsers = await Url.aggregate([
      { $group: { _id: '$userId', linkCount: { $sum: 1 }, totalClicks: { $sum: '$clickCount' } } },
      { $sort: { totalClicks: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          linkCount: 1,
          totalClicks: 1,
          name: '$user.name',
          email: '$user.email',
          role: '$user.role',
        },
      },
    ]);

    const topLinks = await Url.find()
      .sort({ clickCount: -1 })
      .limit(5)
      .populate('userId', 'name email');

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password');

    return sendSuccess(res, {
      totalUsers,
      totalLinks,
      totalClicks: clicksAggregate,
      topUsers,
      topLinks,
      recentUsers,
    });
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const getUsers = async (req: any, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-password');

    return sendSuccess(res, users, 'Users retrieved successfully', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const toggleUserSuspension = async (req: any, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return sendError(res, 'User not found', 404);
    if (user.role === 'admin') {
      return sendError(res, 'Cannot suspend an admin user', 400);
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    return sendSuccess(
      res,
      user,
      `User account ${user.isSuspended ? 'suspended' : 'activated'} successfully`
    );
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const updateUserRole = async (req: any, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return sendError(res, 'Invalid role specified', 400);
    }

    const user = await User.findById(id);
    if (!user) return sendError(res, 'User not found', 404);

    user.role = role;
    await user.save();

    return sendSuccess(res, user, `User role updated to ${role}`);
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const deleteUser = async (req: any, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return sendError(res, 'User not found', 404);
    if (user.role === 'admin') return sendError(res, 'Cannot delete an admin user', 400);

    // Delete user's URLs & Analytics
    const userUrls = await Url.find({ userId: id });
    const urlIds = userUrls.map((u) => u._id);

    await Analytics.deleteMany({ urlId: { $in: urlIds } });
    await Url.deleteMany({ userId: id });
    await User.findByIdAndDelete(id);

    return sendSuccess(res, null, 'User and all associated data deleted successfully');
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const toggleUserVerification = async (req: any, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return sendError(res, 'User not found', 404);

    user.isVerified = !user.isVerified;
    if (user.isVerified) {
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
    }
    await user.save();

    return sendSuccess(
      res,
      user,
      `User verification status set to ${user.isVerified ? 'Verified' : 'Pending'}`
    );
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const getUserLinks = async (req: any, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) return sendError(res, 'User not found', 404);

    const urls = await Url.find({ userId: id }).sort({ createdAt: -1 });

    return sendSuccess(
      res,
      { user, urls },
      'User details and links retrieved successfully'
    );
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

import { Response } from 'express';
import { User } from '../models/User';
import { Url } from '../models/Url';
import { Analytics } from '../models/Analytics';
import { sendSuccess, sendError } from '../utils/response';

export const getAdminStats = async (req: any, res: Response): Promise<any> => {
  try {
    // Run all 6 metric queries concurrently in parallel to eliminate database waterfall
    const [
      totalUsers,
      totalLinks,
      totalClicks,
      topUsers,
      topLinks,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Url.countDocuments(),
      Analytics.countDocuments(),
      Url.aggregate([
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
      ]),
      Url.find()
        .sort({ clickCount: -1 })
        .limit(5)
        .populate('userId', 'name email')
        .lean(),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('-password')
        .lean(),
    ]);

    return sendSuccess(res, {
      totalUsers,
      totalLinks,
      totalClicks,
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
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (search) {
      const sanitized = (search as string).trim();
      filter.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { email: { $regex: sanitized, $options: 'i' } },
      ];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-password')
        .lean(),
    ]);

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
    const adminEmail = (process.env.ADMIN_EMAIL || 'sparshchauhan050@gmail.com').toLowerCase();
    if (user.role === 'admin' || user.email.toLowerCase() === adminEmail) {
      return sendError(res, 'Cannot suspend the system administrator', 400);
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

    const adminEmail = (process.env.ADMIN_EMAIL || 'sparshchauhan050@gmail.com').toLowerCase();

    if (user.email.toLowerCase() === adminEmail && role !== 'admin') {
      return sendError(res, 'Cannot demote the primary system administrator', 400);
    }

    if (role === 'admin' && user.email.toLowerCase() !== adminEmail) {
      return sendError(res, 'Access restriction: Admin privileges are exclusively reserved for sparshchauhan050@gmail.com', 403);
    }

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
    
    const adminEmail = (process.env.ADMIN_EMAIL || 'sparshchauhan050@gmail.com').toLowerCase();
    if (user.role === 'admin' || user.email.toLowerCase() === adminEmail) {
      return sendError(res, 'Cannot delete the system administrator', 400);
    }

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
    const [user, urls] = await Promise.all([
      User.findById(id).select('-password').lean(),
      Url.find({ userId: id }).sort({ createdAt: -1 }).lean(),
    ]);

    if (!user) return sendError(res, 'User not found', 404);

    return sendSuccess(
      res,
      { user, urls },
      'User details and links retrieved successfully'
    );
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

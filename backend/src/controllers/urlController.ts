import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { Url } from '../models/Url';
import { Analytics } from '../models/Analytics';
import { generateShortCode } from '../utils/nanoid';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const createShortUrl = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const {
      originalUrl,
      customAlias,
      title,
      description,
      isPrivate,
      password,
      expiresAt,
      oneTime,
      tags,
      folderId,
    } = req.body;

    if (!originalUrl) {
      return sendError(res, 'Original URL is required', 400);
    }

    // Validate URL format
    try {
      new URL(originalUrl);
    } catch {
      return sendError(res, 'Invalid target URL format', 400);
    }

    let shortCode = '';
    if (customAlias && customAlias.trim()) {
      const sanitizedAlias = customAlias.trim().toLowerCase();

      // Reserved aliases check
      const reserved = ['api', 'admin', 'login', 'register', 'dashboard', 'r', 'auth', 'verify'];
      if (reserved.includes(sanitizedAlias)) {
        return sendError(res, 'This custom alias is reserved by the system', 400);
      }

      const existingAlias = await Url.findOne({
        $or: [{ shortCode: sanitizedAlias }, { customAlias: sanitizedAlias }],
      });
      if (existingAlias) {
        return sendError(res, 'Custom alias is already in use', 400);
      }
      shortCode = sanitizedAlias;
    } else {
      let isUnique = false;
      while (!isUnique) {
        shortCode = generateShortCode(7);
        const existing = await Url.findOne({ shortCode });
        if (!existing) isUnique = true;
      }
    }

    let hashedPassword = undefined;
    if (password && password.trim()) {
      hashedPassword = await bcrypt.hash(password.trim(), 10);
    }

    const newUrl = await Url.create({
      originalUrl,
      shortCode,
      customAlias: customAlias ? customAlias.trim().toLowerCase() : undefined,
      title: title || originalUrl,
      description: description || '',
      userId: req.user?.userId || undefined,
      isPrivate: !!isPrivate,
      password: hashedPassword,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      oneTime: !!oneTime,
      tags: Array.isArray(tags) ? tags : [],
      folderId: folderId || undefined,
    });

    return sendSuccess(res, newUrl, 'Short URL created successfully', 201);
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const getUrls = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      tag,
      folderId,
      isFavorite,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { userId: req.user?.userId };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
        { originalUrl: { $regex: search, $options: 'i' } },
      ];
    }

    if (tag) {
      filter.tags = tag;
    }

    if (folderId) {
      filter.folderId = folderId;
    }

    if (isFavorite === 'true') {
      filter.isFavorite = true;
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const total = await Url.countDocuments(filter);
    const urls = await Url.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('folderId', 'name color');

    return sendSuccess(res, urls, 'URLs retrieved successfully', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const getUrlById = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const url = await Url.findOne({ _id: id, userId: req.user?.userId }).populate('folderId');

    if (!url) {
      return sendError(res, 'URL not found', 404);
    }

    return sendSuccess(res, url);
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const updateUrl = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      originalUrl,
      title,
      description,
      isPrivate,
      isFavorite,
      password,
      expiresAt,
      oneTime,
      tags,
      folderId,
      isActive,
    } = req.body;

    const url = await Url.findOne({ _id: id, userId: req.user?.userId });
    if (!url) {
      return sendError(res, 'URL not found or unauthorized', 404);
    }

    if (originalUrl) {
      try {
        new URL(originalUrl);
        url.originalUrl = originalUrl;
      } catch {
        return sendError(res, 'Invalid target URL format', 400);
      }
    }

    if (title !== undefined) url.title = title;
    if (description !== undefined) url.description = description;
    if (isPrivate !== undefined) url.isPrivate = isPrivate;
    if (isFavorite !== undefined) url.isFavorite = isFavorite;
    if (expiresAt !== undefined) url.expiresAt = expiresAt ? new Date(expiresAt) : undefined;
    if (oneTime !== undefined) url.oneTime = oneTime;
    if (tags !== undefined) url.tags = Array.isArray(tags) ? tags : [];
    if (folderId !== undefined) url.folderId = folderId || undefined;
    if (isActive !== undefined) url.isActive = isActive;

    if (password !== undefined) {
      if (password === '' || password === null) {
        url.password = undefined;
      } else {
        url.password = await bcrypt.hash(password.trim(), 10);
      }
    }

    await url.save();
    return sendSuccess(res, url, 'URL updated successfully');
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const deleteUrl = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const url = await Url.findOneAndDelete({ _id: id, userId: req.user?.userId });

    if (!url) {
      return sendError(res, 'URL not found or unauthorized', 404);
    }

    // Delete associated analytics
    await Analytics.deleteMany({ urlId: id });

    return sendSuccess(res, null, 'URL and related analytics deleted successfully');
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const bulkDeleteUrls = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return sendError(res, 'Array of URL IDs is required', 400);
    }

    const result = await Url.deleteMany({
      _id: { $in: ids },
      userId: req.user?.userId,
    });

    await Analytics.deleteMany({ urlId: { $in: ids } });

    return sendSuccess(res, { deletedCount: result.deletedCount }, 'Bulk deletion complete');
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const bulkImportUrls = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { urls } = req.body; // Array of { originalUrl, title, customAlias, tags }
    if (!Array.isArray(urls) || urls.length === 0) {
      return sendError(res, 'An array of URL items is required', 400);
    }

    const createdList = [];
    for (const item of urls) {
      if (!item.originalUrl) continue;
      let shortCode = item.customAlias ? item.customAlias.trim().toLowerCase() : '';
      if (!shortCode) {
        shortCode = generateShortCode(7);
      }

      try {
        const created = await Url.create({
          originalUrl: item.originalUrl,
          shortCode,
          title: item.title || item.originalUrl,
          userId: req.user?.userId,
          tags: item.tags || [],
        });
        createdList.push(created);
      } catch (err) {
        // Fallback with random shortcode if alias collided
        const fallbackCode = generateShortCode(7);
        const created = await Url.create({
          originalUrl: item.originalUrl,
          shortCode: fallbackCode,
          title: item.title || item.originalUrl,
          userId: req.user?.userId,
          tags: item.tags || [],
        });
        createdList.push(created);
      }
    }

    return sendSuccess(res, createdList, `Successfully imported ${createdList.length} URLs`, 201);
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const verifyUrlPassword = async (req: any, res: Response): Promise<any> => {
  try {
    const { shortCode, password } = req.body;
    const url = await Url.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }],
    }).select('+password');

    if (!url || !url.password) {
      return sendError(res, 'Invalid link or no password set', 400);
    }

    const isMatch = await bcrypt.compare(password, url.password);
    if (!isMatch) {
      return sendError(res, 'Incorrect password', 401);
    }

    return sendSuccess(res, { targetUrl: url.originalUrl }, 'Password verified successfully');
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

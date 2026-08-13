import { Request, Response } from 'express';
import { Url } from '../models/Url';
import { Analytics } from '../models/Analytics';
import { parseClientInfo } from '../utils/geo';
import { sendError, sendSuccess } from '../utils/response';

export const handleRedirect = async (req: any, res: Response): Promise<any> => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }],
    }).select('+password');

    if (!url) {
      return sendError(res, 'Short URL not found', 404);
    }

    if (!url.isActive) {
      return sendError(res, 'This link has been deactivated', 410);
    }

    if (url.expiresAt && new Date() > url.expiresAt) {
      url.isActive = false;
      await url.save();
      return sendError(res, 'This link has expired', 410);
    }

    // Password Protected Check
    if (url.password) {
      const providedPassword = req.headers['x-link-password'] as string;
      if (!providedPassword) {
        return res.status(401).json({
          success: false,
          passwordRequired: true,
          shortCode: url.shortCode,
          title: url.title || 'Protected Link',
          message: 'This link is password protected.',
        });
      }
    }

    // Analytics Parsing
    const userAgentStr = req.headers['user-agent'] || '';
    const referrerStr = (req.headers['referer'] || req.headers['referrer']) as string;
    const ipStr =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const clientInfo = parseClientInfo(userAgentStr, ipStr, referrerStr);

    // Check unique visitor in past 24h using covered index
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingClick = await Analytics.findOne({
      urlId: url._id,
      ip: ipStr,
      timestamp: { $gte: twentyFourHoursAgo },
    })
      .select('_id')
      .lean();

    const isUnique = !existingClick;

    // Asynchronously log analytics and atomically increment click counts
    await Promise.all([
      Analytics.create({
        urlId: url._id,
        shortCode: url.shortCode,
        ip: ipStr,
        userAgent: userAgentStr,
        deviceType: clientInfo.deviceType,
        os: clientInfo.os,
        browser: clientInfo.browser,
        country: clientInfo.country,
        city: clientInfo.city,
        referrer: clientInfo.referrer,
        trafficSource: clientInfo.trafficSource,
        isUnique,
      }),
      Url.updateOne(
        { _id: url._id },
        {
          $inc: {
            clickCount: 1,
            ...(isUnique ? { uniqueClickCount: 1 } : {}),
          },
          ...(url.oneTime ? { $set: { isActive: false } } : {}),
        }
      ),
    ]);

    // If client requested JSON (e.g. from SPA preview), send target URL, else redirect 302
    if (req.headers.accept?.includes('application/json') || req.query.json === 'true') {
      return sendSuccess(res, { targetUrl: url.originalUrl }, 'Redirection target found');
    }

    return res.redirect(302, url.originalUrl);
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

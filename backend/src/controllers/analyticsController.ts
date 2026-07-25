import { Response } from 'express';
import mongoose from 'mongoose';
import { Analytics } from '../models/Analytics';
import { Url } from '../models/Url';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getUrlAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { timeframe = '7d' } = req.query; // '24h', '7d', '30d', '1y'

    const query = req.user?.role === 'admin' ? { _id: id } : { _id: id, userId: req.user?.userId };
    const urlDoc = await Url.findOne(query);
    if (!urlDoc) {
      return sendError(res, 'URL not found or unauthorized', 404);
    }

    let startDate = new Date();
    if (timeframe === '24h') startDate.setHours(startDate.getHours() - 24);
    else if (timeframe === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (timeframe === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (timeframe === '1y') startDate.setFullYear(startDate.getFullYear() - 1);
    else startDate.setDate(startDate.getDate() - 7);

    const matchStage = {
      urlId: new mongoose.Types.ObjectId(id),
      timestamp: { $gte: startDate },
    };

    // Run all aggregation queries in parallel for fast performance
    const [
      timeline,
      devices,
      browsers,
      osList,
      countries,
      trafficSources,
      referrers,
    ] = await Promise.all([
      // Timeline Aggregation
      Analytics.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: {
                format: timeframe === '24h' ? '%Y-%m-%d %H:00' : '%Y-%m-%d',
                date: '$timestamp',
              },
            },
            clicks: { $sum: 1 },
            uniques: { $sum: { $cond: ['$isUnique', 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Device breakdown
      Analytics.aggregate([
        { $match: matchStage },
        { $group: { _id: '$deviceType', count: { $sum: 1 } } },
      ]),
      // Browser breakdown
      Analytics.aggregate([
        { $match: matchStage },
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      // OS breakdown
      Analytics.aggregate([
        { $match: matchStage },
        { $group: { _id: '$os', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      // Geolocation breakdown
      Analytics.aggregate([
        { $match: matchStage },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      // Traffic Sources
      Analytics.aggregate([
        { $match: matchStage },
        { $group: { _id: '$trafficSource', count: { $sum: 1 } } },
      ]),
      // Top Referrers
      Analytics.aggregate([
        { $match: matchStage },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return sendSuccess(res, {
      url: urlDoc,
      summary: {
        totalClicks: urlDoc.clickCount,
        uniqueClicks: urlDoc.uniqueClickCount,
      },
      timeline: timeline.map((item) => ({ date: item._id, clicks: item.clicks, uniques: item.uniques })),
      devices: devices.map((d) => ({ name: d._id || 'Unknown', count: d.count })),
      browsers: browsers.map((b) => ({ name: b._id || 'Unknown', count: b.count })),
      os: osList.map((o) => ({ name: o._id || 'Unknown', count: o.count })),
      countries: countries.map((c) => ({ country: c._id || 'Unknown', count: c.count })),
      trafficSources: trafficSources.map((t) => ({ name: t._id || 'Direct', count: t.count })),
      referrers: referrers.map((r) => ({ referrer: r._id || 'Direct', count: r.count })),
    });
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const getOverallAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const userUrls = await Url.find({ userId });
    const urlIds = userUrls.map((u) => u._id);

    const totalLinks = userUrls.length;
    const totalClicks = userUrls.reduce((acc, u) => acc + u.clickCount, 0);
    const uniqueClicks = userUrls.reduce((acc, u) => acc + u.uniqueClickCount, 0);
    const activeLinks = userUrls.filter((u) => u.isActive).length;

    // Top Performing 5 Links
    const topLinks = await Url.find({ userId })
      .sort({ clickCount: -1 })
      .limit(5);

    // Timeline for all user links (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const timeline = await Analytics.aggregate([
      {
        $match: {
          urlId: { $in: urlIds },
          timestamp: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          clicks: { $sum: 1 },
          uniques: { $sum: { $cond: ['$isUnique', 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return sendSuccess(res, {
      totalLinks,
      totalClicks,
      uniqueClicks,
      activeLinks,
      topLinks,
      timeline: timeline.map((item) => ({ date: item._id, clicks: item.clicks, uniques: item.uniques })),
    });
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

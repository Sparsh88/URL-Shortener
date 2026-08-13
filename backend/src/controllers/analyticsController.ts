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
    const urlDoc = await Url.findOne(query).lean();
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

    // Execute all breakdown metrics in a single MongoDB $facet aggregation round-trip
    const [facetResult] = await Analytics.aggregate([
      { $match: matchStage },
      {
        $facet: {
          timeline: [
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
          ],
          devices: [
            { $group: { _id: '$deviceType', count: { $sum: 1 } } },
          ],
          browsers: [
            { $group: { _id: '$browser', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ],
          osList: [
            { $group: { _id: '$os', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ],
          countries: [
            { $group: { _id: '$country', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
          trafficSources: [
            { $group: { _id: '$trafficSource', count: { $sum: 1 } } },
          ],
          referrers: [
            { $group: { _id: '$referrer', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
        },
      },
    ]);

    const timeline = facetResult?.timeline || [];
    const devices = facetResult?.devices || [];
    const browsers = facetResult?.browsers || [];
    const osList = facetResult?.osList || [];
    const countries = facetResult?.countries || [];
    const trafficSources = facetResult?.trafficSources || [];
    const referrers = facetResult?.referrers || [];

    return sendSuccess(res, {
      url: urlDoc,
      summary: {
        totalClicks: urlDoc.clickCount || 0,
        uniqueClicks: urlDoc.uniqueClickCount || 0,
      },
      timeline: timeline.map((item: any) => ({ date: item._id, clicks: item.clicks, uniques: item.uniques })),
      devices: devices.map((d: any) => ({ name: d._id || 'Unknown', count: d.count })),
      browsers: browsers.map((b: any) => ({ name: b._id || 'Unknown', count: b.count })),
      os: osList.map((o: any) => ({ name: o._id || 'Unknown', count: o.count })),
      countries: countries.map((c: any) => ({ country: c._id || 'Unknown', count: c.count })),
      trafficSources: trafficSources.map((t: any) => ({ name: t._id || 'Direct', count: t.count })),
      referrers: referrers.map((r: any) => ({ referrer: r._id || 'Direct', count: r.count })),
    });
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

export const getOverallAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Run summary stats, top links, and 7-day timeline concurrently in parallel
    const [summaryAgg, topLinks, urlIds] = await Promise.all([
      Url.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: null,
            totalLinks: { $sum: 1 },
            totalClicks: { $sum: '$clickCount' },
            uniqueClicks: { $sum: '$uniqueClickCount' },
            activeLinks: { $sum: { $cond: ['$isActive', 1, 0] } },
          },
        },
      ]),
      Url.find({ userId: userObjectId })
        .sort({ clickCount: -1 })
        .limit(5)
        .lean(),
      Url.find({ userId: userObjectId }).distinct('_id'),
    ]);

    const stats = summaryAgg[0] || {
      totalLinks: 0,
      totalClicks: 0,
      uniqueClicks: 0,
      activeLinks: 0,
    };

    // If user has URLs, aggregate timeline for active URLs
    let timeline: any[] = [];
    if (urlIds.length > 0) {
      timeline = await Analytics.aggregate([
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
    }

    return sendSuccess(res, {
      totalLinks: stats.totalLinks,
      totalClicks: stats.totalClicks,
      uniqueClicks: stats.uniqueClicks,
      activeLinks: stats.activeLinks,
      topLinks,
      timeline: timeline.map((item) => ({ date: item._id, clicks: item.clicks, uniques: item.uniques })),
    });
  } catch (error) {
    return sendError(res, (error as Error).message, 500);
  }
};

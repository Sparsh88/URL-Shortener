import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/common/Navbar';
import { ClickTimelineChart } from '../components/analytics/ClickTimelineChart';
import { DeviceDistributionChart } from '../components/analytics/DeviceDistributionChart';
import { ChartSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
import { analyticsService } from '../services/analyticsService';
import { urlService } from '../services/urlService';
import { UrlAnalyticsResponse, UrlItem } from '../types';
import { useToast } from '../components/common/Toast';
import { BarChart3, Globe, Smartphone, Compass, Clock, Link2 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlIdParam = searchParams.get('urlId');

  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '1y'>('7d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<UrlAnalyticsResponse | null>(null);
  const [userUrls, setUserUrls] = useState<UrlItem[]>([]);
  const [selectedUrlId, setSelectedUrlId] = useState<string>(urlIdParam || '');

  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      setLoading(true);
      try {
        const urlRes = await urlService.getUrls();
        if (!isMounted) return;

        if (urlRes.success && urlRes.data.length > 0) {
          setUserUrls(urlRes.data);

          const initialTargetId =
            urlIdParam && urlRes.data.some((u: UrlItem) => u._id === urlIdParam)
              ? urlIdParam
              : urlRes.data[0]._id;

          setSelectedUrlId(initialTargetId);

          const analyticsRes = await analyticsService.getUrlAnalytics(initialTargetId, timeframe);
          if (isMounted && analyticsRes.success) {
            setAnalyticsData(analyticsRes.data);
          }
        } else {
          setUserUrls([]);
          setAnalyticsData(null);
        }
      } catch (err) {
        if (isMounted) showToast('Failed to load analytics', 'error');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUrlChange = async (urlId: string) => {
    setSelectedUrlId(urlId);
    setLoading(true);
    try {
      const res = await analyticsService.getUrlAnalytics(urlId, timeframe);
      if (res.success) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      showToast('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeframeChange = async (newTimeframe: '24h' | '7d' | '30d' | '1y') => {
    setTimeframe(newTimeframe);
    if (!selectedUrlId) return;

    setLoading(true);
    try {
      const res = await analyticsService.getUrlAnalytics(selectedUrlId, newTimeframe);
      if (res.success) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      showToast('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Analytics Header & Controls */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-200 dark:border-zinc-800"
        >
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              <span>Link Analytics Intelligence</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
              Real-time traffic performance, device breakdown, and global click telemetry
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
            {/* Link Selector */}
            {userUrls.length > 0 && (
              <select
                value={selectedUrlId}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="px-4 py-2.5 rounded-xl glass-input text-xs font-semibold w-full sm:w-auto max-w-full sm:max-w-xs cursor-pointer"
              >
                {userUrls.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.title || u.shortCode} (/{u.customAlias || u.shortCode})
                  </option>
                ))}
              </select>
            )}

            {/* Timeframe Selector */}
            <div className="flex items-center p-1 rounded-xl glass-panel border border-slate-200 dark:border-zinc-800 text-xs">
              {(['24h', '7d', '30d', '1y'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTimeframeChange(t)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    timeframe === t
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* If no URLs available */}
        {!loading && userUrls.length === 0 ? (
          <div className="p-16 glass-panel rounded-3xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
              <Link2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No URLs Shortened Yet</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
              Create your first short link on the Dashboard to start tracking real-time click telemetry and geographic analytics.
            </p>
          </div>
        ) : (
          <>
            {/* Analytics Summary Cards */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-2xl glass-panel space-y-1 cursor-pointer"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400">Total Clicks</p>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{analyticsData?.summary.totalClicks || 0}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-2xl glass-panel space-y-1 cursor-pointer"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400">Unique Visitors</p>
                  <p className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">{analyticsData?.summary.uniqueClicks || 0}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-2xl glass-panel space-y-1 cursor-pointer"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400">Top Country</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 truncate">
                    {analyticsData?.countries[0]?.country || 'N/A'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-2xl glass-panel space-y-1 cursor-pointer"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400">Top Device</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 truncate">
                    {analyticsData?.devices[0]?.name || 'Desktop'}
                  </p>
                </motion.div>
              </div>
            )}

            {/* Click Timeline Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="p-6 glass-panel rounded-3xl space-y-4"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Clock className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <span>Click Engagement Timeline ({timeframe.toUpperCase()})</span>
              </h3>
              {loading ? <ChartSkeleton /> : <ClickTimelineChart data={analyticsData?.timeline || []} />}
            </motion.div>

            {/* Devices, Browsers & Geographic Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Device Pie Chart */}
              <div className="p-6 glass-panel rounded-3xl space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Smartphone className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  <span>Device Distribution</span>
                </h3>
                {loading ? <ChartSkeleton /> : <DeviceDistributionChart devices={analyticsData?.devices || []} />}
              </div>

              {/* Top Referrers */}
              <div className="p-6 glass-panel rounded-3xl space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Compass className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span>Top Referrers</span>
                </h3>
                {loading ? (
                  <ChartSkeleton />
                ) : (
                  <div className="space-y-3">
                    {analyticsData?.referrers.map((ref, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl glass-card text-xs"
                      >
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-xs">{ref.referrer}</span>
                        <span className="font-bold text-brand-600 dark:text-brand-400">{ref.count} clicks</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Geographic Locations */}
              <div className="p-6 glass-panel rounded-3xl space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Geographic Distribution</span>
                </h3>
                {loading ? (
                  <ChartSkeleton />
                ) : (
                  <div className="space-y-3">
                    {analyticsData?.countries.map((geo, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl glass-card text-xs"
                      >
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">{geo.country}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{geo.count} visits</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

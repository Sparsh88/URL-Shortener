import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/common/Navbar';
import { QuickShortenBar } from '../components/urls/QuickShortenBar';
import { UrlTable } from '../components/urls/UrlTable';
import { CreateUrlModal } from '../components/urls/CreateUrlModal';
import { EditUrlModal } from '../components/urls/EditUrlModal';
import { QrCodeModal } from '../components/urls/QrCodeModal';
import { BulkCsvModal } from '../components/urls/BulkCsvModal';
import { TableSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
import { urlService } from '../services/urlService';
import { useUrlStore } from '../stores/urlStore';
import { UrlItem, OverviewResponse } from '../types';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/common/Toast';
import {
  Link2,
  MousePointerClick,
  Users,
  BarChart3,
  Search,
  Upload,
  Download,
  Star,
  Trash2,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'createdAt' | 'clickCount'>('createdAt');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [activeUrl, setActiveUrl] = useState<UrlItem | null>(null);

  const { selectedUrlIds, clearSelection } = useUrlStore();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewRes, urlsRes] = await Promise.all([
        urlService.getOverview(),
        urlService.getUrls({
          search,
          tag: tagFilter,
          isFavorite: showFavoritesOnly ? true : undefined,
          sortBy,
        }),
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (urlsRes.success) setUrls(urlsRes.data);
    } catch (err) {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, tagFilter, showFavoritesOnly, sortBy]);

  const handleToggleFavorite = async (url: UrlItem) => {
    try {
      const res = await urlService.toggleFavorite(url._id);
      if (res.success) {
        showToast(res.message, 'success');
        fetchData();
      }
    } catch (err) {
      showToast('Failed to update favorite status', 'error');
    }
  };

  const handleDeleteUrl = async (id: string) => {
    if (!confirm('Are you sure you want to delete this short link?')) return;
    try {
      const res = await urlService.deleteUrl(id);
      if (res.success) {
        showToast('Short link deleted', 'info');
        fetchData();
      }
    } catch (err) {
      showToast('Failed to delete short link', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUrlIds.length === 0) return;
    if (!confirm(`Delete ${selectedUrlIds.length} selected URLs?`)) return;

    try {
      const res = await urlService.bulkDelete(selectedUrlIds);
      if (res.success) {
        showToast(res.message, 'success');
        clearSelection();
        fetchData();
      }
    } catch (err) {
      showToast('Bulk delete failed', 'error');
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await urlService.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `linkforge-urls-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Exported CSV file', 'success');
    } catch (err) {
      showToast('Failed to export CSV', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      <Navbar onOpenCreateModal={() => setCreateModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Stats Banner with Framer Motion Stagger */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-2xl glass-panel space-y-2 cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Links</span>
                  <Link2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{overview?.totalLinks || 0}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {overview?.activeLinks || 0} active links
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-2xl glass-panel space-y-2 cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Clicks</span>
                  <MousePointerClick className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{overview?.totalClicks || 0}</p>
                <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">Across all shortened URLs</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-2xl glass-panel space-y-2 cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Unique Visitors</span>
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{overview?.uniqueClicks || 0}</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Unique IP engagements</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-2xl glass-panel space-y-2 cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">CTR Efficiency</span>
                  <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {overview?.totalClicks
                    ? `${Math.round((overview.uniqueClicks / overview.totalClicks) * 100)}%`
                    : '0%'}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Unique visitor ratio</p>
              </motion.div>
            </>
          )}
        </div>

        {/* Quick Shorten Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <QuickShortenBar
            onUrlCreated={() => fetchData()}
            onOpenAdvancedModal={() => setCreateModalOpen(true)}
          />
        </motion.div>

        {/* Search, Filter & Bulk Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search links by title or URL..."
              className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          {/* Action buttons & filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                showFavoritesOnly
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40'
                  : 'glass-panel text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-amber-400' : ''}`} />
              <span>Starred</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl glass-input text-xs font-semibold cursor-pointer"
            >
              <option value="createdAt">Date Created</option>
              <option value="clickCount">Most Clicked</option>
            </select>

            <button
              onClick={() => setBulkModalOpen(true)}
              className="px-3 py-2 rounded-xl glass-panel text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center space-x-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-brand-500" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-2 rounded-xl glass-panel text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-sky-500" />
              <span>Export CSV</span>
            </button>

            {selectedUrlIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5 animate-in fade-in duration-150"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedUrlIds.length})</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* URLs Table Inventory */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          {loading ? (
            <TableSkeleton />
          ) : (
            <UrlTable
              urls={urls}
              onOpenAnalytics={(url) => navigate(`/analytics?urlId=${url._id}`)}
              onOpenQrCode={(url) => {
                setActiveUrl(url);
                setQrModalOpen(true);
              }}
              onEditUrl={(url) => {
                setActiveUrl(url);
                setEditModalOpen(true);
              }}
              onDeleteUrl={handleDeleteUrl}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        </motion.div>
      </main>

      {/* Modals */}
      <CreateUrlModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => fetchData()}
      />

      {activeUrl && (
        <>
          <EditUrlModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            url={activeUrl}
            onSuccess={() => fetchData()}
          />

          <QrCodeModal
            isOpen={qrModalOpen}
            onClose={() => setQrModalOpen(false)}
            url={activeUrl}
          />
        </>
      )}

      <BulkCsvModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        onSuccess={() => fetchData()}
      />
    </div>
  );
};

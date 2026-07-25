import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { adminService } from '../../services/adminService';
import { urlService } from '../../services/urlService';
import { User, UrlItem } from '../../types';
import { useToast } from '../common/Toast';
import {
  User as UserIcon,
  Link2,
  ExternalLink,
  Trash2,
  Lock,
  Flame,
  Clock,
  Copy,
  Check,
  Search,
  ShieldCheck,
  Ban,
} from 'lucide-react';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onUserUpdated?: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  userId,
  onUserUpdated,
}) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);
  const [userUrls, setUserUrls] = useState<UrlItem[]>([]);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen || !userId) return;
    setLoading(true);
    adminService
      .getUserLinks(userId)
      .then((res) => {
        if (res.success) {
          setUserData(res.data.user);
          setUserUrls(res.data.urls);
        }
      })
      .catch(() => showToast('Failed to load user details', 'error'))
      .finally(() => setLoading(false));
  }, [isOpen, userId]);

  const handleDeleteUrl = async (urlId: string) => {
    if (!confirm('Are you sure you want to delete this shortened link?')) return;
    try {
      const res = await urlService.deleteUrl(urlId);
      if (res.success) {
        showToast('Link deleted successfully', 'success');
        setUserUrls((prev) => prev.filter((u) => u._id !== urlId));
        if (onUserUpdated) onUserUpdated();
      }
    } catch (err: any) {
      showToast('Failed to delete URL', 'error');
    }
  };

  const handleCopy = (shortCode: string, id: string) => {
    const fullUrl = `${import.meta.env.VITE_SHORT_BASE_URL || 'http://localhost:5000/r'}/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    showToast('Copied short link!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUrls = userUrls.filter(
    (u) =>
      u.title?.toLowerCase().includes(search.toLowerCase()) ||
      u.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
      (u.customAlias || u.shortCode).toLowerCase().includes(search.toLowerCase())
  );

  const totalClicks = userUrls.reduce((acc, curr) => acc + (curr.clickCount || 0), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile & Created Links" maxWidth="2xl">
      {loading ? (
        <div className="py-12 flex justify-center items-center">
          <span className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : !userData ? (
        <p className="text-sm text-slate-500 text-center py-6">User profile not found.</p>
      ) : (
        <div className="space-y-6">
          {/* User Overview Header */}
          <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-600/20 text-brand-600 dark:text-brand-400 font-extrabold flex items-center justify-center text-lg shadow-sm">
                {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{userData.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-500/20 text-brand-700 dark:text-brand-300">
                    {userData.role}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{userData.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-[11px] font-semibold flex items-center space-x-1 ${userData.isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{userData.isVerified ? 'Verified Account' : 'Pending Verification'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center space-x-4 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-4 w-full sm:w-auto justify-around">
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Links</p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">{userUrls.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Clicks</p>
                <p className="text-lg font-extrabold text-brand-600 dark:text-brand-400">{totalClicks}</p>
              </div>
            </div>
          </div>

          {/* User Links Inventory Header & Search */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Link2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Links Created by {userData.name} ({userUrls.length})</span>
              </h4>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter links..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            {/* Links Table */}
            {filteredUrls.length === 0 ? (
              <div className="p-8 glass-card rounded-xl text-center text-xs text-slate-500">
                No shortened links found for this user.
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 glass-panel">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Title / Short Link</th>
                      <th className="py-2.5 px-3">Target URL</th>
                      <th className="py-2.5 px-3">Clicks</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredUrls.map((url) => {
                      const shortCode = url.customAlias || url.shortCode;
                      const fullShortUrl = `${import.meta.env.VITE_SHORT_BASE_URL || 'http://localhost:5000/r'}/${shortCode}`;

                      return (
                        <tr key={url._id} className="hover:bg-slate-100/70 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-3">
                            <p className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">{url.title || shortCode}</p>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <a
                                href={fullShortUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center space-x-1"
                              >
                                <span>/{shortCode}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <button
                                onClick={() => handleCopy(shortCode, url._id)}
                                className="text-slate-400 hover:text-slate-900 dark:hover:text-white ml-1"
                              >
                                {copiedId === url._id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <p className="text-slate-600 dark:text-slate-400 truncate max-w-xs" title={url.originalUrl}>
                              {url.originalUrl}
                            </p>
                          </td>

                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                            {url.clickCount} <span className="font-normal text-[10px] text-slate-500">({url.uniqueClickCount} unique)</span>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleDeleteUrl(url._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-colors"
                              title="Delete Link as Admin"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

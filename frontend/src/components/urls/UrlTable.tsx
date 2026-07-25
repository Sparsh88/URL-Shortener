import React from 'react';
import { UrlItem } from '../../types';
import { useUrlStore } from '../../stores/urlStore';
import { useToast } from '../common/Toast';
import {
  Copy,
  Check,
  Star,
  QrCode,
  BarChart3,
  Edit2,
  Trash2,
  ExternalLink,
  Lock,
  Clock,
  Flame,
  Globe,
} from 'lucide-react';

interface UrlTableProps {
  urls: UrlItem[];
  onOpenAnalytics: (url: UrlItem) => void;
  onOpenQrCode: (url: UrlItem) => void;
  onEditUrl: (url: UrlItem) => void;
  onDeleteUrl: (id: string) => void;
  onToggleFavorite: (url: UrlItem) => void;
}

export const UrlTable: React.FC<UrlTableProps> = ({
  urls,
  onOpenAnalytics,
  onOpenQrCode,
  onEditUrl,
  onDeleteUrl,
  onToggleFavorite,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const { selectedUrlIds, toggleSelectUrl, selectAllUrls, clearSelection } = useUrlStore();
  const { showToast } = useToast();

  const allSelected = urls.length > 0 && urls.every((u) => selectedUrlIds.includes(u._id));

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllUrls(urls.map((u) => u._id));
    }
  };

  const handleCopy = (shortCode: string, id: string) => {
    const fullUrl = `${import.meta.env.VITE_SHORT_BASE_URL || 'http://localhost:5000/r'}/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    showToast('Copied short link to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (urls.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
          <Globe className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No URLs shorted yet</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
          Create your first short link above or import links in bulk to start tracking real-time analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-100/80 dark:bg-slate-900/60 text-xs font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />
              </th>
              <th className="py-3.5 px-4">Title & Short Code</th>
              <th className="py-3.5 px-4">Destination</th>
              <th className="py-3.5 px-4">Clicks</th>
              <th className="py-3.5 px-4">Badges & Tags</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50 text-sm">
            {urls.map((url) => {
              const shortUrl = `${import.meta.env.VITE_SHORT_BASE_URL || 'http://localhost:5000/r'}/${url.customAlias || url.shortCode}`;
              const isSelected = selectedUrlIds.includes(url._id);

              return (
                <tr
                  key={url._id}
                  className={`hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors ${
                    isSelected ? 'bg-brand-500/10 dark:bg-brand-500/5' : ''
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectUrl(url._id)}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    />
                  </td>

                  {/* Title & Short Link */}
                  <td className="py-4 px-4">
                    <div className="flex items-start space-x-2">
                      <button
                        onClick={() => onToggleFavorite(url)}
                        className={`mt-0.5 text-slate-400 hover:text-amber-500 transition-colors ${
                          url.isFavorite ? 'text-amber-500 fill-amber-500' : ''
                        }`}
                        title="Toggle Favorite"
                      >
                        <Star className="w-4 h-4" />
                      </button>

                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">{url.title || url.shortCode}</p>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
                          >
                            <span>/{url.customAlias || url.shortCode}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => handleCopy(url.customAlias || url.shortCode, url._id)}
                            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            title="Copy Short Link"
                          >
                            {copiedId === url._id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Original URL Target */}
                  <td className="py-4 px-4">
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-xs" title={url.originalUrl}>
                      {url.originalUrl}
                    </p>
                  </td>

                  {/* Click Statistics */}
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">{url.clickCount}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">({url.uniqueClickCount} unique)</span>
                    </div>
                  </td>

                  {/* Badges & Tags */}
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1 items-center">
                      {url.hasPassword && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                          <Lock className="w-3 h-3" />
                          <span>Protected</span>
                        </span>
                      )}
                      {url.oneTime && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center space-x-1">
                          <Flame className="w-3 h-3" />
                          <span>1-Time</span>
                        </span>
                      )}
                      {url.expiresAt && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Expires</span>
                        </span>
                      )}
                      {url.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Actions Bar */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => onOpenAnalytics(url)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="View Detailed Analytics"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenQrCode(url)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="Download QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditUrl(url)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Link"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteUrl(url._id)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-colors"
                        title="Delete Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

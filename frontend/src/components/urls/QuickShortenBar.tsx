import React, { useState } from 'react';
import { urlService } from '../../services/urlService';
import { useToast } from '../common/Toast';
import { Link2, Sparkles, Copy, Check } from 'lucide-react';
import { UrlItem } from '../../types';

interface QuickShortenBarProps {
  onUrlCreated?: (newUrl: UrlItem) => void;
  onOpenAdvancedModal?: (initialUrl?: string) => void;
}

export const QuickShortenBar: React.FC<QuickShortenBarProps> = ({
  onUrlCreated,
  onOpenAdvancedModal,
}) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<UrlItem | null>(null);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      const res = await urlService.createShortUrl({ originalUrl: url.trim() });
      if (res.success) {
        setCreatedUrl(res.data);
        if (onUrlCreated) onUrlCreated(res.data);
        showToast('Link shortened successfully!', 'success');
        setUrl('');
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to shorten URL', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fullShortUrl = createdUrl
    ? `${import.meta.env.VITE_SHORT_BASE_URL || 'http://localhost:5000/r'}/${createdUrl.customAlias || createdUrl.shortCode}`
    : '';

  const handleCopy = () => {
    if (!fullShortUrl) return;
    navigator.clipboard.writeText(fullShortUrl);
    setCopied(true);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-4">
      <form
        onSubmit={handleShorten}
        className="p-2 rounded-2xl glass-panel flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3"
      >
        <div className="relative flex-1 w-full">
          <Link2 className="w-5 h-5 absolute left-4 top-3.5 text-brand-600 dark:text-brand-400" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a long URL to shorten (e.g., https://example.com/long-page)..."
            required
            className="w-full pl-12 pr-4 py-3 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 font-medium"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          {onOpenAdvancedModal && (
            <button
              type="button"
              onClick={() => onOpenAdvancedModal(url)}
              className="px-3.5 py-3 rounded-xl glass-card hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-colors flex items-center space-x-1.5"
              title="Advanced options (Password, Expiration, Tags)"
            >
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span className="hidden sm:inline">Options</span>
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white font-semibold text-sm shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 transition-all duration-150 active:scale-95 whitespace-nowrap"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Shorten Now</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Instant Success Banner */}
      {createdUrl && (
        <div className="p-4 rounded-2xl glass-card bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-3 overflow-hidden w-full">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Shortened Link Ready</p>
              <a
                href={fullShortUrl}
                target="_blank"
                rel="noreferrer"
                className="text-base font-bold text-slate-900 dark:text-white hover:underline truncate block"
              >
                {fullShortUrl}
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

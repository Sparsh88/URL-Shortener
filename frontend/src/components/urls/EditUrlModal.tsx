import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { urlService } from '../../services/urlService';
import { useToast } from '../common/Toast';
import { UrlItem } from '../../types';
import { Link2, Lock, Clock, Flame, Tag as TagIcon, X } from 'lucide-react';

interface EditUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: UrlItem;
  onSuccess?: () => void;
}

export const EditUrlModal: React.FC<EditUrlModalProps> = ({
  isOpen,
  onClose,
  url,
  onSuccess,
}) => {
  const [title, setTitle] = useState(url.title || '');
  const [description, setDescription] = useState(url.description || '');
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState(
    url.expiresAt ? new Date(url.expiresAt).toISOString().slice(0, 16) : ''
  );
  const [oneTime, setOneTime] = useState(url.oneTime || false);
  const [tags, setTags] = useState<string[]>(url.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    setTitle(url.title || '');
    setDescription(url.description || '');
    setExpiresAt(url.expiresAt ? new Date(url.expiresAt).toISOString().slice(0, 16) : '');
    setOneTime(url.oneTime || false);
    setTags(url.tags || []);
  }, [url]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        title,
        description,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        oneTime,
        tags,
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      const res = await urlService.updateUrl(url._id, payload);
      if (res.success) {
        showToast('Short link updated successfully', 'success');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update URL', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Short Link" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Short Code Read-Only Badge */}
        <div className="p-3 rounded-xl glass-card border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-zinc-400 font-semibold">Short Link Alias:</span>
          <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
            /{url.customAlias || url.shortCode}
          </span>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1">
            Link Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q3 Marketing Campaign"
            className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1">
            Notes / Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add internal team notes..."
            className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Security & Expiration Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Password Protection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1 flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Update Passcode</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep existing"
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Expiration Date</span>
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
            />
          </div>
        </div>

        {/* One-Time Self Destruct Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl glass-card border border-slate-200 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-rose-500" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">One-Time Self-Destruct</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Delete automatically after 1 click</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={oneTime}
            onChange={(e) => setOneTime(e.target.checked)}
            className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1 flex items-center space-x-1">
            <TagIcon className="w-3.5 h-3.5 text-brand-500" />
            <span>Tags (Press Enter to add)</span>
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Type tag name and hit Enter..."
            className="w-full px-3.5 py-2 rounded-xl glass-input text-xs mb-2"
          />
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-lg text-xs font-medium bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20 flex items-center space-x-1"
              >
                <span>#{t}</span>
                <button type="button" onClick={() => handleRemoveTag(t)}>
                  <X className="w-3 h-3 hover:text-rose-500" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-3 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

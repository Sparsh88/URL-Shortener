import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { urlService } from '../../services/urlService';
import { useToast } from '../common/Toast';
import { UrlItem, Folder, Tag } from '../../types';
import { Link2, Key, Calendar, Tag as TagIcon, Folder as FolderIcon, Shield, Flame, Lock } from 'lucide-react';

interface CreateUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOriginalUrl?: string;
  folders?: Folder[];
  tags?: Tag[];
  onCreated?: (newUrl: UrlItem) => void;
}

export const CreateUrlModal: React.FC<CreateUrlModalProps> = ({
  isOpen,
  onClose,
  initialOriginalUrl = '',
  folders = [],
  tags = [],
  onCreated,
}) => {
  const [originalUrl, setOriginalUrl] = useState(initialOriginalUrl);
  const [customAlias, setCustomAlias] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [oneTime, setOneTime] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!selectedTags.includes(tagInput.trim())) {
        setSelectedTags([...selectedTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalUrl.trim()) return;

    setLoading(true);
    try {
      const res = await urlService.createShortUrl({
        originalUrl: originalUrl.trim(),
        customAlias: customAlias.trim() || undefined,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        password: password.trim() || undefined,
        expiresAt: expiresAt || undefined,
        oneTime,
        isPrivate,
        folderId: selectedFolder || undefined,
        tags: selectedTags,
      });

      if (res.success) {
        showToast('Short link created successfully!', 'success');
        if (onCreated) onCreated(res.data);
        onClose();
        // Reset form
        setOriginalUrl('');
        setCustomAlias('');
        setTitle('');
        setDescription('');
        setPassword('');
        setExpiresAt('');
        setOneTime(false);
        setIsPrivate(false);
        setSelectedFolder('');
        setSelectedTags([]);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to create short link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Short Link" maxWidth="xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Destination URL */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
            Destination URL *
          </label>
          <div className="relative">
            <Link2 className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="url"
              required
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://example.com/long-url"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
        </div>

        {/* Title & Custom Alias */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Title / Label
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Campaign Landing Page"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Custom Alias (Optional)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                placeholder="my-custom-slug"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>
        </div>

        {/* Security & Access Controls */}
        <div className="p-4 rounded-xl glass-card border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center space-x-1.5">
            <Shield className="w-4 h-4" />
            <span>Protection & Expiration Rules</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Passcode Protection</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set optional password"
                  className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Expiration Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs text-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={oneTime}
                onChange={(e) => setOneTime(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-slate-900 border-slate-700"
              />
              <span className="text-xs font-medium text-slate-300 flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>One-Time Link (Self-destruct after 1 click)</span>
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-slate-900 border-slate-700"
              />
              <span className="text-xs font-medium text-slate-300">Private Link</span>
            </label>
          </div>
        </div>

        {/* Tags & Folders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Folder
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
            >
              <option value="">None (Root)</option>
              {folders.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Tags (Press Enter)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="e.g. marketing, 2026"
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedTags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-300 text-xs border border-brand-500/30"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-400"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30 transition-all active:scale-95"
          >
            {loading ? 'Creating...' : 'Create Short Link'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

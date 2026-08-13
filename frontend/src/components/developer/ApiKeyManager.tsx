import React, { useState, useEffect } from 'react';
import { apiKeyService } from '../../services/apiKeyService';
import { ApiKeyItem } from '../../types';
import { useToast } from '../common/Toast';
import { Key, Plus, Trash2, Copy, Check, Code } from 'lucide-react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

export const ApiKeyManager: React.FC = () => {
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: keys = [], isLoading: loading } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: async () => {
      const res = await apiKeyService.getKeys();
      return (res.data || []) as ApiKeyItem[];
    },
    staleTime: 1000 * 60 * 2,
  });

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await apiKeyService.createKey(newKeyName.trim());
      if (res.success) {
        setCreatedKey(res.data.key);
        showToast('API Key generated successfully!', 'success');
        setNewKeyName('');
        queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to generate API Key', 'error');
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await apiKeyService.deleteKey(id);
      showToast('API Key revoked', 'info');
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    } catch (err) {
      showToast('Failed to delete API Key', 'error');
    }
  };

  const handleCopy = (keyString: string) => {
    navigator.clipboard.writeText(keyString);
    setCopiedKey(keyString);
    showToast('Copied API Key to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Generate API Key Card */}
      <div className="p-6 glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Key className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span>Generate New API Key</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Create secret keys to programmatically authenticate requests to the LinkForge Developer REST API.
        </p>

        <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key Name (e.g. Production Mobile App)"
            className="flex-1 px-4 py-2.5 rounded-xl glass-input text-sm"
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Key</span>
          </button>
        </form>

        {createdKey && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/40 space-y-2">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Save your API Key now! (It will not be shown again)
            </p>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 dark:bg-slate-950 border border-slate-800 font-mono text-xs text-white">
              <span className="truncate">{createdKey}</span>
              <button
                onClick={() => handleCopy(createdKey)}
                className="text-emerald-400 hover:text-emerald-300 ml-2"
              >
                {copiedKey === createdKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keys Inventory */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Active API Keys</h4>

        {loading ? (
          <div className="h-20 animate-pulse bg-slate-200 dark:bg-slate-800/40 rounded-xl" />
        ) : keys.length === 0 ? (
          <p className="text-xs text-slate-500">No active API keys created yet.</p>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => (
              <div
                key={k._id}
                className="p-4 rounded-xl glass-card border border-slate-200 dark:border-slate-800/60 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{k.name}</p>
                  <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-0.5">
                    {k.key.substring(0, 12)}••••••••••••••••
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    Created {new Date(k.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDeleteKey(k._id)}
                    className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-colors"
                    title="Revoke Key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REST API Quick Docs */}
      <div className="p-6 glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center space-x-2">
          <Code className="w-4 h-4" />
          <span>Quick Developer Integration Guide</span>
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Pass your API Key in the <code className="text-brand-600 dark:text-brand-400 font-mono">x-api-key</code> header for automated URL shortening:
        </p>

        <pre className="p-4 rounded-xl bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 text-xs font-mono text-slate-100 overflow-x-auto">
{`curl -X POST "${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/urls/shorten" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"originalUrl": "https://github.com", "customAlias": "gh-home"}'`}
        </pre>
      </div>
    </div>
  );
};

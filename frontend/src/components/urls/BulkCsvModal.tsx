import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { urlService } from '../../services/urlService';
import { useToast } from '../common/Toast';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface BulkCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BulkCsvModal: React.FC<BulkCsvModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let urlsToProcess: string[] = [];

    if (file) {
      const text = await file.text();
      urlsToProcess = text
        .split(/[\r\n]+/)
        .map((line) => line.trim())
        .filter((line) => line.startsWith('http'));
    } else if (textInput.trim()) {
      urlsToProcess = textInput
        .split(/[\r\n]+/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    }

    if (urlsToProcess.length === 0) {
      showToast('Please upload a valid CSV or paste URLs (one per line)', 'error');
      return;
    }

    setLoading(true);
    try {
      let createdCount = 0;
      for (const u of urlsToProcess) {
        try {
          await urlService.createShortUrl({ originalUrl: u });
          createdCount++;
        } catch (err) {
          // continue with remaining
        }
      }

      showToast(`Bulk imported ${createdCount} short links successfully!`, 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast('Bulk import encountered an issue', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Shorten Links (CSV / Batch)" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* CSV File Upload Dropzone */}
        <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-800 glass-card text-center space-y-2">
          <Upload className="w-8 h-8 text-brand-600 dark:text-brand-400 mx-auto" />
          <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
            Upload CSV File
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            CSV file containing one URL per line
          </p>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileChange}
            className="text-xs text-slate-600 dark:text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-500 cursor-pointer"
          />
          {file && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
              Selected file: {file.name}
            </p>
          )}
        </div>

        {/* Or Paste URLs */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1">
            Or Paste List of URLs (One per line)
          </label>
          <textarea
            rows={5}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="https://example.com/page-1&#10;https://example.com/page-2&#10;https://example.com/page-3"
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
          />
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex items-center justify-end space-x-2">
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
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30 flex items-center space-x-1.5"
          >
            {loading ? 'Shortening Batch...' : 'Process Bulk Import'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

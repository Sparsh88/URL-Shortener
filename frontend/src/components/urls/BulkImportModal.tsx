import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { urlService } from '../../services/urlService';
import { useToast } from '../common/Toast';
import Papa from 'papaparse';
import { FileUp, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedData(results.data);
      },
      error: (err) => {
        showToast(`CSV parse error: ${err.message}`, 'error');
      },
    });
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      showToast('No valid URL records found in CSV file', 'error');
      return;
    }

    setLoading(true);
    try {
      // Format data: expected headers: originalUrl, title, customAlias, tags
      const formatted = parsedData.map((row) => ({
        originalUrl: row.originalUrl || row.url || row.Destination || row.link,
        title: row.title || row.Title || '',
        customAlias: row.customAlias || row.alias || row.Alias || '',
        tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
      }));

      const res = await urlService.bulkImport(formatted);
      if (res.success) {
        showToast(`Successfully imported ${res.data.length} short links!`, 'success');
        onSuccess();
        onClose();
        setCsvFile(null);
        setParsedData([]);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Bulk import failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Import URLs via CSV" maxWidth="lg">
      <div className="space-y-4">
        <p className="text-xs text-slate-400">
          Upload a CSV file containing <code className="text-brand-400 font-mono">originalUrl</code>,{' '}
          <code className="text-brand-400 font-mono">title</code>, and optional{' '}
          <code className="text-brand-400 font-mono">customAlias</code> columns.
        </p>

        <div className="p-8 border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-2xl text-center bg-slate-900/50 transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            id="csv-upload"
            className="hidden"
          />
          <label htmlFor="csv-upload" className="cursor-pointer space-y-2 block">
            <FileUp className="w-10 h-10 text-brand-400 mx-auto" />
            <p className="text-sm font-semibold text-white">
              {csvFile ? csvFile.name : 'Click to upload or drag CSV file'}
            </p>
            <p className="text-xs text-slate-500">Supports .csv files up to 5MB</p>
          </label>
        </div>

        {parsedData.length > 0 && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Ready to import <strong>{parsedData.length}</strong> links.</span>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl glass-panel hover:bg-slate-800 text-xs font-semibold text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={loading || parsedData.length === 0}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
          >
            {loading ? 'Importing...' : 'Start Import'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ShieldAlert, CheckCircle } from 'lucide-react';

export const AbuseReportPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [url, setUrl] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center space-x-3 text-amber-400">
          <ShieldAlert className="w-8 h-8" />
          <h1 className="text-3xl font-extrabold text-white">Report Malicious Link</h1>
        </div>
        <p className="text-slate-400 text-sm">
          LinkForge maintains zero tolerance for phishing, malware, or illegal content. If you found a suspicious LinkForge short link, please submit a report below for immediate review.
        </p>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-3">
            <div className="flex items-center space-x-2 font-bold text-lg text-emerald-400">
              <CheckCircle className="w-6 h-6" />
              <span>Report Received</span>
            </div>
            <p className="text-sm">
              Thank you for helping keep LinkForge safe. Our security team will inspect and take appropriate action on the reported link.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 glass-panel p-8 rounded-3xl border border-slate-800">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Suspicious Short Link or URL *
              </label>
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://linkforge.app/r/abcd123"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Reason for Report
              </label>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Phishing, malware, impersonation, illegal content, etc."
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg transition-all"
            >
              Submit Report
            </button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
};

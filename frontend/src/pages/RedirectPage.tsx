import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { urlService } from '../services/urlService';
import { useToast } from '../components/common/Toast';
import { Lock, ArrowRight, ShieldAlert, Link2 } from 'lucide-react';

export const RedirectPage: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortCode || !password) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await urlService.verifyPassword(shortCode, password);
      if (res.success && res.data.targetUrl) {
        showToast('Password verified! Redirecting...', 'success');
        window.location.href = res.data.targetUrl;
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Incorrect passcode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Protected Link</h2>
          <p className="text-xs text-slate-400">
            This link is passcode protected. Please enter the secret password to continue.
          </p>
        </div>

        <form onSubmit={handleVerifyPassword} className="space-y-4">
          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter passcode..."
              className="w-full px-4 py-3 rounded-xl glass-input text-center text-sm font-semibold tracking-wider"
            />
            {errorMsg && <p className="text-xs text-rose-400 mt-2">{errorMsg}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 transition-all"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Unlock & Redirect</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

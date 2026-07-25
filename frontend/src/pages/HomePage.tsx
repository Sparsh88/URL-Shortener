import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { QuickShortenBar } from '../components/urls/QuickShortenBar';
import {
  BarChart3,
  QrCode,
  Sparkles,
  Lock,
  ArrowRight,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col selection:bg-brand-500 selection:text-white transition-colors duration-200">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 space-y-20">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-panel border border-brand-500/30 text-xs font-semibold text-brand-600 dark:text-brand-300">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Next-Gen Enterprise URL Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Shorten, Protect & Track Your Links with{' '}
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 dark:from-brand-400 dark:via-indigo-400 dark:to-sky-400 bg-clip-text text-transparent">
              Precision Intelligence
            </span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            LinkForge provides real-time click tracking, custom aliases, QR codes, password protection, and developer REST APIs built for modern creators & teams.
          </p>

          {/* Quick Shorten Hero Box */}
          <div className="pt-4 max-w-2xl mx-auto">
            <QuickShortenBar />
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <div className="p-8 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Interactive Analytics</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Track clicks, unique visitors, geolocation (country & city), device types, OS, and referral sources in real-time.
            </p>
          </div>

          <div className="p-8 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Custom QR Codes</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Generate customizable high-resolution QR codes for physical campaigns, print, and social media with single-click PNG download.
            </p>
          </div>

          <div className="p-8 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Passcode & Self-Destruct</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Secure sensitive links with password challenges, set custom expiration timers, or create self-destructing one-time links.
            </p>
          </div>
        </div>

        {/* Call To Action Banner */}
        <div className="p-10 rounded-3xl glass-panel bg-gradient-to-r from-brand-50 via-slate-100 to-indigo-50 dark:from-brand-900/50 dark:via-slate-900 dark:to-indigo-900/50 border border-brand-500/20 text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Ready to streamline your links?</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 max-w-xl mx-auto">
            Create an account today to access full dashboard management, custom folders, bulk CSV import, and developer API keys.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 flex items-center space-x-2 transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

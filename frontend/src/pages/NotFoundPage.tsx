import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Link2, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <h1 className="text-8xl font-black text-brand-500/30">404</h1>
        <h2 className="text-2xl font-bold text-white">Page or Short Link Not Found</h2>
        <p className="text-sm text-slate-400 max-w-sm">
          The link you tried to access may have expired, been deleted, or entered incorrectly.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </main>
    </div>
  );
};

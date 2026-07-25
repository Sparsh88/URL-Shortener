import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, FileText } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span className="font-bold text-white">LinkForge</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>

        <div className="flex flex-wrap items-center justify-center space-x-4 sm:space-x-6">
          <Link to="/privacy" className="hover:text-white transition-colors flex items-center space-x-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </Link>
          <Link to="/terms" className="hover:text-white transition-colors flex items-center space-x-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </Link>
          <Link to="/report-abuse" className="hover:text-amber-400 text-slate-400 transition-colors flex items-center space-x-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Report Abuse</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

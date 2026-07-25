import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { ApiKeyManager } from '../components/developer/ApiKeyManager';
import { Code2 } from 'lucide-react';

export const DeveloperPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Code2 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              <span>Developer API Hub</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Manage your REST API keys and integrate LinkForge url shortening directly into your workflows
            </p>
          </div>
        </div>

        <ApiKeyManager />
      </main>
    </div>
  );
};

import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="glass-panel p-6 rounded-2xl animate-pulse space-y-3 border border-slate-200 dark:border-zinc-800">
    <div className="flex items-center justify-between">
      <div className="h-3.5 bg-slate-200 dark:bg-zinc-800 rounded w-1/3"></div>
      <div className="w-5 h-5 bg-slate-200 dark:bg-zinc-800 rounded-lg"></div>
    </div>
    <div className="h-7 bg-slate-300 dark:bg-zinc-700 rounded w-1/2"></div>
    <div className="h-3 bg-slate-200 dark:bg-zinc-800/60 rounded w-2/3"></div>
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="glass-panel rounded-2xl overflow-hidden p-4 space-y-3 animate-pulse border border-slate-200 dark:border-zinc-800">
    <div className="h-10 bg-slate-200 dark:bg-zinc-800/80 rounded-xl"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-14 bg-slate-100 dark:bg-zinc-800/40 rounded-xl"></div>
    ))}
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="glass-panel p-6 rounded-2xl animate-pulse space-y-4 h-72 flex flex-col justify-between border border-slate-200 dark:border-zinc-800">
    <div className="h-5 bg-slate-200 dark:bg-zinc-800 rounded w-1/4"></div>
    <div className="h-44 bg-slate-100 dark:bg-zinc-800/30 rounded-xl w-full"></div>
  </div>
);

export const PageLoaderSkeleton: React.FC = () => (
  <div className="min-h-screen bg-slate-100 dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col">
    {/* Navbar skeleton */}
    <div className="h-16 border-b border-slate-200 dark:border-zinc-800 glass-panel flex items-center justify-between px-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-zinc-800 animate-pulse"></div>
        <div className="w-24 h-5 rounded bg-slate-200 dark:bg-zinc-800 animate-pulse"></div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-20 h-8 rounded-lg bg-slate-200 dark:bg-zinc-800 animate-pulse"></div>
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 animate-pulse"></div>
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      <div className="h-10 bg-slate-200 dark:bg-zinc-800/60 rounded-2xl w-1/3"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <TableSkeleton />
    </div>
  </div>
);

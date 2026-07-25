import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="glass-panel p-6 rounded-2xl animate-pulse space-y-4">
    <div className="h-4 bg-slate-800 rounded w-1/3"></div>
    <div className="h-8 bg-slate-800 rounded w-1/2"></div>
    <div className="h-3 bg-slate-800/60 rounded w-2/3"></div>
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="glass-panel rounded-2xl overflow-hidden p-4 space-y-3 animate-pulse">
    <div className="h-10 bg-slate-800/80 rounded"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-14 bg-slate-800/40 rounded"></div>
    ))}
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="glass-panel p-6 rounded-2xl animate-pulse space-y-4 h-72 flex flex-col justify-between">
    <div className="h-6 bg-slate-800 rounded w-1/4"></div>
    <div className="h-44 bg-slate-800/30 rounded w-full"></div>
  </div>
);

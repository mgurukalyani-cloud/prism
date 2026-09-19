import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading system telemetry...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-500 space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-sm font-medium tracking-wide text-slate-700">{text}</p>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="w-full space-y-3 animate-pulse">
      <div className="h-10 bg-slate-200 rounded-lg"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 bg-white rounded-lg border border-slate-200"></div>
      ))}
    </div>
  );
}

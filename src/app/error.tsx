'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">មានបញ្ហាបច្ចេកទេសមួយចំនួន</h1>
          <p className="text-xs text-slate-400">
            សូមអភ័យទោសចំពោះការរំខាន។ សូមព្យាយាម Refresh ឬចុចទាញយកទិន្នន័យឡើងវិញ។
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="btn-uiverse-primary w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ព្យាយាមម្តងទៀត</span>
          </button>
          <Link
            href="/"
            className="btn-uiverse-secondary w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>ទំព័រដើម</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

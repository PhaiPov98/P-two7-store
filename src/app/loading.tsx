import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-[40vh] w-full flex flex-col items-center justify-center gap-3 py-12">
      <div className="w-9 h-9 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
      <p className="text-[11px] text-slate-400 font-medium tracking-wide">
        កំពុងដំណើរការ...
      </p>
    </div>
  );
}


import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-4">
      <div className="relative w-14 h-14">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
        {/* Inner spinning spinner */}
        <div className="w-14 h-14 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin shadow-lg shadow-blue-500/30" />
      </div>
      <p className="text-xs text-slate-400 font-medium tracking-wide animate-pulse">
        កំពុងផ្ទុកទំព័រ... (Loading)
      </p>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Send } from 'lucide-react';
import { KHMER_TEXT } from '@/lib/translations';

export default function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-slate-800 text-slate-400 mt-16 pb-8 sm:pb-0">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          {/* Brand Col */}
          <div className="text-center md:text-left">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/10 group-hover:scale-105 transition-transform duration-300">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">
                {KHMER_TEXT.brandName} <span className="text-blue-400">{KHMER_TEXT.brandSubtitle}</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 mt-2 max-w-sm hidden md:block">
              ហាងឌីជីថលលក់ Product Key សុទ្ធ 100% និងទាញយក Software Files លឿនរហ័ស ធានាគុណភាពនៅកម្ពុជា។
            </p>
          </div>

          {/* Telegram Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto">
            <a
              href="https://t.me/BozzPovvDev"
              target="_blank"
              rel="noreferrer"
              className="w-full max-w-[280px] sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500/10 to-blue-500/10 hover:from-sky-500/20 hover:to-blue-500/20 text-sky-400 hover:text-sky-300 border border-sky-500/30 hover:border-sky-400/60 shadow-md shadow-sky-500/10 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 text-xs font-bold group"
            >
              <div className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Send className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <span className="tracking-wide">@BozzPovvDev</span>
            </a>
            <a
              href="https://t.me/povcoding"
              target="_blank"
              rel="noreferrer"
              className="w-full max-w-[280px] sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:to-indigo-500/20 text-purple-400 hover:text-purple-300 border border-purple-500/30 hover:border-purple-400/60 shadow-md shadow-purple-500/10 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 text-xs font-bold group"
            >
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Send className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <span className="tracking-wide">Group @povcoding</span>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800/80 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-xs text-slate-400">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 leading-relaxed">
            <span className="whitespace-nowrap">© {new Date().getFullYear()} P-Two7 Digital Store</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="whitespace-nowrap">ហាងឌីជីថល P-Two7</span>
            <span className="hidden sm:inline text-slate-600">—</span>
            <span className="text-slate-500 whitespace-nowrap">រក្សាសិទ្ធិគ្រប់យ៉ាង។</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

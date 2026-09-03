'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Send } from 'lucide-react';
import { KHMER_TEXT } from '@/lib/translations';

export default function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-slate-800 text-slate-400 mt-16">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand Col */}
          <div className="text-center md:text-left">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white">
                {KHMER_TEXT.brandName} <span className="text-blue-400">{KHMER_TEXT.brandSubtitle}</span>
              </span>
            </Link>
          </div>

          {/* Telegram Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
            <a
              href="https://t.me/BozzPovvDev"
              target="_blank"
              rel="noreferrer"
              className="btn-neon-76 px-4 py-2 rounded-none text-xs"
              style={{ '--neon': '#0ea5e9' } as React.CSSProperties}
            >
              <span className="neon-edge top"></span>
              <span className="neon-edge right"></span>
              <span className="neon-edge bottom"></span>
              <span className="neon-edge left"></span>
              <Send className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">@BozzPovvDev</span>
            </a>
            <a
              href="https://t.me/povcoding"
              target="_blank"
              rel="noreferrer"
              className="btn-neon-76 px-4 py-2 rounded-none text-xs"
              style={{ '--neon': '#a855f7' } as React.CSSProperties}
            >
              <span className="neon-edge top"></span>
              <span className="neon-edge right"></span>
              <span className="neon-edge bottom"></span>
              <span className="neon-edge left"></span>
              <Send className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Group @povcoding</span>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800/80 mt-12 pt-8 flex items-center justify-center text-center text-xs">
          <p>© {new Date().getFullYear()} P-Two7 Digital Store (ហាងឌីជីថល P-Two7) — រក្សាសិទ្ធិគ្រប់យ៉ាង។</p>
        </div>
      </div>
    </footer>
  );
}

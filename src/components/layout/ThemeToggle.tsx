'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-700/50 bg-slate-800/40 animate-pulse ${className}`} />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'ប្តូរទៅ Light Mode' : 'ប្តូរទៅ Dark Mode'}
      title={isDark ? 'ប្តូរទៅ Light Mode ☀️' : 'ប្តូរទៅ Dark Mode 🌙'}
      className={`theme-toggle-btn relative inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
        isDark
          ? 'bg-dark-900/90 hover:bg-dark-800 border-slate-700/80 text-amber-400 hover:text-amber-300 shadow-md shadow-amber-500/10 hover:shadow-amber-500/25'
          : 'bg-white hover:bg-slate-50 border-slate-200 text-indigo-600 hover:text-indigo-500 shadow-sm hover:shadow-md'
      } ${className}`}
    >
      <div className="relative w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center">
        {/* Sun Icon */}
        <Sun
          className={`w-4 h-4 sm:w-[18px] sm:h-[18px] transition-all duration-500 transform ${
            isDark
              ? 'opacity-100 rotate-0 scale-100 text-amber-400'
              : 'opacity-0 -rotate-90 scale-0 text-amber-500'
          }`}
        />
        {/* Moon Icon */}
        <Moon
          className={`w-4 h-4 sm:w-[18px] sm:h-[18px] absolute transition-all duration-500 transform ${
            isDark
              ? 'opacity-0 rotate-90 scale-0 text-indigo-400'
              : 'opacity-100 rotate-0 scale-100 text-indigo-600'
          }`}
        />
      </div>
    </button>
  );
}

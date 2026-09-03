'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, KeyRound, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successReset, setSuccessReset] = useState(false);

  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      error('បញ្ហា Link', 'Link នេះមិនត្រឹមត្រូវ ឬផុតកំណត់');
      return;
    }

    if (password.length < 6) {
      error('ពាក្យសម្ងាត់ខ្លីពេក', 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ');
      return;
    }

    if (password !== confirmPassword) {
      error('មិនត្រូវគ្នាទេ', 'ពាក្យសម្ងាត់ទាំងពីរមិនដូចគ្នាទេ');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        error('មិនអាចកំណត់បានទេ', data.error || 'មានបញ្ហាបច្ចេកទេស');
        setLoading(false);
        return;
      }

      setSuccessReset(true);
      success('ជោគជ័យ!', 'ពាក្យសម្ងាត់ត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ!');
    } catch (err) {
      error('មានបញ្ហា', 'សូមព្យាយាមម្តងទៀត');
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Link មិនត្រឹមត្រូវ ឬផុតកំណត់</h2>
        <p className="text-xs text-slate-400">
          សូមចូលទៅកាន់ទំព័រភ្លេចពាក្យសម្ងាត់ ដើម្បីស្នើសុំ Link ថ្មីម្តងទៀត។
        </p>
        <Link
          href="/forgot-password"
          className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
        >
          ស្នើសុំ Link ថ្មី
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/25 border border-blue-400/20">
          <KeyRound className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">កំណត់ពាក្យសម្ងាត់ថ្មី</h1>
        <p className="text-xs text-slate-400">សូមវាយពាក្យសម្ងាត់ថ្មីរបស់អ្នក</p>
      </div>

      {/* Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        {successReset ? (
          <div className="text-center space-y-5 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">ប្តូរពាក្យសម្ងាត់ជោគជ័យ!</h3>
              <p className="text-xs text-slate-400">
                ពាក្យសម្ងាត់ថ្មីរបស់អ្នកត្រូវបានកំណត់រួចរាល់ហើយ។ អ្នកអាចចូលគណនីបានឥឡូវនេះ។
              </p>
            </div>
            <Link
              href="/login"
              className="btn-uiverse-remon125 btn-uiverse-remon125-blue w-full !py-3.5 px-6 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
            >
              <span className="bg-layer" />
              <span className="bg-layer" />
              <span className="bg-layer" />
              <span className="bg-layer" />
              <span className="relative z-10">ចូលគណនីឥឡូវនេះ (Go to Login)</span>
              <ArrowRight className="w-4 h-4 relative z-10" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300">ពាក្យសម្ងាត់ថ្មី (New Password) *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="យ៉ាងហោចណាស់ 6 តួអក្សរ"
                  className="w-full bg-dark-850 border border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-10 py-3 text-white font-mono focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300">ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់ (Confirm Password) *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="វាយពាក្យសម្ងាត់ម្ដងទៀត"
                  className="w-full bg-dark-850 border border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-3 py-3 text-white font-mono focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-uiverse-remon125 btn-uiverse-remon125-blue w-full !py-3.5 px-6 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              <span className="bg-layer" />
              <span className="bg-layer" />
              <span className="bg-layer" />
              <span className="bg-layer" />
              <span className="relative z-10">{loading ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកពាក្យសម្ងាត់ថ្មី'}</span>
              <CheckCircle2 className="w-4 h-4 relative z-10" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">កំពុងផ្ទុក...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

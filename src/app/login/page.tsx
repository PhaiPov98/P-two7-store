'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Zap, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { KHMER_TEXT } from '@/lib/translations';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, refreshUser } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect') || '/account';
  const errorParam = searchParams?.get('error');

  useEffect(() => {
    if (errorParam === 'google_not_configured') {
      error('Google Login', 'មិនទាន់បានកំណត់ GOOGLE_CLIENT_ID នៅក្នុង .env នៅឡើយទេ');
    } else if (errorParam === 'google_auth_failed' || errorParam?.startsWith('google_')) {
      error('Google Login បរាជ័យ', 'មិនអាចចូលគណនីតាម Google បានទេ សូមសាកល្បងម្ដងទៀត');
    }
  }, [errorParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        error('ចូលគណនីមិនបានសម្រេច', data.error || 'Email ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ');
        setLoading(false);
        return;
      }

      login(data.user);
      await refreshUser();
      success('ចូលគណនីជោគជ័យ!', `សូមស្វាគមន៍ ${data.user.name}`);

      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push(redirectUrl);
      }
      router.refresh();
    } catch (err) {
      error('មានបញ្ហា', 'សូមព្យាយាមម្តងទៀត');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/25 border border-blue-400/20">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">ចូលគណនី</h1>
        <p className="text-xs text-slate-400">សូមបំពេញ Email និង ពាក្យសម្ងាត់របស់អ្នក</p>
      </div>

      {/* Login Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-300">Email (អ៊ីមែល) *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@example.com"
                className="w-full bg-dark-850 border border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-3 py-3 text-white font-mono focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-300">ពាក្យសម្ងាត់ *</label>
              <Link href="/forgot-password" className="text-[11px] text-blue-400 hover:underline">
                ភ្លេចពាក្យសម្ងាត់?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
            <span className="relative z-10">{loading ? 'កំពុងពិនិត្យ...' : KHMER_TEXT.nav.login}</span>
            <ArrowRight className="w-4 h-4 relative z-10" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-dark-900 px-3 text-[11px] font-semibold text-slate-400 absolute">
            ឬបន្តជាមួយ
          </span>
        </div>

        {/* Google Sign In Button */}
        <div>
          <button
            type="button"
            onClick={() => {
              window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirectUrl)}`;
            }}
            className="btn-google-auth"
          >
            <svg className="w-4 h-4 relative z-10" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="relative z-10">ចូលគណនីជាមួយ Google</span>
          </button>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          មិនទាន់មានគណនីនៅឡើយ?{' '}
          <Link href="/register" className="text-blue-400 font-bold hover:underline">
            {KHMER_TEXT.nav.register}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">កំពុងផ្ទុក...</div>}>
      <LoginContent />
    </Suspense>
  );
}

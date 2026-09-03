'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowLeft,
  KeyRound,
  Fingerprint,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, refreshUser } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

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

      if (data.user.role !== 'ADMIN') {
        error('សិទ្ធិមិនគ្រប់គ្រាន់', 'គណនីនេះមិនមែនជា Admin ឡើយ!');
        setLoading(false);
        return;
      }

      login(data.user);
      await refreshUser();
      success('ចូលផ្ទាំង Admin ជោគជ័យ!', `សូមស្វាគមន៍ Admin ${data.user.name}`);
      router.push('/admin');
      router.refresh();
    } catch (err) {
      error('មានបញ្ហា', 'សូមព្យាយាមម្តងទៀត');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12">
      {/* High-Tech Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ត្រឡប់ទៅកាន់ Store</span>
        </Link>

        {/* Header Badge */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-900 flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/40 border border-purple-400/40 relative group">
            <ShieldCheck className="w-8 h-8 text-white" />
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-dark-900 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold tracking-wider uppercase mb-1">
              <Fingerprint className="w-3 h-3 text-purple-400" />
              RESTRICTED ACCESS PORTAL
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">ចូលគណនី Admin</h1>
            <p className="text-xs text-slate-400 mt-1">
              ផ្ទាំងគ្រប់គ្រងប្រព័ន្ធសុវត្ថិភាព Admin Dashboard
            </p>
          </div>
        </div>

        {/* High-Tech Admin Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-purple-500/40 bg-dark-900/90 space-y-6 shadow-2xl shadow-purple-950/40 backdrop-blur-2xl">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Email Admin */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-200">Email Admin *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-dark-850/90 border border-purple-500/30 focus:border-purple-400 rounded-xl pl-10 pr-3 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Password Admin */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-200">ពាក្យសម្ងាត់ Admin *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-850/90 border border-purple-500/30 focus:border-purple-400 rounded-xl pl-10 pr-10 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-slate-500"
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
              className="btn-uiverse-remon125 btn-uiverse-remon125-purple w-full !py-3.5 px-6 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2 mt-3"
            >
              <span className="bg-layer" />
              <span className="bg-layer" />
              <span className="bg-layer" />
              <span className="bg-layer" />
              <KeyRound className="w-4 h-4 relative z-10" />
              <span className="relative z-10 font-bold">
                {loading ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'ចូលផ្ទាំង Admin'}
              </span>
              <ArrowRight className="w-4 h-4 relative z-10" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

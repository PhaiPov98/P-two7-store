'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ShieldCheck, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface ProfileInfo {
  name: string;
  email: string;
  avatar?: string | null;
}

function SetupPasswordContent() {
  const { login, refreshUser } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect') || '/account';

  const emailParam = searchParams?.get('email');
  const nameParam = searchParams?.get('name');
  const avatarParam = searchParams?.get('avatar');

  const initialProfile: ProfileInfo | null = emailParam
    ? {
        name: nameParam || 'Google User',
        email: emailParam,
        avatar: avatarParam || null,
      }
    : null;

  const [profile, setProfile] = useState<ProfileInfo | null>(initialProfile);
  const [fetching, setFetching] = useState(!initialProfile);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialProfile) return;

    async function fetchProfile() {
      try {
        const res = await fetch('/api/auth/setup-password');
        if (!res.ok) {
          router.replace('/login');
          return;
        }
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
        } else {
          router.replace('/login');
        }
      } catch {
        router.replace('/login');
      } finally {
        setFetching(false);
      }
    }
    fetchProfile();
  }, [router, initialProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const res = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        error('បរាជ័យ', data.error || 'មានបញ្ហាបច្ចេកទេស');
        setLoading(false);
        return;
      }

      if (data.user) {
        login(data.user);
      }
      await refreshUser();
      success('កំណត់ពាក្យសម្ងាត់ជោគជ័យ!', 'គណនីរបស់អ្នកត្រូវបានបង្កើត និងចូលប្រើប្រាស់');
      router.push(redirectUrl);
      router.refresh();
    } catch (err) {
      error('មានបញ្ហា', 'សូមព្យាយាមម្តងទៀត');
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">កំពុងផ្ទៀងផ្ទាត់ទិន្នន័យ Google...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/25 border border-blue-400/20">
          <KeyRound className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">ជំហានចុងក្រោយ៖ កំណត់ពាក្យសម្ងាត់</h1>
      </div>

      {/* User Google Card */}
      {profile && (
        <div className="flex items-center gap-3 p-3.5 bg-dark-850/80 border border-slate-800 rounded-2xl">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base overflow-hidden border border-slate-700 relative shrink-0 shadow-inner">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-full object-cover"
              />
            ) : null}
            <span className="absolute inset-0 flex items-center justify-center -z-0">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'G'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{profile.name}</p>
            <p className="text-[11px] text-slate-400 font-mono truncate">{profile.email}</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            Google Verified
          </span>
        </div>
      )}

      {/* Form Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-300">ពាក្យសម្ងាត់ថ្មី (Password) *</label>
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

          {/* Mandatory Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-uiverse-remon125 btn-uiverse-remon125-blue w-full !py-3.5 px-6 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span className="bg-layer" />
              <span className="bg-layer" />
              <span className="bg-layer" />
              <span className="bg-layer" />
              <span className="relative z-10">
                {loading ? 'កំពុងបង្កើតគណនី...' : 'បង្កើតគណនី និងចូលប្រើប្រាស់ (Complete & Log In)'}
              </span>
              <CheckCircle2 className="w-4 h-4 relative z-10" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">កំពុងផ្ទុក...</div>}>
      <SetupPasswordContent />
    </Suspense>
  );
}

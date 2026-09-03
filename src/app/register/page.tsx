'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Phone, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { KHMER_TEXT } from '@/lib/translations';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, refreshUser } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      error('ពាក្យសម្ងាត់ខ្លីពេក', 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        error('ការចុះឈ្មោះមិនបានសម្រេច', data.error || 'មានបញ្ហាបច្ចេកទេស');
        setLoading(false);
        return;
      }

      login(data.user);
      await refreshUser();
      success('បង្កើតគណនីជោគជ័យ!', `សូមស្វាគមន៍មកកាន់ P-Two7 Digital Store`);
      router.push('/account');
      router.refresh();
    } catch (err) {
      error('មានបញ្ហា', 'សូមព្យាយាមម្តងទៀត');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/25">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">បង្កើតគណនីថ្មី</h1>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="input-jkhuger">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ឈ្មោះពេញ"
            />
            <span className="input-label">ឈ្មោះពេញ (Full Name)</span>
            <User className="w-4 h-4 input-icon" />
          </div>

          <div className="input-jkhuger">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="font-mono"
            />
            <span className="input-label">Email</span>
            <Mail className="w-4 h-4 input-icon" />
          </div>

          <div className="input-jkhuger">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
            />
            <span className="input-label">ទូរស័ព្ទ (Optional)</span>
            <Phone className="w-4 h-4 input-icon" />
          </div>

          <div className="input-jkhuger">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="font-mono"
            />
            <span className="input-label">ពាក្យសម្ងាត់ (6+ តួ)</span>
            <Lock className="w-4 h-4 input-icon" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-uiverse-remon125 btn-uiverse-remon125-blue w-full !py-3.5 px-6 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span className="bg-layer" />
            <span className="bg-layer" />
            <span className="bg-layer" />
            <span className="bg-layer" />
            <span className="relative z-10">{loading ? 'កំពុងបង្កើតគណនី...' : KHMER_TEXT.nav.register}</span>
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
              window.location.href = '/api/auth/google?redirect=/account';
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
            <span className="relative z-10">ចុះឈ្មោះជាមួយ Google</span>
          </button>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          មានគណនីរួចហើយ?{' '}
          <Link href="/login" className="text-blue-400 font-bold hover:underline">
            {KHMER_TEXT.nav.login}
          </Link>
        </div>
      </div>
    </div>
  );
}

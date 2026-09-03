'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { Mail, KeyRound, ArrowLeft, CheckCircle2, Send, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

function ForgotPasswordContent() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        error('មិនអាចស្នើសុំបានទេ', data.error || 'រកមិនឃើញ Email នេះទេ');
        setLoading(false);
        return;
      }

      setSentSuccess(true);
      success('ជោគជ័យ!', 'Email ផ្ទៀងផ្ទាត់ត្រូវបានផ្ញើទៅកាន់ប្រអប់សំបុត្ររបស់អ្នកហើយ!');
    } catch (err) {
      error('មានបញ្ហា', 'សូមព្យាយាមម្តងទៀត');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 flex items-center justify-center mx-auto shadow-xl shadow-orange-500/25 border border-orange-400/20">
          <KeyRound className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">ភ្លេចពាក្យសម្ងាត់?</h1>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          សូមបញ្ចូល Email គណនីរបស់អ្នក ដើម្បីទទួលបានសារផ្ទៀងផ្ទាត់ (Verify in Email)
        </p>
      </div>

      {/* Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        {sentSuccess ? (
          <div className="text-center space-y-5 py-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">សូមពិនិត្យមើល Email របស់អ្នក</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                យើងបានផ្ញើ Email ផ្ទៀងផ្ទាត់ទៅកាន់ <span className="text-blue-400 font-mono font-bold block mt-1">{email}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-2">
                សូមបើកមើលប្រអប់សំបុត្រ (Inbox ឬ Spam) រួចចុចប៊ូតុង <span className="text-slate-300 font-semibold">"Verify & Reset Password"</span> នៅក្នុង Email នោះ ដើម្បីកំណត់ Password ថ្មី។
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 space-y-2.5">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-uiverse-remon125 btn-uiverse-remon125-blue w-full !py-3.5 px-6 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <span className="bg-layer" />
                <span className="bg-layer" />
                <span className="bg-layer" />
                <span className="bg-layer" />
                <ExternalLink className="w-4 h-4 relative z-10" />
                <span className="relative z-10">បើកមើល Gmail (Open Gmail)</span>
              </a>

              <button
                type="button"
                onClick={() => setSentSuccess(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all text-center flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ផ្ញើសារសារជាថ្មី (Resend)</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <Link
                href="/login"
                className="text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ត្រឡប់ទៅកាន់ទំព័រចូលគណនី (Login)</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300">Email គណនីរបស់អ្នក *</label>
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

            <button
              type="submit"
              disabled={loading}
              className="btn-uiverse-remon125 btn-uiverse-remon125-blue w-full !py-3.5 px-6 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span className="bg-layer" />
              <span className="bg-layer" />
              <span className="bg-layer" />
              <span className="bg-layer" />
              <Send className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{loading ? 'កំពុងផ្ញើ...' : 'ផ្ញើសារផ្ទៀងផ្ទាត់ (Send Verification Email)'}</span>
            </button>

            <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
              <Link href="/login" className="text-blue-400 font-bold hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ត្រឡប់ទៅចូលគណនី</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">កំពុងផ្ទុក...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}

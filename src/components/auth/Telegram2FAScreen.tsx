'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Send, CheckCircle2, Clock, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Telegram2FAScreenProps {
  requestId: string;
  email: string;
  onSuccess: (user: any) => void;
  onCancel: () => void;
}

export default function Telegram2FAScreen({
  requestId,
  email,
  onSuccess,
  onCancel,
}: Telegram2FAScreenProps) {
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [errorMsg, setErrorMsg] = useState('');
  const { success, error } = useToast();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMsg('សំណើបានផុតកំណត់ ៣ នាទី។ សូមព្យាយាមម្តងទៀត។');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 2. Real-Time Polling for Telegram [Approve] click
  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/auth/admin-login-status?requestId=${requestId}`);
        if (!res.ok) return;
        const data = await res.json();

        if (!isMounted) return;

        if (data.status === 'APPROVED' && data.user) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          success('ផ្ទៀងផ្ទាត់ជោគជ័យ!', 'Telegram Bot បានយល់ព្រមអនុញ្ញាត។');
          onSuccess(data.user);
        } else if (data.status === 'REJECTED') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          error('បដិសេធ', 'សំណើចូលគណនីត្រូវបានបដិសេធពី Telegram!');
          setErrorMsg('សំណើចូលគណនីត្រូវបានបដិសេធ!');
        } else if (data.status === 'EXPIRED') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setErrorMsg('សំណើបានផុតកំណត់ ៣ នាទី។');
        }
      } catch (err) {
        // network polling error ignored
      }
    };

    pollingRef.current = setInterval(checkStatus, 1500);

    return () => {
      isMounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [requestId, onSuccess, error, success]);

  // 3. Manual OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setErrorMsg('សូមបំពេញលេខកូដ OTP ៦ ខ្ទង់');
      return;
    }

    setVerifyingOtp(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/admin-verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, otpCode: otpCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'លេខកូដ OTP មិនត្រឹមត្រូវទេ');
        error('កំហុស', data.error || 'លេខកូដ OTP មិនត្រឹមត្រូវ');
        setVerifyingOtp(false);
        return;
      }

      if (pollingRef.current) clearInterval(pollingRef.current);
      success('ផ្ទៀងផ្ទាត់ជោគជ័យ!', 'លេខកូដ OTP ត្រឹមត្រូវ។');
      onSuccess(data.user);
    } catch (err) {
      setErrorMsg('មានបញ្ហាក្នុងការផ្ទៀងផ្ទាត់');
      setVerifyingOtp(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="glass-card p-5 sm:p-8 rounded-3xl border border-sky-500/40 bg-dark-900/95 space-y-6 shadow-2xl shadow-sky-950/40 backdrop-blur-2xl text-center animate-in fade-in zoom-in-95 duration-200 max-w-md mx-auto">
      {/* Header Icon with Radar Pulse */}
      <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-sky-500/20 animate-ping opacity-60 pointer-events-none" />
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-sky-500/40 border border-sky-300/40 relative z-10">
          <Send className="w-8 h-8 text-white -translate-x-0.5 translate-y-0.5" />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-[10px] font-bold tracking-wider uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          TELEGRAM 2FA APPROVAL
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">រង់ចាំការយល់ព្រមពី Telegram</h2>
        <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
          ប្រព័ន្ធបានផ្ញើសំណើអនុញ្ញាតទៅកាន់ Telegram Bot របស់អ្នក (<code>{email}</code>)។
        </p>
      </div>

      {/* Pulse Status Indicator */}
      <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500" />
          </span>
          <div>
            <p className="text-xs font-bold text-white leading-tight">កំពុងរង់ចាំចុច [Approve]...</p>
            <p className="text-[10px] text-slate-400 leading-tight">ចុចលើ Telegram នោះវានឹង Login ស្វ័យប្រវត្ត</p>
          </div>
        </div>
        <div className="flex items-center gap-1 font-mono text-xs font-bold text-sky-300 bg-black/40 px-2 py-1 rounded-lg border border-sky-500/20 shrink-0">
          <Clock className="w-3 h-3 text-sky-400" />
          <span>{formatTimer(timeLeft)}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-800" />
        <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          ឬ វាយលេខកូដ OTP (6 ខ្ទង់)
        </span>
        <div className="flex-grow border-t border-slate-800" />
      </div>

      {/* OTP Manual Form */}
      <form onSubmit={handleVerifyOtp} className="space-y-3.5">
        <div className="space-y-1.5 text-left">
          <div className="relative">
            <KeyRound className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="វាយលេខកូដ ៦ ខ្ទង់ពី Telegram"
              className="w-full bg-dark-850/90 border border-sky-500/30 focus:border-sky-400 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-white font-mono text-center text-base sm:text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all placeholder:text-slate-500 placeholder:text-xs placeholder:tracking-normal"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={verifyingOtp || otpCode.length < 4 || timeLeft <= 0}
          className="btn-uiverse-remon125 btn-uiverse-remon125-cyan w-full !py-2.5 sm:!py-3 rounded-xl text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <span className="bg-layer" />
          <span className="bg-layer" />
          <span className="bg-layer" />
          <span className="bg-layer" />
          <CheckCircle2 className="w-4 h-4 relative z-10" />
          <span className="relative z-10 font-bold">
            {verifyingOtp ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'ផ្ទៀងផ្ទាត់លេខកូដ OTP'}
          </span>
        </button>
      </form>

      {/* Cancel Button */}
      <div className="pt-2 border-t border-slate-800/80">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>បោះបង់ ហើយ Login ម្តងទៀត</span>
        </button>
      </div>
    </div>
  );
}

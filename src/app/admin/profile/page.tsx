'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Mail,
  User,
  Phone,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Save,
  Shield,
  Zap,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

export default function AdminProfileSecurityPage() {
  const { user: authUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setName(data.user.name || '');
            setEmail(data.user.email || '');
            setPhone(data.user.phone || '');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      error('ពាក្យសម្ងាត់មិនត្រូវគ្នា', 'សូមផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់ថ្មីឱ្យបានត្រឹមត្រូវ');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      error('ពាក្យសម្ងាត់ខ្លីពេក', 'ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៦ តួអក្សរ');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        success('ជោគជ័យ!', 'ព័ត៌មានសុវត្ថិភាពត្រូវបានរក្សាទុករួចរាល់');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        await refreshUser();
      } else {
        error('មិនអាចរក្សាទុកបានទេ', data.error || 'មានបញ្ហា');
      }
    } catch (err) {
      error('មានបញ្ហាក្នុងការតភ្ជាប់');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>មជ្ឈមណ្ឌលសុវត្ថិភាព & គណនី Admin</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            គ្រប់គ្រង Email, ពាក្យសម្ងាត់ Admin, និងប្រព័ន្ធការពារសុវត្ថិភាពទូទៅ
          </p>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Middleware Guard</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Route <code>/admin/*</code> ត្រូវបានចាក់សោការពារកម្រិត Edge 100%។
          </p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-blue-500/30 bg-blue-950/10 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
            <Zap className="w-4 h-4" />
            <span>Rate Limiting</span>
          </div>
          <p className="text-[11px] text-slate-300">
            ចាក់សោស្វ័យប្រវត្តិ ១៥ នាទី បើ Login ខុសលើសពី ៥ ដង (Brute-Force Guard)។
          </p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-purple-500/30 bg-purple-950/10 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
            <Lock className="w-4 h-4" />
            <span>JWT & Bcrypt Salt</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Passphrase ត្រូវបាន Hash យ៉ាងរឹងមាំ និង Cookie ការពារ HttpOnly។
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="glass-card rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <User className="w-4 h-4 text-blue-400" />
          <span>ព័ត៌មានគណនី Admin & ប្តូរ Password</span>
        </h3>

        {loading ? (
          <div className="text-center py-8 text-slate-400 text-xs">កំពុងផ្ទុកទិន្នន័យ...</div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="space-y-6 text-xs">
            {/* Name, Email, Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  ឈ្មោះ Admin (Admin Name) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ឈ្មោះរបស់អ្នក"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Email Admin សម្រាប់ Login *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  លេខទូរស័ព្ទ (Phone Number)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+855 ..."
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Password Update Section */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>ប្តូរពាក្យសម្ងាត់ (Change Password)</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ទុកប្រអប់ខាងក្រោមឱ្យនៅទំនេរ ប្រសិនបើអ្នកមិនចង់ប្តូរពាក្យសម្ងាត់។
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    ពាក្យសម្ងាត់បច្ចុប្បន្ន (Current Password)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-dark-850 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-white font-mono focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    ពាក្យសម្ងាត់ថ្មី (New Password)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="យ៉ាងតិច ៦ តួអក្សរ"
                      className="w-full bg-dark-850 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-white font-mono focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់ថ្មី
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="វាយពាក្យសម្ងាត់ថ្មីម្តងទៀត"
                      className="w-full bg-dark-850 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-white font-mono focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="btn-uiverse-primary px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-xl shadow-blue-500/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការកែប្រែសុវត្ថិភាព'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { User, Lock, Phone, Mail, CheckCircle2, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function UserProfilePage() {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        error('មិនអាចរក្សាទុកបានទេ', data.error || 'មានបញ្ហាបច្ចេកទេស');
        return;
      }

      success('ជោគជ័យ!', 'ព័ត៌មានគណនីរបស់អ្នកត្រូវបានធ្វើបច្ចុប្បន្នភាព');
      setCurrentPassword('');
      setNewPassword('');
      refreshUser();
    } catch (err) {
      error('មានបញ្ហា', 'សូមព្យាយាមម្តងទៀត');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white">ព័ត៌មានផ្ទាល់ខ្លួន (Profile)</h1>
        <p className="text-xs text-slate-400 mt-0.5">គ្រប់គ្រងឈ្មោះ លេខទូរស័ព្ទ និងផ្លាស់ប្តូរពាក្យសម្ងាត់</p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Email (Read only) */}
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">
              Email (មិនអាចផ្លាស់ប្តូរបាន)
            </label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-dark-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 pl-10 cursor-not-allowed font-mono"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">ឈ្មោះពេញ (Full Name)</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white pl-10 focus:outline-none focus:border-blue-500"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">លេខទូរស័ព្ទ (Phone Number)</label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="ឧ. 012 345 678"
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white pl-10 focus:outline-none focus:border-blue-500"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Password Setting Box */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div>
              <h4 className="font-bold text-slate-200">កំណត់ ឬផ្លាស់ប្តូរពាក្យសម្ងាត់ (Password)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                សម្រាប់គណនី Google អ្នកអាចវាយបញ្ចូលតែ <strong>ពាក្យសម្ងាត់ថ្មី</strong> ដើម្បីអាច Login ជាមួយ Email និង Password បាន។
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1.5">ពាក្យសម្ងាត់បច្ចុប្បន្ន (ប្រសិនបើមាន)</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="ទុកទំនេរ ប្រសិនបើអ្នក Login ជាមួយ Google"
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1.5">ពាក្យសម្ងាត់ថ្មី (យ៉ាងហោចណាស់ 6 តួ)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="វាយពាក្យសម្ងាត់ថ្មីរបស់អ្នក"
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono placeholder:text-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការផ្លាស់ប្តូរ'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

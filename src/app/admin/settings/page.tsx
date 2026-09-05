'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  QrCode,
  Building2,
  Bell,
  Save,
  Send,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AdminSettingsPage() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingTg, setTestingTg] = useState(false);

  // Form State
  const [bakongId, setBakongId] = useState('phaipov@abaa');
  const [merchantName, setMerchantName] = useState('P-TWO7 STORE');
  const [merchantCity, setMerchantCity] = useState('Phnom Penh');
  const [bankName, setBankName] = useState('ABA Bank');
  const [accountNumber, setAccountNumber] = useState('000 123 456');
  const [accountName, setAccountName] = useState('PHAI POV');
  const [autoFulfill, setAutoFulfill] = useState('true');
  const [heroTicker, setHeroTicker] = useState('');

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        const s = data.settings || {};
        if (s.bakong_account_id) setBakongId(s.bakong_account_id);
        if (s.bakong_merchant_name) setMerchantName(s.bakong_merchant_name);
        if (s.bakong_merchant_city) setMerchantCity(s.bakong_merchant_city);
        if (s.payment_bank_name) setBankName(s.payment_bank_name);
        if (s.payment_account_number) setAccountNumber(s.payment_account_number);
        if (s.payment_account_name) setAccountName(s.payment_account_name);
        if (s.payment_auto_fulfill) setAutoFulfill(s.payment_auto_fulfill);
        if (s.hero_ticker_text) setHeroTicker(s.hero_ticker_text);
      }
    } catch (e) {
      console.error(e);
      error('បរាជ័យក្នុងការទាញយក Settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            bakong_account_id: bakongId.trim(),
            bakong_merchant_name: merchantName.trim(),
            bakong_merchant_city: merchantCity.trim(),
            payment_bank_name: bankName.trim(),
            payment_account_number: accountNumber.trim(),
            payment_account_name: accountName.trim(),
            payment_auto_fulfill: autoFulfill,
            hero_ticker_text: heroTicker.trim(),
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        success('បានរក្សាទុកការកំណត់ជោគជ័យ!', 'ការផ្លាស់ប្តូរត្រូវបាន Update ទៅកាន់ប្រព័ន្ធរួចរាល់');
      } else {
        error('បរាជ័យ', data.error || 'មិនអាចរក្សាទុកបានទេ');
      }
    } catch (err) {
      error('មានបញ្ហា', 'សូមព្យាយាមម្តងទៀត');
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    try {
      setTestingTg(true);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TEST_TELEGRAM',
          merchantName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        success('ផ្ញើសារសាកល្បងជោគជ័យ!', 'សូមពិនិត្យមើលសារក្នុង Telegram Bot របស់អ្នក');
      } else {
        error('ផ្ញើសារបរាជ័យ', data.error || 'សូមពិនិត្យ TELEGRAM_BOT_TOKEN');
      }
    } catch (err) {
      error('មានបញ្ហា', 'មិនអាចផ្ញើសារ Telegram បានទេ');
    } finally {
      setTestingTg(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">កំពុងទាញយកការកំណត់ប្រព័ន្ធ...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/10">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">ការកំណត់ប្រព័ន្ធ & ការទូទាត់ (Settings)</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              កំណត់គណនី Bakong KHQR, ព័ត៌មានធនាគារ, Telegram Bot និងការផ្ញើ Key ស្វ័យប្រវត្ត
            </p>
          </div>
        </div>

        <button
          onClick={loadSettings}
          className="px-3.5 py-2 bg-dark-850 hover:bg-dark-800 text-slate-300 border border-slate-700 rounded-xl text-xs flex items-center gap-1.5 w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Bakong KHQR Real Payment */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-red-500/30 bg-gradient-to-b from-red-950/20 via-dark-900 to-dark-900 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-red-600/30">
                KHQR
              </div>
              <div>
                <h2 className="text-base font-bold text-white">ការកំណត់ Bakong KHQR (Real Payment)</h2>
                <p className="text-[11px] text-slate-400">
                  រាល់ពេលអតិថិជន Checkout ប្រព័ន្ធនឹង generate Dynamic QR ផ្ទាល់ជាមួយ Bakong ID នេះ
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Active</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <span>Bakong Account ID</span>
                <span className="text-red-400">*</span>
                <span className="text-[10px] text-slate-400 font-normal">(ឧ. phaipov@abaa ឬ phaipov@aclb)</span>
              </label>
              <input
                type="text"
                required
                value={bakongId}
                onChange={(e) => setBakongId(e.target.value)}
                placeholder="ឧ. phaipov@abaa ឬ 098xxxxxx@..."
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                គណនី Bakong ដែលនឹងត្រូវទទួលប្រាក់ពីអតិថិជន (ABA, Wing, ACLEDA, Sathapana...)
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1.5">
                ឈ្មោះអាជីវកម្ម / ហាង (Merchant Name) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="ឧ. P-TWO7 STORE ឬ BOZZ POV"
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-red-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                ឈ្មោះដែលនឹងត្រូវបង្ហាញលើ KHQR frame និង App ធនាគារពេលអតិថិជនស្កេន
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1.5">
                ទីក្រុង / ខេត្ត (Merchant City)
              </label>
              <input
                type="text"
                value={merchantCity}
                onChange={(e) => setMerchantCity(e.target.value)}
                placeholder="ឧ. Phnom Penh"
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1.5">
                ឈ្មោះធនាគារ (Bank Name)
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="ឧ. ABA Bank, ACLEDA Bank"
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1.5">
                លេខគណនីធនាគារ (Account Number)
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="ឧ. 000 123 456 | 098 765 432"
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1.5">
                ឈ្មោះម្ចាស់គណនី (Account Holder Name)
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="ឧ. PHAI POV"
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-red-500 font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Order Fulfillment & Verification */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">របៀបផ្តល់ជូន Product Key (Order Fulfillment Mode)</h2>
              <p className="text-[11px] text-slate-400">
                ជ្រើសរើសថាតើត្រូវផ្ញើ Product Key ជូនភ្លាមៗស្វ័យប្រវត្ត ឬរង់ចាំ Admin ពិនិត្យ Slip
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <label
              onClick={() => setAutoFulfill('true')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                autoFulfill === 'true'
                  ? 'bg-emerald-950/20 border-emerald-500/50 text-white shadow-lg shadow-emerald-950/30'
                  : 'bg-dark-850 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="w-4 h-4 rounded-full border border-emerald-500 flex items-center justify-center p-0.5 mt-0.5 flex-shrink-0">
                {autoFulfill === 'true' && <div className="w-full h-full bg-emerald-500 rounded-full" />}
              </div>
              <div className="space-y-1">
                <span className="font-bold text-white block text-sm">Instant Auto-Fulfillment (ណែនាំ)</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  បន្ទាប់ពីអតិថិជនស្កេនទូទាត់ និងចុចបញ្ជាក់ ប្រព័ន្ធនឹងផ្តល់ Product Key លើអេក្រង់ភ្លាមៗ 24/7 និងផ្ញើ Slip ជូន Admin ក្នុង Telegram ស្វ័យប្រវត្តិ។
                </p>
              </div>
            </label>

            <label
              onClick={() => setAutoFulfill('false')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                autoFulfill === 'false'
                  ? 'bg-blue-950/20 border-blue-500/50 text-white shadow-lg shadow-blue-950/30'
                  : 'bg-dark-850 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center p-0.5 mt-0.5 flex-shrink-0">
                {autoFulfill === 'false' && <div className="w-full h-full bg-blue-500 rounded-full" />}
              </div>
              <div className="space-y-1">
                <span className="font-bold text-white block text-sm">Manual Slip Verification</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Order នឹងស្ថិតក្នុងស្ថានភាព PENDING រហូតដល់ Admin ពិនិត្យ Slip បង់ប្រាក់ក្នុងទំព័រ Orders រួចចុច Approve ទើបបញ្ជូន Product Key។
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Section 3: Telegram Bot & Alerts */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">ការជូនដំណឹងតាម Telegram Bot (Order Alerts)</h2>
                <p className="text-[11px] text-slate-400">
                  ទទួលបានរូបភាព Slip បង់ប្រាក់ និងព័ត៌មាន Order ភ្លាមៗលើ Telegram របស់អ្នក
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestTelegram}
              disabled={testingTg}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-600/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testingTg ? 'កំពុងផ្ញើសារ...' : 'ផ្ញើសារ Test ទៅ Telegram'}</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-dark-850 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Telegram Bot Token:</span>
              <span className="font-mono text-emerald-400 font-bold">Configured (.env)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Telegram Chat ID:</span>
              <span className="font-mono text-white font-bold">1344580473</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              💡 រាល់ពេលអតិថិជនដាក់បញ្ជាទិញ Bot នឹងផ្ញើរូបភាពបង្កាន់ដៃ (Slip) និងព័ត៌មានអតិថិជនចូល Telegram Chat ID ខាងលើដោយផ្ទាល់។
            </p>
          </div>
        </div>

        {/* Section 4: Store Hero Ticker */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">អត្ថបទរត់នៅលើគេហទំព័រ (Hero Ticker Bar)</h2>
              <p className="text-[11px] text-slate-400">
                អក្សររត់ផ្សាយដំណឹង ឬ Promotion នៅផ្នែកខាងលើនៃ Homepage
              </p>
            </div>
          </div>

          <div>
            <textarea
              rows={3}
              value={heroTicker}
              onChange={(e) => setHeroTicker(e.target.value)}
              placeholder="បញ្ចូលអត្ថបទរត់ផ្សាយដំណឹង..."
              className="w-full bg-dark-850 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-uiverse-emerald px-8 py-4 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-2xl disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការកំណត់ (Save Settings)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, X, Check } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENT');
  const [discountValue, setDiscountValue] = useState('');
  const [minSpend, setMinSpend] = useState('');
  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/coupons');
      if (res.ok) {
        const d = await res.json();
        setCoupons(d.coupons || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discountType,
          discountValue,
          minSpend: minSpend || undefined,
        }),
      });

      if (res.ok) {
        success('បានបង្កើត Coupon ជោគជ័យ!');
        setShowModal(false);
        setCode('');
        setDiscountValue('');
        setMinSpend('');
        loadData();
      } else {
        error('មិនអាចបង្កើតបានទេ');
      }
    } catch (e) {
      error('មានបញ្ហា');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('តើអ្នកចង់លុប Coupon នេះមែនទេ?')) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        success('បានលុប Coupon ជោគជ័យ');
        loadData();
      }
    } catch (e) {
      error('មានបញ្ហា');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">គ្រប់គ្រងកូដបញ្ចុះតម្លៃ (Coupons)</h1>
          <p className="text-xs text-slate-400 mt-0.5">បង្កើតកូដ Promotion បញ្ចុះតម្លៃជា % ឬចំនួនទឹកប្រាក់</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>បន្ថែម Coupon ថ្មី</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div key={c.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {c.code}
              </span>
              <button
                onClick={() => handleDelete(c.id)}
                className="p-1 rounded text-slate-500 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-lg font-black text-white font-mono">
              បញ្ចុះ {c.discountValue}{c.discountType === 'PERCENT' ? '%' : '$'}
            </p>

            <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
              <span>បានប្រើប្រាស់: {c.usageCount} ដង</span>
              <span className="text-emerald-400 font-semibold">{c.isActive ? 'Active' : 'Disabled'}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card max-w-md w-full rounded-3xl p-6 border border-slate-700 bg-dark-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">បន្ថែម Coupon ថ្មី</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">កូដ Coupon (ឧ. BOZZPOV10) *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">ប្រភេទបញ្ចុះ *</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="PERCENT">ភាគរយ (%)</option>
                    <option value="FIXED">ចំនួនទឹកប្រាក់ ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">ចំនួនទឹកប្រាក់បញ្ចុះ *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="10"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">ទិញយ៉ាងតិច ($ Min Spend)</label>
                <input
                  type="number"
                  step="0.01"
                  value={minSpend}
                  onChange={(e) => setMinSpend(e.target.value)}
                  placeholder="0"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-dark-850 text-slate-300 rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  បង្កើត
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Plus,
  Layers,
  Search,
  Trash2,
  CheckCircle2,
  X,
  Copy,
  Check,
  Filter,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { formatDateKhmer, KHMER_TEXT } from '@/lib/translations';

export default function AdminKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [targetProductId, setTargetProductId] = useState('');
  const [singleKeyInput, setSingleKeyInput] = useState('');
  const [bulkKeysInput, setBulkKeysInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/admin/keys', window.location.origin);
      if (selectedProduct !== 'ALL') url.searchParams.set('productId', selectedProduct);
      if (selectedStatus !== 'ALL') url.searchParams.set('status', selectedStatus);
      if (search.trim()) url.searchParams.set('search', search.trim());

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
        setProducts(data.products || []);
        if (data.products?.length > 0 && !targetProductId) {
          setTargetProductId(data.products[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProduct, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleAddSingleKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProductId || !singleKeyInput.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: targetProductId,
          singleKey: singleKeyInput.trim(),
        }),
      });

      if (res.ok) {
        success('បានបន្ថែម Key ជោគជ័យ!');
        setSingleKeyInput('');
        setShowSingleModal(false);
        loadData();
      } else {
        const d = await res.json();
        error('បរាជ័យ', d.error);
      }
    } catch (err) {
      error('មានបញ្ហា');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProductId || !bulkKeysInput.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: targetProductId,
          rawKeys: bulkKeysInput,
        }),
      });

      const d = await res.json();
      if (res.ok) {
        success('បញ្ចូល Keys ច្រើនជោគជ័យ!', d.message);
        setBulkKeysInput('');
        setShowBulkModal(false);
        loadData();
      } else {
        error('បរាជ័យ', d.error);
      }
    } catch (err) {
      error('មានបញ្ហា');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('តើអ្នកពិតជាចង់លុប Key នេះមែនទេ?')) return;
    try {
      const res = await fetch(`/api/admin/keys?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        success('បានលុប Key ជោគជ័យ');
        loadData();
      } else {
        const d = await res.json();
        error('មិនអាចលុបបានទេ', d.error);
      }
    } catch (err) {
      error('មានបញ្ហា');
    }
  };

  const handleCopy = (id: string, keyText: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedId(id);
    success('បានចម្លង Key!', keyText);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">គ្រប់គ្រង Product Keys (License Pool)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            បន្ថែម Key ម្តងមួយ បញ្ចូល Bulk Import និងត្រួតពិនិត្យ Key ដែលបានលក់
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSingleModal(true)}
            className="btn-uiverse-secondary px-4 py-2.5 rounded-xl text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>បន្ថែម Key មួយ</span>
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="btn-uiverse-primary px-4 py-2.5 rounded-xl text-xs font-bold"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{KHMER_TEXT.actions.bulkImport}</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរក Key..."
            className="w-full bg-dark-850 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        {/* Product Filter */}
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">ផលិតផលទាំងអស់ (All Products)</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">ស្ថានភាពទាំងអស់</option>
          <option value="AVAILABLE">អាចប្រើបាន (AVAILABLE)</option>
          <option value="SOLD">បានលក់ (SOLD)</option>
          <option value="DISABLED">បានបិទ (DISABLED)</option>
        </select>
      </div>

      {/* Keys Table */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 bg-dark-900 border-b border-slate-800">
              <tr>
                <th className="p-4">Product Key</th>
                <th className="p-4">សម្រាប់ផលិតផល</th>
                <th className="p-4">ស្ថានភាព (Status)</th>
                <th className="p-4">ព័ត៌មាន Order (Customer)</th>
                <th className="p-4">កាលបរិច្ឆេទ</th>
                <th className="p-4 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    កំពុងផ្ទុកទិន្នន័យ...
                  </td>
                </tr>
              ) : keys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    គ្មាន Product Key តាមតម្រងដែលបានជ្រើសរើសទេ
                  </td>
                </tr>
              ) : (
                keys.map((k) => (
                  <tr key={k.id} className="hover:bg-dark-850/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      <div className="flex items-center gap-2">
                        <span>{k.key}</span>
                        <button
                          onClick={() => handleCopy(k.id, k.key)}
                          className="text-slate-500 hover:text-white"
                          title="ចម្លង"
                        >
                          {copiedId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-white max-w-[180px] truncate">{k.product.name}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          k.status === 'AVAILABLE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : k.status === 'SOLD'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {KHMER_TEXT.keyStatus[k.status as keyof typeof KHMER_TEXT.keyStatus] || k.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {k.orderItem?.order ? (
                        <div>
                          <p className="font-mono text-blue-400">{k.orderItem.order.orderNumber}</p>
                          <p className="text-[10px] text-slate-400">{k.orderItem.order.customerName}</p>
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">
                      {k.soldAt ? formatDateKhmer(k.soldAt) : formatDateKhmer(k.createdAt)}
                    </td>
                    <td className="p-4 text-right">
                      {k.status !== 'SOLD' && (
                        <button
                          onClick={() => handleDeleteKey(k.id)}
                          className="p-1.5 rounded-lg bg-dark-800 hover:bg-red-950/40 text-red-400 transition-colors"
                          title="លុប Key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Key Modal */}
      {showSingleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card max-w-md w-full rounded-3xl p-6 border border-slate-700 bg-dark-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">បន្ថែម Product Key មួយ</h3>
              <button onClick={() => setShowSingleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSingleKey} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">ជ្រើសរើសផលិតផល</label>
                <select
                  value={targetProductId}
                  onChange={(e) => setTargetProductId(e.target.value)}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Key Code</label>
                <input
                  type="text"
                  required
                  value={singleKeyInput}
                  onChange={(e) => setSingleKeyInput(e.target.value)}
                  placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold uppercase"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSingleModal(false)}
                  className="btn-uiverse-secondary px-4 py-2 rounded-xl text-xs"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-uiverse-primary px-6 py-2 rounded-xl text-xs font-bold"
                >
                  {submitting ? 'កំពុងបញ្ចូល...' : 'រក្សាទុក'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card max-w-lg w-full rounded-3xl p-6 border border-slate-700 bg-dark-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>{KHMER_TEXT.actions.bulkImport} (Bulk Import)</span>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="btn-uiverse-icon w-7 h-7 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBulkImport} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">ជ្រើសរើសផលិតផលសម្រាប់ Keys ទាំងនេះ</label>
                <select
                  value={targetProductId}
                  onChange={(e) => setTargetProductId(e.target.value)}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  បិទភ្ជាប់ Keys ច្រើន (1 បន្ទាត់ = 1 Key)
                </label>
                <textarea
                  rows={8}
                  required
                  value={bulkKeysInput}
                  onChange={(e) => setBulkKeysInput(e.target.value)}
                  placeholder={`DEMO-KEY11-AAAAA-BBBBB-CCCCC\nDEMO-KEY11-DDDDD-EEEEE-FFFFF\nDEMO-KEY11-GGGGG-HHHHH-IIIII`}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl p-3 text-emerald-400 font-mono text-xs leading-relaxed"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  💡 ប្រព័ន្ធនឹងបំបែក Key នីមួយៗតាមបន្ទាត់ និងបញ្ចូលទៅក្នុងស្តុក Available ដោយស្វ័យប្រវត្តិ។
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="btn-uiverse-secondary px-4 py-2 rounded-xl text-xs"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-uiverse-primary px-6 py-2 rounded-xl text-xs font-bold"
                >
                  {submitting ? 'កំពុងបញ្ចូល...' : 'បញ្ចូល Keys ទាំងអស់'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

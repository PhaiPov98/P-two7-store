'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  KeyRound,
  Check,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  X,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { formatPrice, formatDateKhmer, KHMER_TEXT } from '@/lib/translations';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'COMPLETED'>('ALL');
  const [search, setSearch] = useState('');
  const [previewSlip, setPreviewSlip] = useState<{ url: string; orderNumber: string } | null>(null);
  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const d = await res.json();
        setOrders(d.orders || []);
      }
    } catch (e) {
      console.error(e);
      error('បរាជ័យក្នុងការទាញយក Orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (orderId: string, newOrderStatus: string, newPaymentStatus?: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          orderStatus: newOrderStatus,
          paymentStatus: newPaymentStatus,
        }),
      });

      if (res.ok) {
        success('បានផ្លាស់ប្តូរស្ថានភាព Order ជោគជ័យ!');
        loadData();
      } else {
        error('មិនអាចផ្លាស់ប្តូរបានទេ');
      }
    } catch (e) {
      error('មានបញ្ហា');
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          orderStatus: 'COMPLETED',
          paymentStatus: 'PAID',
        }),
      });

      if (res.ok) {
        success('បាន Approve និងផ្តល់ Product Key ជោគជ័យ!');
        loadData();
      } else {
        error('មិនអាច Approve បានទេ');
      }
    } catch (e) {
      error('មានបញ្ហា');
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`តើអ្នកពិតជាចង់លុបការបញ្ជាទិញ #${orderNumber} នេះមែនទេ?`)) return;

    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok) {
        success('បានលុបការបញ្ជាទិញជោគជ័យ!');
        loadData();
      } else {
        error('បរាជ័យ', data.error || 'មិនអាចលុបបានទេ');
      }
    } catch (err) {
      error('មានបញ្ហា', 'សូមព្យាយាមម្តងទៀត');
    }
  };

  const getSlipUrl = (order: any): string | null => {
    try {
      if (order.paymentDetails) {
        const parsed = JSON.parse(order.paymentDetails);
        if (parsed.paymentSlip) return parsed.paymentSlip;
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  const filteredOrders = orders.filter((ord) => {
    // Filter status
    if (filter === 'PENDING' && ord.paymentStatus !== 'PENDING' && ord.orderStatus !== 'PENDING') return false;
    if (filter === 'PAID' && ord.paymentStatus !== 'PAID') return false;
    if (filter === 'COMPLETED' && ord.orderStatus !== 'COMPLETED') return false;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchNumber = ord.orderNumber?.toLowerCase().includes(q);
      const matchName = ord.customerName?.toLowerCase().includes(q);
      const matchEmail = ord.customerEmail?.toLowerCase().includes(q);
      const matchPhone = ord.customerPhone?.toLowerCase().includes(q);
      return matchNumber || matchName || matchEmail || matchPhone;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">គ្រប់គ្រងការបញ្ជាទិញ & Slip (Orders)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            ពិនិត្យមើលរូបភាព Slip ស្កេន Bakong KHQR, ផ្ទៀងផ្ទាត់ការទូទាត់ និង Assign Keys
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-3.5 py-2 bg-dark-850 hover:bg-dark-800 text-slate-300 border border-slate-700 rounded-xl text-xs flex items-center gap-1.5 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-dark-850 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ទាំងអស់ ({orders.length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                : 'bg-dark-850 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            រង់ចាំផ្ទៀងផ្ទាត់ ({orders.filter((o) => o.paymentStatus === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilter('PAID')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'PAID'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-dark-850 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            បានទូទាត់ PAID ({orders.filter((o) => o.paymentStatus === 'PAID').length})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'COMPLETED'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-dark-850 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            បញ្ចប់រួចរាល់ ({orders.filter((o) => o.orderStatus === 'COMPLETED').length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកតាមលេខ Order, ឈ្មោះ..."
            className="w-full bg-dark-850 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center text-slate-400 space-y-3">
            <ShoppingBag className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-xs">មិនមានការបញ្ជាទិញត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ</p>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const slipUrl = getSlipUrl(ord);
            const isPending = ord.paymentStatus === 'PENDING';

            return (
              <div
                key={ord.id}
                className={`glass-card rounded-3xl p-6 border space-y-4 transition-all ${
                  isPending ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800'
                }`}
              >
                {/* Header Information */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">លេខ Order</span>
                    <span className="font-mono font-black text-blue-400 text-sm">{ord.orderNumber}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">អតិថិជន</span>
                    <span className="font-bold text-white">{ord.customerName}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {ord.customerEmail} {ord.customerPhone ? `• ${ord.customerPhone}` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">កាលបរិច្ឆេទ</span>
                    <span className="text-slate-300">{formatDateKhmer(ord.createdAt)}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">វិធីទូទាត់</span>
                    <span className="font-semibold text-purple-300 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                      {ord.paymentMethod}
                    </span>
                  </div>

                  {/* Payment Status Badge */}
                  <div>
                    <span className="text-slate-400 block text-[10px] mb-0.5">ស្ថានភាពទូទាត់</span>
                    {ord.paymentStatus === 'PAID' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>PAID</span>
                      </span>
                    ) : ord.paymentStatus === 'PENDING' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                        <Clock className="w-3 h-3" />
                        <span>PENDING</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        {ord.paymentStatus}
                      </span>
                    )}
                  </div>

                  {/* Status Switcher & Delete */}
                  <div className="flex items-center gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Order Status</span>
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className="bg-dark-850 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                      >
                        <option value="PENDING">រង់ចាំ (PENDING)</option>
                        <option value="PROCESSING">ដំណើរការ (PROCESSING)</option>
                        <option value="COMPLETED">បញ្ចប់ (COMPLETED)</option>
                        <option value="CANCELLED">បោះបង់ (CANCELLED)</option>
                        <option value="REFUNDED">សងប្រាក់ (REFUNDED)</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleDeleteOrder(ord.id, ord.orderNumber)}
                      className="p-1.5 mt-3 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
                      title="លុបការបញ្ជាទិញនេះ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Slip Preview & Quick Approve Row */}
                {slipUrl && (
                  <div className="p-3 rounded-2xl bg-dark-900 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => setPreviewSlip({ url: slipUrl, orderNumber: ord.orderNumber })}
                        className="relative group cursor-pointer w-14 h-14 rounded-xl overflow-hidden border border-slate-700 bg-black flex-shrink-0"
                      >
                        <img src={slipUrl} alt="Slip" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                          <span>បង្កាន់ដៃបង់ប្រាក់ (Payment Slip / Screenshot)</span>
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">អតិថិជនបាន Upload រូបភាពវិក្កយបត្រមកជាមួយ Order នេះ</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewSlip({ url: slipUrl, orderNumber: ord.orderNumber })}
                        className="btn-uiverse-secondary px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>មើល Slip ពេញអេក្រង់</span>
                      </button>

                      {isPending && (
                        <button
                          onClick={() => handleApproveOrder(ord.id)}
                          className="btn-uiverse-emerald px-3.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & ផ្ញើ Key ភ្លាមៗ</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Items and assigned keys */}
                <div className="space-y-2">
                  {ord.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-dark-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{item.name}</span>
                        <span className="text-slate-400 ml-2">
                          Qty: {item.quantity} x {formatPrice(item.price)}
                        </span>
                      </div>

                      {item.key ? (
                        <div className="p-1.5 px-2.5 rounded-lg bg-dark-950 border border-emerald-500/30 flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-mono text-xs font-bold text-emerald-400">{item.key.key}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-amber-400 italic">មិនទាន់បាន assign Product Key</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 text-xs">
                  <span className="text-slate-400">សរុបទូទាត់</span>
                  <span className="text-base font-black text-white font-mono">{formatPrice(ord.total)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Slip Fullscreen Modal Lightbox */}
      {previewSlip && (
        <div
          onClick={() => setPreviewSlip(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-card max-w-2xl w-full rounded-3xl p-6 border border-slate-700 bg-dark-900 shadow-2xl space-y-4 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span>បង្កាន់ដៃបង់ប្រាក់ (#{previewSlip.orderNumber})</span>
              </div>
              <button
                onClick={() => setPreviewSlip(null)}
                className="btn-uiverse-icon w-7 h-7 rounded-lg text-slate-400 hover:text-white text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-black/60 rounded-2xl p-2 border border-slate-800 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={previewSlip.url}
                alt="Payment Slip Full Preview"
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Order #{previewSlip.orderNumber}</span>
              <button
                onClick={() => setPreviewSlip(null)}
                className="btn-uiverse-secondary px-4 py-2 rounded-xl text-xs"
              >
                បិទផ្ទាំង
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, KeyRound, Check, RefreshCw } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { formatPrice, formatDateKhmer, KHMER_TEXT } from '@/lib/translations';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, orderStatus: newStatus }),
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">គ្រប់គ្រងការបញ្ជាទិញ (Orders)</h1>
          <p className="text-xs text-slate-400 mt-0.5">មើលព័ត៌មានលម្អិត អតិថិជន Keys ដែលបាន assign និងប្តូរ Status</p>
        </div>
        <button
          onClick={loadData}
          className="px-3.5 py-2 bg-dark-850 hover:bg-dark-800 text-slate-300 border border-slate-700 rounded-xl text-xs flex items-center gap-1.5 w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((ord) => (
          <div key={ord.id} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">លេខ Order</span>
                <span className="font-mono font-black text-blue-400 text-sm">{ord.orderNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">អតិថិជន</span>
                <span className="font-bold text-white">{ord.customerName}</span>
                <span className="text-[10px] text-slate-400 font-mono block">{ord.customerEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">កាលបរិច្ឆេទ</span>
                <span className="text-slate-300">{formatDateKhmer(ord.createdAt)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">វិធីទូទាត់</span>
                <span className="font-semibold text-purple-300">{ord.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ផ្លាស់ប្តូរ Status</span>
                <select
                  value={ord.orderStatus}
                  onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                  className="bg-dark-850 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                >
                  <option value="PENDING">កំពុងរង់ចាំ (PENDING)</option>
                  <option value="PROCESSING">កំពុងដំណើរការ (PROCESSING)</option>
                  <option value="COMPLETED">បានបញ្ចប់ (COMPLETED)</option>
                  <option value="CANCELLED">បានបោះបង់ (CANCELLED)</option>
                  <option value="REFUNDED">បានសងប្រាក់ (REFUNDED)</option>
                </select>
              </div>
            </div>

            {/* Items and assigned keys */}
            <div className="space-y-2">
              {ord.items.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-dark-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{item.name}</span>
                    <span className="text-slate-400 ml-2">Qty: {item.quantity} x {formatPrice(item.price)}</span>
                  </div>

                  {item.key && (
                    <div className="p-1.5 px-2.5 rounded-lg bg-dark-950 border border-emerald-500/30 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-mono text-xs font-bold text-emerald-400">{item.key.key}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 text-xs">
              <span className="text-slate-400">សរុបទូទាត់</span>
              <span className="text-base font-black text-white font-mono">{formatPrice(ord.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

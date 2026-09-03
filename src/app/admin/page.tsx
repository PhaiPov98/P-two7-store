'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  FolderDown,
  Download,
  KeyRound,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { formatPrice, formatDateKhmer, KHMER_TEXT } from '@/lib/translations';

import AdminSkeletonLoader from '@/components/admin/AdminSkeletonLoader';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders' | 'downloads'>('revenue');

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <AdminSkeletonLoader message="កំពុងផ្ទុកទិន្នន័យស្ថិតិ Dashboard..." />;
  }

  const statCards = [
    {
      title: 'ចំណូលសរុប (Revenue)',
      value: formatPrice(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'from-emerald-600 to-teal-600',
      textColor: 'text-emerald-400',
      sub: 'ពីការបញ្ជាទិញជោគជ័យ',
      href: '/admin/orders',
    },
    {
      title: 'ការបញ្ជាទិញ (Orders)',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'from-blue-600 to-indigo-600',
      textColor: 'text-blue-400',
      sub: 'Orders ទាំងអស់ក្នុងប្រព័ន្ធ',
      href: '/admin/orders',
    },
    {
      title: 'អតិថិជន (Customers)',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-purple-600 to-pink-600',
      textColor: 'text-purple-400',
      sub: 'គណនីបានចុះឈ្មោះ',
      href: '/admin/users',
    },
    {
      title: 'ផលិតផល (Products)',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'from-amber-600 to-orange-600',
      textColor: 'text-amber-400',
      sub: 'មុខទំនិញ Software & Keys',
      href: '/admin/products',
    },
    {
      title: 'Product Keys មានក្នុងស្តុក',
      value: `${stats?.availableKeys || 0} Keys`,
      icon: KeyRound,
      color: 'from-cyan-600 to-blue-600',
      textColor: 'text-cyan-400',
      sub: `បានលក់រួច: ${stats?.soldKeys || 0} Keys`,
      href: '/admin/keys',
    },
    {
      title: 'ការទាញយក (Downloads)',
      value: stats?.totalDownloads || 0,
      icon: Download,
      color: 'from-indigo-600 to-purple-600',
      textColor: 'text-indigo-400',
      sub: `${stats?.totalFiles || 0} ឯកសារ & Tools`,
      href: '/admin/downloads',
    },
  ];

  // Calculate real max value for the active metric
  const chartValues = stats?.chartData?.map((item: any) => item[chartMetric] || 0) || [];
  const maxMetricVal = Math.max(...chartValues, chartMetric === 'revenue' ? 10 : 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">ផ្ទាំងគ្រប់គ្រងទូទៅ (Overview)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            ស្ថិតិការលក់ ចរាចរណ៍ទិន្នន័យ និងសកម្មភាពពិតប្រាកដក្នុងប្រព័ន្ធ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400">ប្រព័ន្ធដំណើរការប្រក្រតី (Online 100%)</span>
        </div>
      </div>

      {/* 6 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <Link
              key={idx}
              href={c.href}
              className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-blue-500/60 hover:bg-dark-850/70 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/5 transition-all space-y-3 relative overflow-hidden group block cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors flex items-center gap-1.5">
                  {c.title}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-blue-400" />
                </span>
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className={`text-2xl font-black ${c.textColor} font-mono`}>{c.value}</p>
                <p className="text-[10px] text-slate-400 mt-1">{c.sub}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Real-time Dynamic Chart */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>ស្ថិតិជាក់ស្តែង ៧ ថ្ងៃចុងក្រោយ (Real-time 7 Days)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ទិន្នន័យលក់ និងទាញយកគណនាផ្ទាល់ចេញពី Database
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1 bg-dark-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setChartMetric('revenue')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                chartMetric === 'revenue'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              💵 ចំណូល ($)
            </button>
            <button
              onClick={() => setChartMetric('orders')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                chartMetric === 'orders'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🛍️ Orders
            </button>
            <button
              onClick={() => setChartMetric('downloads')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                chartMetric === 'downloads'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📥 Downloads
            </button>
          </div>
        </div>

        {/* Dynamic Bar Chart */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-52 pt-8 border-b border-slate-800 pb-3">
          {stats?.chartData?.map((item: any, idx: number) => {
            const rawVal = item[chartMetric] || 0;
            const heightPercent = maxMetricVal > 0 ? Math.round((rawVal / maxMetricVal) * 85) : 0;
            const displayHeight = rawVal > 0 ? Math.max(heightPercent, 12) : 4;

            const isToday = idx === 6;

            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group relative">
                {/* Floating tooltip badge */}
                <div className="opacity-0 group-hover:opacity-100 transition-all absolute -top-8 bg-dark-900 border border-slate-700 px-2 py-1 rounded-md text-[10px] font-mono text-white whitespace-nowrap pointer-events-none z-10 shadow-xl">
                  {chartMetric === 'revenue'
                    ? formatPrice(rawVal)
                    : chartMetric === 'orders'
                    ? `${rawVal} Orders`
                    : `${rawVal} Downloads`}
                </div>

                <span className="text-[10px] text-slate-400 font-mono text-center">
                  {chartMetric === 'revenue' ? (rawVal > 0 ? `$${rawVal}` : '$0') : rawVal}
                </span>

                <div
                  style={{ height: `${displayHeight}%` }}
                  className={`w-full max-w-[44px] rounded-t-xl transition-all duration-500 relative ${
                    rawVal > 0
                      ? isToday
                        ? 'bg-gradient-to-t from-blue-600 via-indigo-500 to-cyan-400 shadow-lg shadow-blue-500/25'
                        : 'bg-gradient-to-t from-blue-700 via-indigo-600 to-purple-600 shadow-md shadow-indigo-500/15'
                      : 'bg-slate-800/60'
                  }`}
                >
                  {rawVal > 0 && <div className="absolute inset-x-0 top-0 h-1 bg-white/40 rounded-t-xl" />}
                </div>

                <div className="text-center">
                  <p
                    className={`text-[10px] font-bold truncate max-w-full ${
                      isToday ? 'text-blue-400' : 'text-slate-400'
                    }`}
                  >
                    {item.day.split(' ')[0]} {isToday && '(ថ្ងៃនេះ)'}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">{item.shortDate}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-purple-400" />
            ការបញ្ជាទិញថ្មីៗ (Recent Orders)
          </h3>
          <Link href="/admin/orders" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
            គ្រប់គ្រង Orders ទាំងអស់ →
          </Link>
        </div>

        {stats?.recentOrders?.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            មិនទាន់មានការបញ្ជាទិញ (Orders) ថ្មីនៅឡើយទេ
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3">លេខ Order</th>
                  <th className="pb-3">អតិថិជន</th>
                  <th className="pb-3">ចំនួនទឹកប្រាក់</th>
                  <th className="pb-3">វិធីទូទាត់</th>
                  <th className="pb-3">ស្ថានភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {stats?.recentOrders?.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-dark-850/50 transition-colors">
                    <td className="py-3 font-mono font-bold text-blue-400">{ord.orderNumber}</td>
                    <td className="py-3">
                      <p className="font-semibold text-white">{ord.customerName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{ord.customerEmail}</p>
                    </td>
                    <td className="py-3 font-mono font-bold text-white">{formatPrice(ord.total)}</td>
                    <td className="py-3 text-purple-300 font-semibold">{ord.paymentMethod}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {KHMER_TEXT.orderStatus[ord.orderStatus as keyof typeof KHMER_TEXT.orderStatus] ||
                          ord.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

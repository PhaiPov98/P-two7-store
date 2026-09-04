import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ShoppingBag,
  KeyRound,
  Download,
  ShieldCheck,
  Zap,
  ArrowRight,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { formatPrice, formatDateKhmer, KHMER_TEXT } from '@/lib/translations';

export const revalidate = 0;

export default async function AccountDashboardPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect('/login?redirect=/account');
  }

  // Fetch user data with fast optimized query
  const [orders, downloadsCount] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.id },
      include: {
        items: {
          include: {
            key: {
              include: {
                product: { select: { name: true, slug: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.download.count({
      where: { userId: session.id },
    }),
  ]);

  const userKeys = orders
    .flatMap((o) => o.items.map((i) => i.key))
    .filter((k): k is NonNullable<typeof k> => Boolean(k));

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
            គណនីអតិថិជន
          </span>
          <h1 className="text-2xl font-black text-white mt-1">
            សួស្តី, {session.name}! 👋
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            សូមស្វាគមន៍មកកាន់ Bozz Pov Digital Store។ អ្នកអាចគ្រប់គ្រង License Keys និងការទាញយកនៅទីនេះ។
          </p>
        </div>
      </div>

      {/* 4 Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">ការបញ្ជាទិញ (Orders)</p>
            <p className="text-2xl font-black text-white font-mono mt-0.5">{orders.length}</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Product Keys</p>
            <p className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{userKeys.length}</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">ស្ថានភាពគណនី</p>
            <p className="text-xs font-bold text-emerald-400 mt-1">ផ្ទៀងផ្ទាត់រួចរាល់</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">ការទាញយក</p>
            <p className="text-2xl font-black text-white font-mono mt-0.5">{downloadsCount}</p>
          </div>
        </div>
      </div>

      {/* Recent Product Keys */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            Product Keys ថ្មីៗ
          </h3>
          <Link href="/account/keys" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
            មើលទាំងអស់ <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {userKeys.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-dark-900 rounded-2xl">
            លោកអ្នកមិនទាន់មាន Product Key នៅឡើយទេ
          </div>
        ) : (
          <div className="space-y-3">
            {userKeys.map((k) => (
              <div
                key={k.id}
                className="p-4 rounded-xl bg-dark-850 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <span className="text-[11px] font-bold text-blue-400 block">{k.product.name}</span>
                  <span className="font-mono text-sm font-black text-emerald-400">{k.key}</span>
                </div>
                <Link
                  href="/account/keys"
                  className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 text-xs font-bold w-fit"
                >
                  មើលព័ត៌មាន & ចម្លង
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
            ការបញ្ជាទិញថ្មីៗ (Recent Orders)
          </h3>
          <Link href="/account/orders" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
            មើលទាំងអស់ <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-dark-900 rounded-2xl">
            គ្មានប្រវត្តិការបញ្ជាទិញនៅឡើយទេ
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3">លេខ Order</th>
                  <th className="pb-3">កាលបរិច្ឆេទ</th>
                  <th className="pb-3">ចំនួនទឹកប្រាក់</th>
                  <th className="pb-3">ស្ថានភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((ord) => (
                  <tr key={ord.id} className="text-slate-300">
                    <td className="py-3 font-mono font-bold text-blue-400">{ord.orderNumber}</td>
                    <td className="py-3 text-slate-400">{formatDateKhmer(ord.createdAt)}</td>
                    <td className="py-3 font-mono font-bold text-white">{formatPrice(ord.total)}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {KHMER_TEXT.orderStatus[ord.orderStatus as keyof typeof KHMER_TEXT.orderStatus] || ord.orderStatus}
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

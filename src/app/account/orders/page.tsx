import React from 'react';
import { redirect } from 'next/navigation';
import { ShoppingBag, KeyRound, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { formatPrice, formatDateKhmer, KHMER_TEXT } from '@/lib/translations';

export const revalidate = 0;

export default async function UserOrdersPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect('/login?redirect=/account/orders');
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    include: {
      items: {
        include: {
          key: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'PAID':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PROCESSING':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'REFUNDED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">ប្រវត្តិការបញ្ជាទិញ (Orders)</h1>
          <p className="text-xs text-slate-400 mt-0.5">មើលរាល់បញ្ជាទិញ និងស្ថានភាពទូទាត់របស់អ្នក</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-slate-800 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">មិនទាន់មានការបញ្ជាទិញទេ</h3>
          <p className="text-xs text-slate-400">រាល់ការទិញ Product Key និងកម្មវិធី នឹងបង្ហាញនៅទីនេះ។</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">លេខបញ្ជាទិញ</span>
                  <span className="font-mono text-sm font-black text-blue-400">
                    {order.orderNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">កាលបរិច្ឆេទ</span>
                  <span className="text-xs text-slate-200">{formatDateKhmer(order.createdAt)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">វិធីទូទាត់</span>
                  <span className="text-xs font-semibold text-purple-300">{order.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">ស្ថានភាព</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(order.orderStatus)}`}>
                    {KHMER_TEXT.orderStatus[order.orderStatus as keyof typeof KHMER_TEXT.orderStatus] || order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-dark-900 border border-slate-800/80 gap-2"
                  >
                    <div>
                      <p className="font-bold text-xs text-white">{item.name}</p>
                      <p className="text-[10px] text-slate-400">
                        ចំនួន: {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>

                    {item.key && (
                      <div className="p-2 rounded-lg bg-dark-950 border border-emerald-500/30 flex items-center gap-2">
                        <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-mono text-xs font-black text-emerald-400">
                          {item.key.key}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-slate-400">
                  ទូទាត់សរុប (Total Amount)
                </span>
                <span className="text-base font-black text-white font-mono">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

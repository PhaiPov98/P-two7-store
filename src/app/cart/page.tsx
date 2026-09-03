'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Tag,
  X,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice, formatPriceRiel, KHMER_TEXT } from '@/lib/translations';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    discount,
    total,
    coupon,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);
  const router = useRouter();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    const ok = await applyCoupon(couponInput.trim());
    if (ok) setCouponInput('');
    setApplying(false);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-dark-850 border border-slate-800 flex items-center justify-center mx-auto text-slate-600 shadow-2xl">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">កន្ត្រកទំនិញរបស់អ្នកទទេស្អាត</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          លោកអ្នកមិនទាន់បានជ្រើសរើស Product Key ឬកម្មវិធីណាមួយដាក់ក្នុងកន្ត្រកនៅឡើយទេ
        </p>
        <div>
          <Link
            href="/products"
            className="btn-uiverse-primary px-8 py-3.5 rounded-2xl text-xs sm:text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{KHMER_TEXT.actions.continueShopping}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">កន្ត្រកទំនិញ ({items.length})</h1>
          <p className="text-xs text-slate-400 mt-1">ពិនិត្យទំនិញរបស់អ្នក មុននឹងបន្តទៅការទូទាត់</p>
        </div>
        <button
          onClick={clearCart}
          className="btn-uiverse-danger px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>សម្អាតកន្ត្រក</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-dark-850 flex-shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {item.categoryName || 'Product Key'}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-white mt-1 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-xs font-black text-blue-400 font-mono mt-0.5">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </div>

              {/* Quantity Controls & Price */}
              <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <div className="flex items-center rounded-xl bg-dark-850 border border-slate-700 p-1">
                  <button
                    onClick={() => updateQuantity(item.productId, -1)}
                    className="p-1.5 rounded-lg hover:bg-dark-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-white font-mono">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, 1)}
                    className="p-1.5 rounded-lg hover:bg-dark-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-black text-white text-base font-mono">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="btn-uiverse-icon p-2 rounded-xl text-slate-400 hover:text-red-400 hover:border-red-500/40"
                  title="លុបចេញពីកន្ត្រក"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link
              href="/products"
              className="btn-uiverse-secondary px-4 py-2.5 rounded-xl text-xs inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{KHMER_TEXT.actions.continueShopping}</span>
            </Link>
          </div>
        </div>

        {/* Order Summary & Checkout Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-white">សង្ខេបការបញ្ជាទិញ</h3>

            {/* Coupon Application */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                កូដបញ្ចុះតម្លៃ (Coupon Code)
              </label>
              {coupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>{coupon.code}</span>
                    <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded">
                      -{coupon.discountValue}{coupon.discountType === 'PERCENT' ? '%' : '$'}
                    </span>
                  </div>
                  <button onClick={removeCoupon} className="text-emerald-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="ឧ. BOZZPOV10"
                    className="flex-1 bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={applying}
                    className="btn-uiverse-primary px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    {applying ? '...' : KHMER_TEXT.actions.applyCoupon}
                  </button>
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>សរុបរង (Subtotal)</span>
                <span className="font-bold text-white font-mono">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>ការបញ្ចុះតម្លៃ (Discount)</span>
                  <span className="font-bold font-mono">-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-3 border-t border-slate-800 text-sm">
                <div>
                  <span className="font-bold text-white block">សរុបត្រូវបង់ (Total)</span>
                  <span className="text-[11px] text-slate-400">
                    {formatPriceRiel(total)}
                  </span>
                </div>
                <span className="text-2xl font-black text-white font-mono">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => router.push('/checkout')}
              className="btn-uiverse-tranphattrien w-full py-4 px-6 rounded-2xl text-sm font-black tracking-wide"
            >
              <span>{KHMER_TEXT.actions.checkout}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust note */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ការទូទាត់មានសុវត្ថិភាព ផ្ញើ Key ភ្លាមៗ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

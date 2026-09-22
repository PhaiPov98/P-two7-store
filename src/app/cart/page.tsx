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
  Lock,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
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

  const { user } = useAuth();
  const { info } = useToast();
  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);
  const router = useRouter();

  const hasPaidItems = items.some((item) => item.price > 0) || total > 0;

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
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 pb-36 lg:pb-16">
      {/* Title */}
      <div className="flex flex-row items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-slate-800">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-3xl font-black text-white leading-normal truncate">
            កន្ត្រកទំនិញ <span className="text-blue-400 font-mono">({items.length})</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed truncate sm:text-clip">
            ពិនិត្យទំនិញរបស់អ្នក មុននឹងបន្តទៅការទូទាត់
          </p>
        </div>
        <button
          onClick={clearCart}
          className="btn-uiverse-danger px-2.5 sm:px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shrink-0"
          title="សម្អាតកន្ត្រក"
        >
          <Trash2 className="w-3.5 h-3.5 shrink-0" />
          <span className="leading-normal">សម្អាតកន្ត្រក</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-3.5 sm:space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="glass-card p-3.5 sm:p-5 rounded-2xl border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 shadow-lg hover:border-slate-700/80 transition-all"
            >
              {/* Top / Left: Image and Product Details */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-dark-850 border border-slate-800/80 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="inline-block text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 leading-tight">
                    {item.categoryName || 'Product Key'}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-white mt-1 leading-snug break-words line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-xs font-black text-blue-400 font-mono mt-1 leading-normal">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </div>

              {/* Bottom / Right: Quantity Controls, Subtotal Price & Delete */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                {/* Stepper */}
                <div className="flex items-center rounded-xl bg-dark-850 border border-slate-700/80 p-1 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.productId, -1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-dark-700 text-slate-400 hover:text-white transition-colors active:scale-95"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-white font-mono">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-dark-700 text-slate-400 hover:text-white transition-colors active:scale-95"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Total price for this item */}
                <div className="text-right flex-1 sm:flex-initial">
                  <p className="font-black text-white text-base sm:text-lg font-mono leading-none">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {formatPriceRiel(item.price * item.quantity)}
                  </p>
                </div>

                {/* Delete item button */}
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="btn-uiverse-icon p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:border-red-500/40 shrink-0 transition-colors"
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
              className="btn-uiverse-secondary px-4 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 leading-normal"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="leading-normal">{KHMER_TEXT.actions.continueShopping}</span>
            </Link>
          </div>
        </div>

        {/* Order Summary & Checkout Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-5 sm:space-y-6 shadow-xl">
            <h3 className="text-base font-bold text-white leading-normal flex items-center justify-between">
              <span>សង្ខេបការបញ្ជាទិញ</span>
              <span className="text-xs text-slate-400 font-normal sm:hidden">({items.length} មុខ)</span>
            </h3>

            {/* Coupon Application */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2 leading-normal">
                កូដបញ្ចុះតម្លៃ (Coupon Code)
              </label>
              {coupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                  <div className="flex items-center gap-2 min-w-0">
                    <Tag className="w-4 h-4 shrink-0" />
                    <span className="truncate">{coupon.code}</span>
                    <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded shrink-0">
                      -{coupon.discountValue}{coupon.discountType === 'PERCENT' ? '%' : '$'}
                    </span>
                  </div>
                  <button onClick={removeCoupon} className="text-emerald-400 hover:text-white p-1 shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="កូដបញ្ចុះតម្លៃ (ឧ. BOZZPOV10)"
                    className="flex-1 min-w-0 bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={applying}
                    className="btn-uiverse-primary px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 shrink-0 leading-normal"
                  >
                    {applying ? '...' : KHMER_TEXT.actions.applyCoupon}
                  </button>
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="leading-normal">សរុបរង (Subtotal)</span>
                <span className="font-bold text-white font-mono">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between items-center text-emerald-400">
                  <span className="leading-normal">ការបញ្ចុះតម្លៃ ({coupon?.code})</span>
                  <span className="font-bold font-mono">-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-3 border-t border-slate-800">
                <div>
                  <span className="font-bold text-white block text-sm leading-normal">សរុបត្រូវបង់ (Total)</span>
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                    {formatPriceRiel(total)}
                  </span>
                </div>
                <span className="text-2xl font-black text-white font-mono leading-none">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Login notice if cart has paid items and user is not logged in */}
            {hasPaidItems && !user && (
              <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 leading-relaxed">
                <Lock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span className="leading-relaxed">តម្រូវឱ្យចូលគណនីជាមុនសិន ដើម្បីទូទាត់ទំនិញគិតលុយ</span>
              </div>
            )}

            {/* Checkout Button */}
            <button
              onClick={() => {
                if (hasPaidItems && !user) {
                  info('សូមចូលគណនីជាមុនសិន', 'ដើម្បីទិញផលិតផលដែលគិតលុយ សូមចូលគណនីរបស់អ្នក');
                  router.push(`/login?redirect=${encodeURIComponent('/checkout')}`);
                  return;
                }
                router.push('/checkout');
              }}
              className="btn-uiverse-tranphattrien w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl text-xs sm:text-sm font-bold leading-normal flex items-center justify-center gap-2 text-center"
            >
              <span className="leading-normal">{hasPaidItems && !user ? 'ចូលគណនីដើម្បីបង់ប្រាក់' : KHMER_TEXT.actions.checkout}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
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

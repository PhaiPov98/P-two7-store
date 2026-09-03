'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  QrCode,
  CreditCard,
  Building2,
  Copy,
  Check,
  ArrowLeft,
  Lock,
  KeyRound,
  Download,
  FolderDown,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice, formatPriceRiel, KHMER_TEXT } from '@/lib/translations';

export default function CheckoutPage() {
  const { items, subtotal, discount, total, coupon, clearCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<'BAKONG_KHQR' | 'ABA_PAY' | 'WING' | 'CREDIT_CARD'>('BAKONG_KHQR');

  // Checkout Status & Modal
  const [processing, setProcessing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      error('សូមបំពេញព័ត៌មាន', 'សូមបញ្ចូលឈ្មោះ និង Email របស់អ្នកដើម្បីទទួល Product Key');
      return;
    }

    if (items.length === 0) {
      error('កន្ត្រកទទេ', 'គ្មានទំនិញក្នុងកន្ត្រកដើម្បីទូទាត់ទេ');
      return;
    }

    // Open Payment QR / Confirmation Modal
    setShowQRModal(true);
  };

  const handleConfirmPayment = async () => {
    try {
      setProcessing(true);

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          paymentMethod,
          couponCode: coupon?.code || null,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        error('ការបញ្ជាទិញបរាជ័យ', data.error || 'មានបញ្ហាបច្ចេកទេស');
        setProcessing(false);
        return;
      }

      // Success
      setOrderSuccess(data);
      setShowQRModal(false);
      clearCart();
      success('ការទូទាត់ជោគជ័យ!', 'Product Key របស់អ្នកត្រូវបានផ្ញើជូនភ្លាមៗ');
    } catch (err) {
      error('មានបញ្ហា', 'មិនអាចបញ្ចប់ការទូទាត់បានទេ');
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = (keyText: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(keyText);
    success('បានចម្លង Key!', keyText);
    setTimeout(() => setCopiedKey(null), 3000);
  };

  // SUCCESS SCREEN
  if (orderSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 animate-in fade-in zoom-in-95">
        <div className="glass-card rounded-3xl p-8 border border-emerald-500/30 text-center space-y-6 shadow-2xl bg-gradient-to-b from-dark-900 via-dark-850 to-dark-900">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              ការទូទាត់បានជោគជ័យ 100%
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-3">
              អរគុណសម្រាប់ការជាវ Product Key!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              លេខបញ្ជាទិញ: <strong className="text-blue-400 font-mono">{orderSuccess.orderNumber}</strong>
            </p>
          </div>

          {/* Downloadable Files Box (If Product has attached EXE / ZIP / Link) */}
          {orderSuccess.downloads && orderSuccess.downloads.length > 0 && (
            <div className="p-6 rounded-2xl bg-dark-950/90 border border-emerald-500/40 text-left space-y-4 shadow-2xl shadow-emerald-500/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>ឯកសារកម្មវិធីសម្រាប់ទាញយក (Download Files / Software):</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready to Download
                </span>
              </div>

              <div className="space-y-3">
                {orderSuccess.downloads.map((dl: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-dark-900/90 border border-slate-700/80 hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-white">{dl.productName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                          {dl.fileType || 'EXE'}
                        </span>
                        {dl.fileSize && dl.fileSize !== 'Direct' && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {dl.fileSize}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {dl.fileName} {dl.version ? `(Version ${dl.version})` : ''}
                      </p>
                    </div>

                    <a
                      href={dl.downloadUrl}
                      target={dl.downloadUrl.startsWith('http') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className="animated-button flex-shrink-0"
                    >
                      <span>
                        <Download className="w-4 h-4" />
                        <span>ទាញយក File {dl.fileType ? `.${dl.fileType}` : '.EXE'} ឥឡូវនេះ</span>
                      </span>
                      <span></span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivered Keys Box */}
          <div className="p-6 rounded-2xl bg-dark-950/80 border border-slate-800 text-left space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              Product Keys របស់អ្នក (Your License Keys):
            </h3>

            <div className="space-y-3">
              {orderSuccess.allocatedKeys?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-dark-900 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-[11px] font-bold text-blue-400 block">{item.productName}</span>
                    <span className="font-mono text-sm sm:text-base font-black text-emerald-400 tracking-wider">
                      {item.key}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(item.key)}
                    className="btn-uiverse-copy px-4 py-2 rounded-xl text-xs"
                  >
                    {copiedKey === item.key ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{KHMER_TEXT.actions.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{KHMER_TEXT.actions.copyKey}</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
              💡 ព័ត៌មាន Key នេះត្រូវបានរក្សាទុកក្នុងគណនីរបស់អ្នកផងដែរ។ លោកអ្នកអាចចូលមើលឡើងវិញនៅពេលណាក៏បានក្នុងទំព័រ <strong>Product Keys របស់ខ្ញុំ</strong>។
            </p>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/account/keys"
              className="btn-uiverse-xueyuantan px-6 py-3 rounded-full text-xs sm:text-sm"
            >
              <KeyRound className="w-4 h-4" />
              <span>មើលក្នុងគណនីរបស់ខ្ញុំ (My Keys)</span>
            </Link>
            <Link
              href="/products"
              className="btn-uiverse-xueyuantan px-6 py-3 rounded-full text-xs sm:text-sm"
            >
              <span>{KHMER_TEXT.actions.continueShopping}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Normal Checkout Form
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
        <Link href="/cart" className="p-2 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-white border border-slate-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">ការទូទាត់ប្រាក់ (Checkout)</h1>
          <p className="text-xs text-slate-400 mt-0.5">បំពេញព័ត៌មាន និងជ្រើសរើសវិធីទូទាត់</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Customer & Payment Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Customer Info */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs">1</span>
              ព័ត៌មានអ្នកទិញ
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  ឈ្មោះពេញ (Full Name) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ឧ. សុខ វិបុល"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Email (សម្រាប់ទទួល Product Key) <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ឧ. example@gmail.com"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Product Key នឹងត្រូវបញ្ជូនទៅកាន់ Email នេះ និងបង្ហាញលើអេក្រង់ភ្លាមៗ។
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  លេខទូរស័ព្ទ (Phone Number - Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="ឧ. 012 345 678"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center text-xs">2</span>
              វិធីទូទាត់ (Payment Method)
            </h3>

            <div className="space-y-3">
              {/* Bakong KHQR */}
              <label
                onClick={() => setPaymentMethod('BAKONG_KHQR')}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'BAKONG_KHQR'
                    ? 'bg-red-950/20 border-red-500/50 text-white shadow-lg shadow-red-950/30'
                    : 'bg-dark-850 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white">Bakong KHQR</p>
                    <p className="text-[10px] text-slate-400">ស្កេនទូទាត់តាមគ្រប់ App ធនាគារក្នុងស្រុក</p>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border border-red-500 flex items-center justify-center p-0.5">
                  {paymentMethod === 'BAKONG_KHQR' && <div className="w-full h-full bg-red-500 rounded-full" />}
                </div>
              </label>

              {/* ABA PAY */}
              <label
                onClick={() => setPaymentMethod('ABA_PAY')}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'ABA_PAY'
                    ? 'bg-blue-950/20 border-blue-500/50 text-white shadow-lg shadow-blue-950/30'
                    : 'bg-dark-850 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white">ABA PAY / KHQR</p>
                    <p className="text-[10px] text-slate-400">ទូទាត់រហ័សតាម ABA Mobile App</p>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center p-0.5">
                  {paymentMethod === 'ABA_PAY' && <div className="w-full h-full bg-blue-500 rounded-full" />}
                </div>
              </label>

              {/* Wing */}
              <label
                onClick={() => setPaymentMethod('WING')}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'WING'
                    ? 'bg-lime-950/20 border-lime-500/50 text-white shadow-lg shadow-lime-950/30'
                    : 'bg-dark-850 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-lime-600/20 border border-lime-500/30 flex items-center justify-center text-lime-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white">Wing Bank</p>
                    <p className="text-[10px] text-slate-400">Wing Money & Bank Transfer</p>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border border-lime-500 flex items-center justify-center p-0.5">
                  {paymentMethod === 'WING' && <div className="w-full h-full bg-lime-500 rounded-full" />}
                </div>
              </label>

              {/* Credit Card */}
              <label
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'bg-purple-950/20 border-purple-500/50 text-white shadow-lg shadow-purple-950/30'
                    : 'bg-dark-850 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white">Credit / Debit Card</p>
                    <p className="text-[10px] text-slate-400">Visa, Mastercard, UnionPay</p>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border border-purple-500 flex items-center justify-center p-0.5">
                  {paymentMethod === 'CREDIT_CARD' && <div className="w-full h-full bg-purple-500 rounded-full" />}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Review & Checkout Button */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-white">ទំនិញដែលបានជ្រើសរើស</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover bg-dark-850" />
                    <div>
                      <p className="font-bold text-white line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-slate-400">ចំនួន: {item.quantity} x {formatPrice(item.price)}</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-white">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>សរុបរង</span>
                <span className="font-mono text-white">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>បញ្ចុះតម្លៃ ({coupon?.code})</span>
                  <span className="font-mono">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-3 border-t border-slate-800">
                <div>
                  <span className="font-bold text-white text-sm block">សរុបត្រូវបង់</span>
                  <span className="text-[10px] text-slate-400">{formatPriceRiel(total)}</span>
                </div>
                <span className="text-2xl font-black text-white font-mono">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn-uiverse-buy w-full py-4 px-6 rounded-2xl text-sm font-black tracking-wide"
            >
              <Lock className="w-4 h-4" />
              <span>បង់ប្រាក់ {formatPrice(total)}</span>
            </button>

            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-[11px] text-blue-200 flex items-start gap-2">
              <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <span>ប្រព័ន្ធស្វ័យប្រវត្តិនឹងផ្ញើ Product Key ជូនភ្លាមៗបន្ទាប់ពីស្កេនទូទាត់រួច។</span>
            </div>
          </div>
        </div>
      </form>

      {/* BAKONG / PAYMENT MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card max-w-md w-full rounded-3xl p-6 border border-slate-700 bg-dark-900 shadow-2xl space-y-6 text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <QrCode className="w-4 h-4 text-red-500" />
                <span>ស្កេនទូទាត់ប្រាក់ (Bakong KHQR)</span>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="btn-uiverse-icon w-7 h-7 rounded-lg text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {/* QR Code Frame */}
            <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl border-4 border-red-500/30">
              {/* Simulated Cambodian KHQR graphic */}
              <div className="w-48 h-48 bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white relative overflow-hidden p-2">
                <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                  KHQR
                </div>
                <QrCode className="w-32 h-32 text-white" />
                <span className="text-[10px] font-bold text-slate-300 font-mono mt-1">
                  BOZZ POV DIGITAL STORE
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-300 font-medium">ចំនួនទឹកប្រាក់ត្រូវទូទាត់</p>
              <p className="text-2xl font-black text-white font-mono mt-0.5">{formatPrice(total)}</p>
              <p className="text-xs text-slate-400">{formatPriceRiel(total)}</p>
            </div>

            <div className="p-3 rounded-xl bg-dark-850 border border-slate-800 text-[11px] text-slate-300 text-left space-y-1">
              <p className="font-semibold text-white">ការណែនាំ:</p>
              <p>1. បើក App ធនាគាររបស់អ្នក (ABA, ACLEDA, Wing, etc.)</p>
              <p>2. ស្កេន QR Code ខាងលើ</p>
              <p>3. ចុចប៊ូតុង "ខ្ញុំបានទូទាត់ប្រាក់រួចរាល់" ខាងក្រោម</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowQRModal(false)}
                className="btn-uiverse-secondary flex-1 py-3 rounded-xl text-xs"
              >
                បោះបង់
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={processing}
                className="btn-uiverse-emerald flex-2 py-3 px-6 rounded-xl text-xs font-bold disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{processing ? 'កំពុងផ្ទៀងផ្ទាត់...' : KHMER_TEXT.actions.confirmPayment}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

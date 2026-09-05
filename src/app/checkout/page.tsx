'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Upload,
  Image as ImageIcon,
  Clock,
  ExternalLink,
  Sparkles,
  AlertCircle,
  X,
  Smartphone,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice, formatPriceRiel, KHMER_TEXT } from '@/lib/translations';

interface KHQRData {
  qrString: string;
  qrDataUrl: string;
  md5: string;
  bakongAccountId: string;
  merchantName: string;
  amount: number;
  currency: string;
  billNumber: string;
  expiresAt: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  abaPayLink?: string;
}

export default function CheckoutPage() {
  const { items, subtotal, discount, total, coupon, clearCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<'ABA_PAY' | 'BAKONG_KHQR' | 'WING' | 'CREDIT_CARD'>('ABA_PAY');

  // Checkout Status & Modal
  const [processing, setProcessing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [khqrData, setKhqrData] = useState<KHQRData | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedQR, setCopiedQR] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);

  // Payment Slip Upload State
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [slipFileName, setSlipFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Countdown timer in seconds (15 mins = 900s)
  const [timeLeft, setTimeLeft] = useState<number>(900);

  // Countdown effect when modal is active
  useEffect(() => {
    if (!showQRModal) return;

    setTimeLeft(900);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showQRModal]);

  // Format timer MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate Dynamic KHQR when opening modal
  const fetchDynamicKHQR = async () => {
    try {
      setGeneratingQR(true);
      const res = await fetch('/api/checkout/khqr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'USD',
          billNumber: `BP-${Date.now().toString().slice(-6)}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setKhqrData(data);
      } else {
        error('មិនអាចបង្កើត KHQR បានទេ', data.error || 'សូមព្យាយាមម្តងទៀត');
      }
    } catch (err) {
      console.error('Failed to generate KHQR:', err);
      error('មានបញ្ហា', 'មិនអាចបង្កើត QR Code សម្រាប់ទូទាត់បានទេ');
    } finally {
      setGeneratingQR(false);
    }
  };

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
    fetchDynamicKHQR();
  };

  // Handle Slip Image File selection
  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('ប្រភេទ File មិនត្រឹមត្រូវ', 'សូមជ្រើសរើសរូបភាព (PNG, JPG, JPEG)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      error('ទំហំ File ធំពេក', 'សូមជ្រើសរើសរូបភាពដែលមានទំហំតូចជាង 8MB');
      return;
    }

    setSlipFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setSlipImage(reader.result as string);
      success('បានជ្រើសរើស Slip រួចរាល់!', file.name);
    };
    reader.readAsDataURL(file);
  };

  const removeSlip = () => {
    setSlipImage(null);
    setSlipFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          paymentSlip: slipImage || null,
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
      success('ការទូទាត់ជោគជ័យ!', 'ការបញ្ជាទិញរបស់អ្នកត្រូវបានបញ្ចប់ត្រឹមត្រូវ');
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

  const handleCopyQRString = () => {
    if (khqrData?.qrString) {
      navigator.clipboard.writeText(khqrData.qrString);
      setCopiedQR(true);
      success('បានចម្លង KHQR String!', 'អ្នកអាច Paste ចូលក្នុង App ធនាគារ');
      setTimeout(() => setCopiedQR(false), 3000);
    }
  };

  const handleCopyAccount = (acc: string) => {
    navigator.clipboard.writeText(acc.replace(/\s+/g, ''));
    setCopiedAcc(true);
    success('បានចម្លងលេខកុង ABA!', acc);
    setTimeout(() => setCopiedAcc(false), 3000);
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

          {/* Downloadable Files Box */}
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
          {orderSuccess.allocatedKeys && orderSuccess.allocatedKeys.length > 0 && (
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
          )}

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
          <div className="glass-card p-6 rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-950/20 via-dark-900 to-dark-900 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs">2</span>
                វិធីទូទាត់ (Payment Method)
              </h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Official ABA Pay
              </span>
            </div>

            {/* Only ABA PAY */}
            <div className="p-4 rounded-2xl border bg-blue-950/25 border-blue-500/60 text-white shadow-xl shadow-blue-950/30 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-600/40 flex-shrink-0">
                  ABA
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-sm text-white">ABA Mobile & KHQR</p>
                    <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                      Tap to Pay & Scan
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-5 h-5 rounded-full border-2 border-blue-400 flex items-center justify-center p-0.5 flex-shrink-0">
                <div className="w-full h-full bg-blue-500 rounded-full" />
              </div>
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
              <span>ប្រព័ន្ធនឹងបង្ហាញ Real Dynamic KHQR ភ្លាមៗជាមួយទឹកប្រាក់ពិតប្រាកដ។</span>
            </div>
          </div>
        </div>
      </form>

      {/* REAL BAKONG KHQR & ABA PAY MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="glass-card max-w-lg w-full rounded-3xl p-6 border border-slate-700 bg-dark-900 shadow-2xl space-y-5 text-center my-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] tracking-wider">
                  KHQR
                </span>
                <span>ស្កេនទូទាត់ប្រាក់ (Bakong KHQR / ABA)</span>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="btn-uiverse-icon w-7 h-7 rounded-lg text-slate-400 hover:text-white text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Direct ABA Mobile Tap To Pay Button */}
            {khqrData?.abaPayLink && (
              <a
                href={khqrData.abaPayLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-500 hover:to-sky-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 transition-all transform active:scale-95 border border-blue-400/40"
              >
                <Smartphone className="w-4 h-4" />
                <span>📲 បើកក្នុង App ABA Mobile (Tap to Pay)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            )}

            {/* Real KHQR Card */}
            <div className="relative bg-gradient-to-b from-red-600 via-red-700 to-red-800 p-4 rounded-3xl shadow-2xl border border-red-500/40 text-white max-w-sm mx-auto">
              {/* KHQR Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <div className="text-left">
                  <div className="inline-block bg-white text-red-600 text-[11px] font-black px-2 py-0.5 rounded shadow">
                    KHQR
                  </div>
                  <p className="text-[12px] font-black mt-1 text-white tracking-wide">
                    {khqrData?.accountName || khqrData?.merchantName || 'PHAI POV'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-white/80 block">ABA Account</span>
                  <span className="text-[11px] font-mono font-black text-white bg-black/40 px-2 py-0.5 rounded border border-white/20">
                    {khqrData?.accountNumber || '007 576 225'}
                  </span>
                </div>
              </div>

              {/* Dynamic QR Frame */}
              <div className="my-3 bg-white p-3.5 rounded-2xl shadow-inner flex flex-col items-center justify-center min-h-[260px]">
                {generatingQR ? (
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-700 py-10">
                    <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold">កំពុងបង្កើត Real KHQR...</span>
                  </div>
                ) : khqrData?.qrDataUrl ? (
                  <div className="flex items-center justify-center p-2 bg-white rounded-xl">
                    <img
                      src={khqrData.qrDataUrl}
                      alt="ABA KHQR Code"
                      className="w-64 h-64 object-contain rounded-lg shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="text-xs text-red-600 p-4">មិនអាចទាញយក QR Code បានទេ</div>
                )}
              </div>

              {/* Total Amount in USD & KHR */}
              <div className="bg-black/40 rounded-2xl p-2.5 backdrop-blur-sm border border-white/15 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[9px] text-white/80 uppercase font-semibold">ចំនួនទឹកប្រាក់ត្រូវបង់</span>
                  <p className="text-xl font-black text-white font-mono leading-tight">{formatPrice(total)}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono font-black text-yellow-300">{formatPriceRiel(total)}</span>
                  <div className="flex items-center justify-end gap-1 text-[9px] text-white/70 mt-0.5">
                    <Clock className="w-3 h-3 text-yellow-400" />
                    <span>ផុតកំណត់: <strong className="font-mono text-white">{formatTimer(timeLeft)}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions: Copy Account & QR String */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyAccount(khqrData?.accountNumber || '007 576 225')}
                className="btn-uiverse-secondary px-3 py-2 rounded-xl text-[11px] flex items-center gap-1.5 text-blue-300 hover:text-white"
              >
                {copiedAcc ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>បានចម្លងលេខកុង</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>ចម្លងលេខកុង ABA ({khqrData?.accountNumber || '007 576 225'})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyQRString}
                className="btn-uiverse-copy px-3 py-2 rounded-xl text-[11px] flex items-center gap-1.5"
              >
                {copiedQR ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>បានចម្លង QR</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>ចម្លង QR String</span>
                  </>
                )}
              </button>
            </div>

            {/* Slip Upload Box */}
            <div className="p-4 rounded-2xl bg-dark-850 border border-slate-800 text-left space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white">ភ្ជាប់រូបភាពបង្កាន់ដៃបង់ប្រាក់ (Payment Slip / Screenshot)</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">(ផ្ញើចូល Telegram)</span>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleSlipChange}
                className="hidden"
              />

              {slipImage ? (
                <div className="p-3 rounded-xl bg-dark-900 border border-emerald-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={slipImage}
                      alt="Slip preview"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-700 bg-black"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-emerald-400 block line-clamp-1">{slipFileName || 'Payment Slip Image'}</span>
                      <span className="text-[10px] text-slate-400">បានភ្ជាប់រួចរាល់ ត្រៀមផ្ញើជូន Admin</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeSlip}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    title="ដករូបចេញ"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-700 hover:border-purple-500/50 bg-dark-900/50 hover:bg-purple-950/20 text-slate-300 flex items-center justify-center gap-2 text-xs transition-all cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  <span>ចុចត្រង់នេះដើម្បី Upload រូបភាព Slip ឬ Screenshot</span>
                </button>
              )}
            </div>

            {/* Instruction Steps */}
            <div className="p-3 rounded-xl bg-dark-850/80 border border-slate-800 text-[11px] text-slate-300 text-left space-y-1">
              <p className="font-semibold text-white">របៀបបង់ប្រាក់:</p>
              <p>1. ចុចប៊ូតុង <strong>"បើកក្នុង App ABA Mobile"</strong> (លើទូរស័ព្ទ) ឬស្កេន QR ខាងលើ</p>
              <p>2. ពិនិត្យមើលឈ្មោះ <strong>{khqrData?.accountName || 'PHAI POV'}</strong> និងចំនួនទឹកប្រាក់</p>
              <p>3. ផ្ទេរប្រាក់រួច ចុចប៊ូតុង <strong>"ខ្ញុំបានទូទាត់ប្រាក់រួចរាល់"</strong></p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowQRModal(false)}
                className="btn-uiverse-secondary flex-1 py-3 rounded-xl text-xs"
              >
                បោះបង់
              </button>
              <button
                type="button"
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

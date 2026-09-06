'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  orderNumber?: string;
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<'ABA_PAY' | 'BAKONG_KHQR' | 'WING' | 'CREDIT_CARD'>('ABA_PAY');

  // Auto-fill logged in user info when user data is loaded
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

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

  // Lock body scroll and cleanly blur/fade background & header when modal is open
  useEffect(() => {
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    
    if (showQRModal) {
      document.body.style.overflow = 'hidden';
      if (header) {
        header.style.opacity = '0';
        header.style.pointerEvents = 'none';
        header.style.transition = 'opacity 0.2s ease';
      }
      if (main) {
        main.style.filter = 'blur(10px)';
        main.style.transition = 'filter 0.2s ease';
      }
    } else {
      document.body.style.overflow = 'unset';
      if (header) {
        header.style.opacity = '1';
        header.style.pointerEvents = 'auto';
      }
      if (main) {
        main.style.filter = 'none';
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
      if (header) {
        header.style.opacity = '1';
        header.style.pointerEvents = 'auto';
      }
      if (main) {
        main.style.filter = 'none';
      }
    };
  }, [showQRModal]);

  // Real-time Bank & Webhook Auto-Verification Polling (checks only THIS specific order)
  useEffect(() => {
    if (!showQRModal || !khqrData?.orderNumber || orderSuccess) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        // 1. Check if THIS specific order was marked PAID by ABA Webhook
        if (khqrData.orderNumber) {
          const statusRes = await fetch(`/api/checkout/status?orderNumber=${encodeURIComponent(khqrData.orderNumber)}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (isMounted && statusData.paid) {
              clearInterval(interval);
              setOrderSuccess(statusData);
              setShowQRModal(false);
              clearCart();
              success('ការទូទាត់ជោគជ័យ!', 'ទទួលបានការផ្ទេរប្រាក់ពី App ABA រួចរាល់ 100%');
              return;
            }
          }
        }

        // 2. Check via Bakong Open API (if md5 available)
        if (khqrData.md5 && khqrData.orderNumber) {
          const res = await fetch('/api/checkout/bakong-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              md5: khqrData.md5,
              orderData: {
                orderNumber: khqrData.orderNumber,
                customerName: name.trim(),
                customerEmail: email.trim(),
                customerPhone: phone.trim(),
                items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
              },
            }),
          });

          const data = await res.json();
          if (isMounted && data.paid && data.success) {
            clearInterval(interval);
            setOrderSuccess(data);
            setShowQRModal(false);
            clearCart();
            success('ការទូទាត់ជោគជ័យ!', 'ធនាគារបានបញ្ជាក់ការផ្ទេរប្រាក់ 100%');
          }
        }
      } catch (err) {
        // Silently continue polling
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [showQRModal, khqrData?.orderNumber, khqrData?.md5, orderSuccess, clearCart, success]);

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
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          couponCode: coupon?.code || null,
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

      // 1. First check if THIS specific order was confirmed by bank webhook
      if (khqrData?.orderNumber) {
        const statusRes = await fetch(`/api/checkout/status?orderNumber=${encodeURIComponent(khqrData.orderNumber)}`);
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.paid) {
            setOrderSuccess(statusData);
            setShowQRModal(false);
            clearCart();
            success('ការទូទាត់ជោគជ័យ!', 'ធនាគារ ABA បានបញ្ជាក់ការផ្ទេរប្រាក់ 100%');
            return;
          }
        }
      }

      // 2. If not confirmed by bank yet and no slip uploaded -> BLOCK
      if (!slipImage) {
        error(
          'មិនទាន់ឃើញមានការផ្ទេរប្រាក់ទេ!',
          'សូមស្កេនទូទាត់តាម App ABA ឬ ភ្ជាប់រូបភាពបង្កាន់ដៃបង់ប្រាក់ (Payment Slip) ជាមុនសិន'
        );
        setProcessing(false);
        return;
      }

      // 3. If slip is uploaded, submit order for Admin verification
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: khqrData?.orderNumber || null,
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          paymentMethod,
          paymentSlip: slipImage,
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
      success('បានផ្ញើបង្កាន់ដៃជោគជ័យ!', 'ក្រុមការងារបានទទួលរូប Slip និងកំពុងផ្ទៀងផ្ទាត់ជូន');
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-300">
                    Email (សម្រាប់ទទួល Product Key) <span className="text-red-400">*</span>
                  </label>
                  {user?.email && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      ✓ គណនីបាន Login ({user.email})
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ឧ. example@gmail.com"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
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
          </div>
        </div>
      </form>

      {/* REAL BAKONG KHQR & ABA PAY MODAL */}
      {showQRModal && mounted && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-dark-950/92 backdrop-blur-2xl animate-in fade-in overflow-y-auto">
          <div className="max-w-[400px] w-full rounded-[28px] p-4 sm:p-5 border border-slate-700/60 bg-gradient-to-b from-[#141b2c]/98 via-[#0e1322]/98 to-[#090d18]/98 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(238,28,37,0.1)] backdrop-blur-2xl space-y-3.5 text-center my-auto max-h-[95vh] overflow-y-auto relative ring-1 ring-white/10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#EE1C25] to-[#B91018] flex items-center justify-center shadow-md shadow-red-500/25 text-white font-black text-[10px] tracking-wider border border-white/20">
                  KHQR
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white leading-tight">ស្កេនទូទាត់ប្រាក់</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Bakong KHQR • ABA Bank</p>
                </div>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-7 h-7 rounded-xl bg-dark-800/80 hover:bg-dark-750 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700/60"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Premium Official KHQR Card */}
            <div className="relative bg-gradient-to-b from-[#EE1C25] via-[#DE141E] to-[#99080F] p-3.5 sm:p-4 rounded-[22px] shadow-[0_12px_32px_-6px_rgba(238,28,37,0.35)] border border-white/25 text-white max-w-[330px] mx-auto overflow-hidden">
              {/* Gloss highlight */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/12 rounded-full blur-2xl pointer-events-none" />

              {/* KHQR Card Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/20 relative z-10">
                <div className="text-left flex items-center gap-2">
                  <div className="bg-white px-1.5 py-0.5 rounded shadow-sm flex items-center justify-center">
                    <span className="text-[#EE1C25] text-[10px] font-black tracking-wider">KHQR</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-white tracking-wide uppercase leading-tight">
                      {khqrData?.accountName || khqrData?.merchantName || 'PHAI POV'}
                    </p>
                    <span className="text-[8.5px] text-white/80 block">ABA Merchant</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[8.5px] text-white/80 block font-medium">Account No.</span>
                  <span className="text-[10px] font-mono font-bold text-white bg-black/35 px-1.5 py-0.5 rounded-md border border-white/20 inline-block mt-0.5 tracking-wide">
                    {khqrData?.accountNumber || '007 576 225'}
                  </span>
                </div>
              </div>

              {/* Dynamic QR Canvas */}
              <div className="my-2.5 bg-white p-2.5 rounded-xl shadow-inner flex flex-col items-center justify-center min-h-[190px] relative z-10 ring-1 ring-black/5">
                {generatingQR ? (
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-700 py-8">
                    <div className="w-7 h-7 border-3 border-[#EE1C25] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-slate-800">កំពុងបង្កើត KHQR...</span>
                  </div>
                ) : khqrData?.qrDataUrl ? (
                  <div className="flex items-center justify-center p-0.5 bg-white rounded-lg">
                    <img
                      src={khqrData.qrDataUrl}
                      alt="ABA KHQR Code"
                      className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-md"
                    />
                  </div>
                ) : (
                  <div className="text-xs text-red-600 p-4">មិនអាចទាញយក QR Code បានទេ</div>
                )}
              </div>

              {/* KHQR Card Footer: Amount Bar */}
              <div className="bg-black/40 rounded-xl p-2.5 backdrop-blur-md border border-white/15 flex items-center justify-between relative z-10 shadow-inner">
                <div className="text-left">
                  <span className="text-[8.5px] text-white/70 uppercase font-semibold tracking-wider block">ចំនួនទឹកប្រាក់ត្រូវបង់</span>
                  <p className="text-base sm:text-lg font-black text-white font-mono leading-tight mt-0.5">
                    {formatPrice(total)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[8.5px] text-white/70 uppercase font-semibold tracking-wider block">ប្រាក់រៀល (KHR)</span>
                  <span className="text-sm sm:text-base font-mono font-black text-amber-300 block drop-shadow-sm mt-0.5">
                    {formatPriceRiel(total)}
                  </span>
                </div>
              </div>

              {/* Big & Cool Glowing Neon Countdown Box */}
              <div className="mt-2 py-2 px-3.5 rounded-xl bg-gradient-to-r from-black/70 via-black/85 to-black/70 border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-between backdrop-blur-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-amber-500/10 animate-pulse pointer-events-none" />
                <div className="flex items-center gap-2 relative z-10">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-sm shadow-amber-500/20">
                    <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] font-bold text-amber-200 block leading-tight">
                      ផុតកំណត់ក្នុងរយៈពេល
                    </span>
                    <span className="text-[9px] text-white/60 font-medium">Payment Timer</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 relative z-10">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 tracking-widest drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]">
                    {formatTimer(timeLeft)}
                  </span>
                </div>
              </div>
            </div>

            {/* Slip Upload Box */}
            <div className="p-2.5 rounded-xl bg-dark-850/80 border border-slate-800 text-left space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[11px] font-bold text-slate-200">ភ្ជាប់បង្កាន់ដៃបង់ប្រាក់ (Slip / Screenshot)</span>
                </div>
                <span className="text-[9px] text-slate-400 px-1.5 py-0.5 rounded bg-dark-800 border border-slate-700/50">Optional</span>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleSlipChange}
                className="hidden"
              />

              {slipImage ? (
                <div className="p-2 rounded-lg bg-dark-900 border border-emerald-500/30 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <img
                      src={slipImage}
                      alt="Slip preview"
                      className="w-8 h-8 rounded-md object-cover border border-slate-700 bg-black"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-emerald-400 block line-clamp-1 text-[11px]">{slipFileName || 'Payment Slip'}</span>
                      <span className="text-[9px] text-slate-400">បានភ្ជាប់រួចរាល់ ត្រៀមផ្ញើជូន Admin</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeSlip}
                    className="p-1 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    title="ដករូបចេញ"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-700/80 hover:border-blue-500/50 bg-dark-900/40 hover:bg-blue-950/20 text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 text-[11px] transition-all cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>ចុចត្រង់នេះដើម្បី Upload រូបភាព Slip ឬ Screenshot</span>
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setShowQRModal(false)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white font-semibold text-xs transition-all border border-slate-700/60 active:scale-98"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={processing}
                className="flex-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-all transform active:scale-98 disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{processing ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'ខ្ញុំបានទូទាត់ប្រាក់រួចរាល់'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

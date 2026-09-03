'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Gift,
  Send,
  Trash2,
  Users,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Tag,
  Search,
  Copy,
  FolderDown,
  Ticket,
  Upload,
  FileUp,
  Loader2,
  Calendar,
  Hourglass,
  Timer,
} from 'lucide-react';

interface GiftItem {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  giftType: string;
  content?: string | null;
  isClaimed: boolean;
  claimedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
  };
}

interface UserOption {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

interface AvailableKey {
  id: string;
  key: string;
  product: { name: string };
}

interface AvailableFile {
  id: string;
  title: string;
  version: string;
  fileSize: string;
  filePath: string;
}

interface AvailableCoupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
}

export default function AdminGiftsPage() {
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [availableKeys, setAvailableKeys] = useState<AvailableKey[]>([]);
  const [availableFiles, setAvailableFiles] = useState<AvailableFile[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedUserId, setSelectedUserId] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [giftType, setGiftType] = useState('KEY');
  const [content, setContent] = useState('');
  const [expiresAt, setExpiresAt] = useState(''); // ISO string

  // Custom Expiry Input State
  const [customNum, setCustomNum] = useState<number | string>('');
  const [customUnit, setCustomUnit] = useState<'HOURS' | 'DAYS'>('HOURS');

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // File Upload State
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search filter for history
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/gifts');
      if (res.ok) {
        const data = await res.json();
        setGifts(data.gifts || []);
        setUsers(data.users || []);
        setAvailableKeys(data.availableKeys || []);
        setAvailableFiles(data.availableFiles || []);
        setAvailableCoupons(data.availableCoupons || []);
      }
    } catch (e) {
      console.error('Failed to load gifts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick Preset Handlers (Hours & Days)
  const setExpiryHours = (hours: number) => {
    const d = new Date(Date.now() + hours * 3600 * 1000);
    setExpiresAt(d.toISOString());
  };

  const setExpiryDays = (days: number) => {
    const d = new Date(Date.now() + days * 24 * 3600 * 1000);
    setExpiresAt(d.toISOString());
  };

  const applyCustomDuration = () => {
    const num = Number(customNum);
    if (!num || num <= 0) return;
    if (customUnit === 'HOURS') {
      setExpiryHours(num);
    } else {
      setExpiryDays(num);
    }
  };

  // When giftType changes, set smart placeholders & default titles
  const handleTypeChange = (newType: string) => {
    setGiftType(newType);
    setContent('');
    setUploadedFileName('');
    if (!title || title.startsWith('កាដូ')) {
      if (newType === 'KEY') setTitle('កាដូ Product Key ឥតគិតថ្លៃ');
      else if (newType === 'FILE') setTitle('កាដូ Software / Tool ឥតគិតថ្លៃ');
      else if (newType === 'VOUCHER') setTitle('កាដូ Voucher បញ្ចុះតម្លៃពិសេស');
      else setTitle('កាដូរង្វាន់ពិសេសពី Admin');
    }
  };

  // Direct File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/gifts/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.downloadUrl) {
        setContent(data.downloadUrl);
        setUploadedFileName(`${data.originalName} (${data.fileSize})`);
        if (!title || title.startsWith('កាដូ')) {
          setTitle(`កាដូឯកសារ ${data.originalName} ឥតគិតថ្លៃ`);
        }
      } else {
        alert(data.error || 'មានបញ្ហាក្នុងការ Upload File');
      }
    } catch (err) {
      alert('បរាជ័យក្នុងការ Upload File');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSendGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!selectedUserId && !customEmail.trim()) || !title.trim()) {
      setMessage({ type: 'error', text: 'សូមជ្រើសរើស ឬបញ្ចូលអ៊ីមែលអតិថិជន និងចំណងជើងកាដូ!' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId || undefined,
          email: customEmail.trim() || undefined,
          title: title.trim(),
          description: description.trim(),
          giftType,
          content: content.trim(),
          expiresAt: expiresAt || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'បានផ្ញើកាដូទៅកាន់អតិថិជនដោយជោគជ័យ!' });
        setTitle('');
        setDescription('');
        setContent('');
        setSelectedUserId('');
        setCustomEmail('');
        setUploadedFileName('');
        setExpiresAt('');
        setCustomNum('');
        loadData();
      } else {
        setMessage({ type: 'error', text: data.error || 'មានបញ្ហាក្នុងការផ្ញើកាដូ' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'បរាជ័យក្នុងការតភ្ជាប់' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('តើអ្នកពិតជាចង់លុបកាដូនេះមែនទេ?')) return;
    try {
      const res = await fetch(`/api/admin/gifts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGifts((prev) => prev.filter((g) => g.id !== id));
      }
    } catch (e) {
      alert('មិនអាចលុបបានទេ');
    }
  };

  const filteredGifts = gifts.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.user?.name?.toLowerCase()?.includes(search.toLowerCase()) ||
      g.user?.email?.toLowerCase()?.includes(search.toLowerCase())
  );

  // Format expiry preview for human reading
  const formatExpiryPreview = (isoString: string) => {
    if (!isoString) return 'គ្មានផុតកំណត់ (Lifetime)';
    const d = new Date(isoString);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    if (diffMs <= 0) return 'ផុតកំណត់ហើយ';

    const diffHours = Math.round(diffMs / (3600 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 3600 * 1000));

    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = d.toLocaleDateString('km-KH', { year: 'numeric', month: 'short', day: 'numeric' });

    let remainingText = '';
    if (diffHours < 24) {
      remainingText = `(សល់ប្រហែល ${diffHours} ម៉ោង)`;
    } else {
      remainingText = `(សល់ ${diffDays} ថ្ងៃ)`;
    }

    return `ផុតកំណត់នៅ៖ ម៉ោង ${timeStr}, ${dateStr} ${remainingText}`;
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-dark-900 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 flex items-center gap-1 w-fit">
            <Gift className="w-3.5 h-3.5" /> GIFT MANAGEMENT
          </span>
          <h1 className="text-2xl font-black text-white mt-1">
            ផ្ញើកាដូ និងរង្វាន់ទៅកាន់អតិថិជន (Send Gifts)
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Admin អាចកំណត់ផុតកំណត់គិតជាម៉ោង ឬគិតជាថ្ងៃ, Upload File ផ្ទាល់ពីកុំព្យូទ័រ, Product Key ឬ Voucher ផ្ញើជូនអតិថិជន។
          </p>
        </div>
      </div>

      {/* Form: Send Gift */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Send className="w-5 h-5 text-purple-400" />
          <span>បង្កើត និងផ្ញើកាដូថ្មី</span>
        </h3>

        {message && (
          <div
            className={`p-4 rounded-xl flex items-center gap-2 text-xs font-semibold ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSendGift} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Recipient User Dropdown & Quick Selection */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                <span>ជ្រើសរើស Email អតិថិជនដែលបាន Login/ចុះឈ្មោះ *</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                សរុប {users.length} គណនីក្នុងប្រព័ន្ធ
              </span>
            </label>

            <select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                if (e.target.value) setCustomEmail('');
              }}
              className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-slate-700 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-purple-500"
            >
              <option value="">-- សូមជ្រើសរើស Email អតិថិជន --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  📧 {u.email} — {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Gift Type (Selects dynamically) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>ប្រភេទកាដូ (Type) *</span>
            </label>
            <select
              value={giftType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-purple-500/50 text-white text-xs font-bold focus:outline-none focus:border-purple-500"
            >
              <option value="KEY">🔑 Product Key (License Key)</option>
              <option value="FILE">📁 File / Software Download (Upload)</option>
              <option value="VOUCHER">🎟️ កូដបញ្ចុះតម្លៃ (Discount Code / Voucher)</option>
              <option value="CUSTOM">🎁 កាដូពិសេសផ្សេងៗ (Custom Gift)</option>
            </select>
          </div>

          {/* Gift Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">ចំណងជើងកាដូ (Title) *</label>
            <input
              type="text"
              placeholder={
                giftType === 'KEY'
                  ? 'ឧ. កាដូ Product Key Windows 11 Pro ឥតគិតថ្លៃ'
                  : giftType === 'FILE'
                  ? 'ឧ. កាដូកម្មវិធី Photoshop 2025 Full Version'
                  : giftType === 'VOUCHER'
                  ? 'ឧ. កាដូកូដបញ្ចុះតម្លៃពិសេស $5.00 ឬ 20%'
                  : 'ឧ. កាដូរង្វាន់ពិសេសពី Admin'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* DYNAMIC CONTENT FIELD ACCORDING TO SELECTED TYPE */}
          <div className="space-y-3 md:col-span-2 p-5 rounded-2xl bg-dark-900/90 border border-purple-500/30">
            {/* 1. PRODUCT KEY TYPE */}
            {giftType === 'KEY' && (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" />
                    <span>ជ្រើសរើស Product Key ឬវាយ Key ផ្ទាល់ខ្លួន៖</span>
                  </label>
                  {availableKeys.length > 0 && (
                    <span className="text-[11px] text-slate-400">
                      (មាន {availableKeys.length} Keys ក្នុងស្តុក)
                    </span>
                  )}
                </div>

                {availableKeys.length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setContent(e.target.value);
                        const selectedKey = availableKeys.find((k) => k.key === e.target.value);
                        if (selectedKey && (!title || title.startsWith('កាដូ'))) {
                          setTitle(`កាដូ Product Key ${selectedKey.product.name} ឥតគិតថ្លៃ`);
                        }
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 text-xs font-mono"
                  >
                    <option value="">-- ជ្រើសរើស Key ស្រាប់ពីស្តុក --</option>
                    {availableKeys.map((k) => (
                      <option key={k.id} value={k.key}>
                        {k.product.name} ➜ {k.key}
                      </option>
                    ))}
                  </select>
                )}

                <input
                  type="text"
                  placeholder="ឧ. W269N-WFGWX-YVC9B-4J6C9-T83GX"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {/* 2. FILE / SOFTWARE TYPE (WITH DIRECT FILE UPLOAD) */}
            {giftType === 'FILE' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <FolderDown className="w-4 h-4" />
                    <span>Upload File ផ្ទាល់ ឬជ្រើសរើស Software ក្នុងប្រព័ន្ធ៖</span>
                  </label>
                </div>

                {/* Direct Upload Box */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-dashed border-blue-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                      {uploadingFile ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                      ) : (
                        <FileUp className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {uploadingFile
                          ? 'កំពុង Upload ឯកសារ...'
                          : uploadedFileName
                          ? `✅ បាន Upload: ${uploadedFileName}`
                          : 'Upload File ពីកុំព្យូទ័រ (ZIP, RAR, EXE, ISO, PDF...)'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {uploadedFileName
                          ? 'File ត្រូវបានរក្សាទុក និងបង្កើត Download Link ដោយស្វ័យប្រវត្ត'
                          : 'ជ្រើសរើស File ណាមួយដើម្បីផ្ញើជាកាដូជូនអតិថិជន'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={uploadingFile}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadedFileName ? 'ប្តូរ File ផ្សេង' : 'ជ្រើសរើស File...'}</span>
                  </button>
                </div>

                {/* Or Choose From Existing Files */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>ឬជ្រើសរើស File ដែលមានស្រាប់ក្នុងប្រព័ន្ធ៖</span>
                    {availableFiles.length > 0 && <span>({availableFiles.length} Files)</span>}
                  </div>

                  {availableFiles.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          const selectedFile = availableFiles.find((f) => f.id === e.target.value);
                          if (selectedFile) {
                            setContent(`/api/download/${selectedFile.id}`);
                            setUploadedFileName(`${selectedFile.title} (${selectedFile.fileSize})`);
                            if (!title || title.startsWith('កាដូ')) {
                              setTitle(
                                `កាដូកម្មវិធី ${selectedFile.title} (${selectedFile.version}) ឥតគិតថ្លៃ`
                              );
                            }
                          }
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-blue-400 text-xs"
                    >
                      <option value="">-- ជ្រើសរើស File / Software ក្នុងប្រព័ន្ធ --</option>
                      {availableFiles.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.title} (v{f.version}) - {f.fileSize}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Direct Download URL Input */}
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400">
                    Download Link / URL (ស្វ័យប្រវត្តិ ឬដាក់ Cloud Link ផ្ទាល់ខ្លួន)៖
                  </span>
                  <input
                    type="text"
                    placeholder="ឧ. /api/download/xxxx ឬ https://mega.nz/file/xxxx"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* 3. VOUCHER / COUPON TYPE */}
            {giftType === 'VOUCHER' && (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                    <Ticket className="w-4 h-4" />
                    <span>ជ្រើសរើសកូដបញ្ចុះតម្លៃ ឬវាយកូដបញ្ចុះតម្លៃផ្ទាល់ខ្លួន៖</span>
                  </label>
                  {availableCoupons.length > 0 && (
                    <span className="text-[11px] text-slate-400">
                      (មាន {availableCoupons.length} កូដបញ្ចុះតម្លៃសកម្ម)
                    </span>
                  )}
                </div>

                {availableCoupons.length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setContent(e.target.value);
                        const c = availableCoupons.find((item) => item.code === e.target.value);
                        if (c && (!title || title.startsWith('កាដូ'))) {
                          setTitle(
                            `កាដូកូដបញ្ចុះតម្លៃ ${c.discountValue}${
                              c.discountType === 'PERCENT' ? '%' : '$'
                            }`
                          );
                        }
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-pink-400 text-xs font-mono font-bold"
                  >
                    <option value="">-- ជ្រើសរើសកូដបញ្ចុះតម្លៃដែលមានស្រាប់ --</option>
                    {availableCoupons.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.code} ➜ ចុះ {c.discountValue}
                        {c.discountType === 'PERCENT' ? '%' : '$'}
                      </option>
                    ))}
                  </select>
                )}

                <input
                  type="text"
                  placeholder="ឧ. DISCOUNT50, VIP2026, FREE100"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                />
              </div>
            )}

            {/* 4. CUSTOM GIFT TYPE */}
            {giftType === 'CUSTOM' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <Gift className="w-4 h-4" />
                  <span>ព័ត៌មានកាដូ / Account / Note (Content)៖</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="ឧ. Account Premium: user@example.com | Pass: 123456 ឬ Link ចូល Telegram VIP Group..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            )}
          </div>

          {/* EXPIRATION SETTINGS (HOURS & DAYS OPTIONS) */}
          <div className="space-y-3 md:col-span-2 p-5 rounded-2xl bg-dark-900/80 border border-amber-500/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-amber-400" />
                <span>កំណត់ថ្ងៃ/ម៉ោងផុតកំណត់របស់កាដូ (Expiration by Hours & Days)</span>
              </label>
              <span className="text-xs font-bold text-amber-400">
                {formatExpiryPreview(expiresAt)}
              </span>
            </div>

            {/* 1. BY HOURS ROW */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> គិតជាម៉ោង (Preset by Hours)៖
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {[1, 3, 6, 12, 24].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setExpiryHours(h)}
                    className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                  >
                    <span>⏱️ {h} ម៉ោង</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. BY DAYS ROW */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> គិតជាថ្ងៃ / ខែ / ឆ្នាំ (Preset by Days)៖
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExpiresAt('')}
                  className={`text-[11px] px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer shadow-sm ${
                    !expiresAt
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : 'bg-slate-950 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
                  }`}
                >
                  ♾️ គ្មានផុតកំណត់ (Lifetime)
                </button>

                {[
                  { days: 3, label: '៣ ថ្ងៃ (3 Days)' },
                  { days: 7, label: '៧ ថ្ងៃ (7 Days)' },
                  { days: 15, label: '១៥ ថ្ងៃ (15 Days)' },
                  { days: 30, label: '៣០ ថ្ងៃ (30 Days)' },
                  { days: 90, label: '៣ ខែ (3 Months)' },
                  { days: 365, label: '១ ឆ្នាំ (1 Year)' },
                ].map((item) => (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => setExpiryDays(item.days)}
                    className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-white font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                  >
                    <span>📅 {item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. CUSTOM INPUT ROW & DATETIME PICKER */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-3">
              {/* Custom Number + Unit Input */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-700">
                <input
                  type="number"
                  placeholder="ចំនួន..."
                  min="1"
                  value={customNum}
                  onChange={(e) => setCustomNum(e.target.value)}
                  className="w-20 px-2 py-1 bg-transparent text-white text-xs font-mono focus:outline-none"
                />
                <select
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value as any)}
                  className="bg-dark-900 text-slate-200 text-xs px-2 py-1 rounded-lg border border-slate-700 focus:outline-none"
                >
                  <option value="HOURS">ម៉ោង (Hours)</option>
                  <option value="DAYS">ថ្ងៃ (Days)</option>
                </select>
                <button
                  type="button"
                  onClick={applyCustomDuration}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow"
                >
                  កំណត់
                </button>
              </div>

              {/* Exact Datetime Picker */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">ឬរើសម៉ោង/ថ្ងៃជាក់លាក់៖</span>
                <input
                  type="datetime-local"
                  value={
                    expiresAt
                      ? new Date(new Date(expiresAt).getTime() - new Date().getTimezoneOffset() * 60000)
                          .toISOString()
                          .slice(0, 16)
                      : ''
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      setExpiresAt(new Date(e.target.value).toISOString());
                    } else {
                      setExpiresAt('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {expiresAt && (
                <button
                  type="button"
                  onClick={() => setExpiresAt('')}
                  className="text-[11px] text-rose-400 hover:underline cursor-pointer ml-auto"
                >
                  លុបថ្ងៃផុតកំណត់
                </button>
              )}
            </div>
          </div>

          {/* Admin Note / Message */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-300">សារជូនពរ / Note ពី Admin</label>
            <textarea
              rows={2}
              placeholder="ឧ. អរគុណច្រើនចំពោះការគាំទ្រ P-Two7 Store! នេះជាកាដូរង្វាន់ពិសេសសម្រាប់អ្នក។"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Gift className="w-4 h-4" />
              <span>{submitting ? 'កំពុងផ្ញើ...' : 'ផ្ញើកាដូទៅកាន់អតិថិជន'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Gifts History Table */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Gift className="w-4 h-4 text-purple-400" />
            <span>ប្រវត្តិកាដូទាំងអស់ដែលបានផ្ញើ ({filteredGifts.length})</span>
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះ/អ៊ីមែល..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">កំពុងទាញយកទិន្នន័យ...</div>
        ) : filteredGifts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-dark-900 rounded-2xl">
            មិនទាន់មានប្រវត្តិកាដូដែលបានផ្ញើនៅឡើយទេ។
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3">អតិថិជន</th>
                  <th className="pb-3">កាដូ</th>
                  <th className="pb-3">ប្រភេទ & Content</th>
                  <th className="pb-3">ថ្ងៃ/ម៉ោងផុតកំណត់</th>
                  <th className="pb-3">កាលបរិច្ឆេទផ្ញើ</th>
                  <th className="pb-3 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredGifts.map((gift) => {
                  const isExpired = gift.expiresAt && new Date(gift.expiresAt) < new Date();
                  const expDate = gift.expiresAt ? new Date(gift.expiresAt) : null;

                  return (
                    <tr key={gift.id} className="text-slate-300">
                      <td className="py-3">
                        <p className="font-bold text-white">{gift.user?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{gift.user?.email || '-'}</p>
                      </td>
                      <td className="py-3">
                        <p className="font-bold text-purple-300">{gift.title}</p>
                        {gift.description && (
                          <p className="text-[10px] text-slate-400 italic line-clamp-1">
                            "{gift.description}"
                          </p>
                        )}
                      </td>
                      <td className="py-3 font-mono">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 mr-2">
                          {gift.giftType}
                        </span>
                        <span className="text-xs text-emerald-400 font-bold">{gift.content || '-'}</span>
                      </td>
                      <td className="py-3">
                        {expDate ? (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              isExpired
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {isExpired
                              ? 'ផុតកំណត់ហើយ'
                              : `${expDate.toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })} ${expDate.toLocaleDateString('km-KH', {
                                  month: 'short',
                                  day: 'numeric',
                                })}`}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            ♾️ គ្មានផុតកំណត់
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-[11px] text-slate-400">
                        {new Date(gift.createdAt).toLocaleDateString('km-KH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDelete(gift.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-600/30 transition-all cursor-pointer"
                          title="លុបកាដូ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

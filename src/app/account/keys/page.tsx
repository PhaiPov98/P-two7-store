'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, Copy, Check, ShieldCheck, HelpCircle, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { formatDateKhmer, KHMER_TEXT } from '@/lib/translations';

interface UserKeyItem {
  id: string;
  key: string;
  soldAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    version?: string;
    downloadUrl?: string | null;
    file?: {
      id: string;
      title: string;
      fileType: string;
      fileSize: string;
      version?: string;
    } | null;
  };
  orderItem?: {
    order?: {
      orderNumber: string;
      createdAt: string;
    };
  };
}

export default function UserKeysPage() {
  const [keys, setKeys] = useState<UserKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { success } = useToast();

  useEffect(() => {
    async function fetchKeys() {
      try {
        setLoading(true);
        const res = await fetch('/api/user/keys');
        if (res.ok) {
          const data = await res.json();
          setKeys(data.keys || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchKeys();
  }, []);

  const handleCopy = (id: string, keyText: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedId(id);
    success('បានចម្លង Key ជោគជ័យ!', keyText);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">Product Keys របស់ខ្ញុំ</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            បញ្ជី License Keys ស្របច្បាប់ទាំងអស់ដែលអ្នកបានជាវ
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-dark-900 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : keys.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-slate-800 space-y-3">
          <KeyRound className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">មិនទាន់មាន Product Key ទេ</h3>
          <p className="text-xs text-slate-400">
            នៅពេលអ្នកបញ្ជាទិញ Product Key រួចរាល់ វានឹងបង្ហាញនៅទីនេះភ្លាមៗ។
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {keys.map((k) => (
            <div
              key={k.id}
              className="glass-card rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4 hover:border-blue-500/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      Lifetime License
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> ផ្ទៀងផ្ទាត់រួចរាល់
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white">{k.product.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ទិញនៅ: {formatDateKhmer(k.soldAt || new Date())} • Order: {k.orderItem?.order?.orderNumber || 'Online'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedId(expandedId === k.id ? null : k.id)}
                    className="btn-uiverse-secondary px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>ការណែនាំ</span>
                    {expandedId === k.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleCopy(k.id, k.key)}
                    className="btn-uiverse-copy px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    {copiedId === k.id ? (
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
              </div>

              {/* Key Box */}
              <div className="p-4 rounded-xl bg-dark-950 border border-slate-700/80 flex items-center justify-between font-mono">
                <span className="text-base sm:text-lg font-black text-emerald-400 tracking-wider select-all break-all">
                  {k.key}
                </span>
              </div>

              {/* Download File Attachment if available */}
              {(k.product?.file || k.product?.downloadUrl) && (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
                      {k.product.file?.fileType || 'EXE'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {k.product.file?.title || k.product.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {k.product.file?.fileSize || 'Direct Download'} {k.product.version ? `• v${k.product.version}` : ''}
                      </p>
                    </div>
                  </div>

                  <a
                    href={k.product.file ? `/api/download/${k.product.file.id}` : (k.product.downloadUrl || '#')}
                    target={k.product.downloadUrl?.startsWith('http') ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="animated-button flex-shrink-0"
                  >
                    <span>
                      <Download className="w-3.5 h-3.5" />
                      <span>ទាញយក File {k.product.file?.fileType ? `.${k.product.file.fileType}` : '.EXE'}</span>
                    </span>
                    <span></span>
                  </a>
                </div>
              )}

              {/* Instructions Expand */}
              {expandedId === k.id && (
                <div className="p-4 rounded-xl bg-dark-900 border border-blue-500/20 text-xs text-slate-300 space-y-2 animate-in fade-in">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                    របៀប Activate License Key នេះ:
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed">
                    <li>បើកកុំព្យូទ័ររបស់អ្នក រួចចូលទៅកាន់ <strong>Settings &gt; System &gt; Activation</strong> (សម្រាប់ Windows)។</li>
                    <li>ចុចលើ <strong>Change Product Key</strong> រួចបិទភ្ជាប់ (Paste) Key ខាងលើ។</li>
                    <li>ចុច <strong>Next</strong> និង <strong>Activate</strong> ដើម្បីបញ្ចប់។</li>
                    <li>ប្រសិនបើមានចម្ងល់ ឬបញ្ហា សូមទាក់ទងមកកាន់ Support 24/7 តាម Telegram <strong>@bozzpov</strong>។</li>
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

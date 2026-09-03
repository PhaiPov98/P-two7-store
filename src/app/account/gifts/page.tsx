'use client';

import React, { useState, useEffect } from 'react';
import {
  Gift,
  Sparkles,
  KeyRound,
  Copy,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  FolderDown,
  Tag,
  AlertTriangle,
  Calendar,
  PartyPopper,
  Lock,
  Unlock,
  PackageOpen,
} from 'lucide-react';
import Link from 'next/link';

interface GiftItem {
  id: string;
  title: string;
  description?: string | null;
  giftType: string;
  content?: string | null;
  isClaimed: boolean;
  claimedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

export default function UserGiftsPage() {
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [celebrateId, setCelebrateId] = useState<string | null>(null);

  const loadGifts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/user/gifts?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        setGifts(data.gifts || []);
      }
    } catch (e) {
      console.error('Failed to load user gifts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGifts();
  }, []);

  const handleClaim = async (giftId: string) => {
    setClaimingId(giftId);
    try {
      const res = await fetch('/api/user/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId }),
      });

      if (res.ok) {
        setCelebrateId(giftId);
        setGifts((prev) =>
          prev.map((g) =>
            g.id === giftId ? { ...g, isClaimed: true, claimedAt: new Date().toISOString() } : g
          )
        );
        setTimeout(() => setCelebrateId(null), 3500);
      }
    } catch (err) {
      console.error('Failed to claim gift:', err);
    } finally {
      setClaimingId(null);
    }
  };

  const copyContent = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-8 select-none">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-pink-950/60 via-purple-950/40 to-dark-900 border border-pink-500/30 shadow-[0_0_40px_-10px_rgba(236,72,153,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20 flex items-center gap-1.5 w-fit">
            <Gift className="w-3.5 h-3.5" /> កាដូពី ADMIN
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 flex items-center gap-2">
            <span>កាដូ និងរង្វាន់របស់ខ្ញុំ</span>
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            ទីនេះជាកន្លែងទទួលកាដូរង្វាន់ពិសេសៗ (Product Keys ឥតគិតថ្លៃ, Voucher & Downloads) ដែល Admin បានផ្ញើជូនលោកអ្នកដោយផ្ទាល់។
          </p>
        </div>
      </div>

      {/* Gifts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-400" />
            <span>កាដូដែលអ្នកបានទទួល ({gifts.length})</span>
          </h3>

          <button
            onClick={loadGifts}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-pink-500 text-slate-300 hover:text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Clock className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'កំពុងទាញយក...' : '🔄 ពិនិត្យឡើងវិញ'}</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 glass-card rounded-3xl">
            កំពុងទាញយកទិន្នន័យកាដូ...
          </div>
        ) : gifts.length === 0 ? (
          <div className="p-10 sm:p-14 text-center glass-card rounded-3xl border border-slate-800/80 space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mx-auto shadow-inner">
              <Gift className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-base text-white">
                លោកអ្នកមិនទាន់មានកាដូពី Admin នៅឡើយទេ
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                នៅពេល Admin ផ្ញើ Product Key ឥតគិតថ្លៃ ឬរង្វាន់ពិសេសៗជូនលោកអ្នក វានឹងបង្ហាញឡើងនៅទីនេះដោយស្វ័យប្រវត្តិ។
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all active:scale-95 cursor-pointer mt-2"
            >
              <span>ស្វែងរកផលិតផលក្នុងហាង</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {gifts.map((g) => {
              const isExpired = g.expiresAt && new Date(g.expiresAt) < new Date();
              const isUnopened = !g.isClaimed;
              const isCelebrating = celebrateId === g.id;

              return (
                <div
                  key={g.id}
                  className={`glass-card p-6 rounded-3xl border flex flex-col justify-between gap-5 shadow-xl transition-all relative overflow-hidden ${
                    isExpired
                      ? 'border-slate-800 from-dark-900 via-slate-900/40 to-dark-950 opacity-75'
                      : isUnopened
                      ? 'border-amber-500/50 bg-gradient-to-br from-amber-950/40 via-purple-950/40 to-dark-900 shadow-[0_0_30px_-5px_rgba(245,158,11,0.2)] hover:border-amber-400'
                      : 'border-pink-500/30 bg-gradient-to-br from-pink-950/20 via-slate-900/60 to-dark-900 hover:border-pink-400/60'
                  }`}
                >
                  {/* Celebration Glow Effect */}
                  {isCelebrating && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-pink-500/30 to-purple-500/20 animate-pulse pointer-events-none flex items-center justify-center">
                      <div className="text-center space-y-1">
                        <PartyPopper className="w-10 h-10 text-amber-300 mx-auto animate-bounce" />
                        <span className="text-xs font-black text-amber-300">
                          🎉 អបអរសាទរ! អ្នកបានទទួលកាដូជោគជ័យ!
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${
                          isUnopened
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-pink-500/15 text-pink-300 border border-pink-500/30'
                        }`}
                      >
                        <Gift className="w-3 h-3" />
                        {g.giftType === 'KEY'
                          ? 'Product Key'
                          : g.giftType === 'FILE'
                          ? 'Software File'
                          : g.giftType === 'VOUCHER'
                          ? 'កូដបញ្ចុះតម្លៃ'
                          : 'កាដូពិសេស'}
                      </span>

                      {/* Expiration Badge */}
                      {g.expiresAt ? (
                        (() => {
                          const exp = new Date(g.expiresAt);
                          const now = new Date();
                          const diffMs = exp.getTime() - now.getTime();
                          const diffHours = Math.round(diffMs / (3600 * 1000));

                          return (
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                                isExpired
                                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {isExpired
                                ? 'ផុតកំណត់ហើយ'
                                : diffHours < 24 && diffHours > 0
                                ? `សល់ ${diffHours} ម៉ោង (ម៉ោង ${exp.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })})`
                                : `ផុតកំណត់: ${exp.toLocaleDateString('km-KH', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}`}
                            </span>
                          );
                        })()
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          ♾️ គ្មានផុតកំណត់
                        </span>
                      )}
                    </div>

                    <h4 className="font-black text-lg text-white group-hover:text-pink-300 transition-colors">
                      {g.title}
                    </h4>

                    {g.description && (
                      <div className="p-3 rounded-2xl bg-dark-950/60 border border-slate-800/80 text-xs text-slate-300 italic">
                        💬 "{g.description}"
                      </div>
                    )}
                  </div>

                  {/* UNOPENED GIFT: USER CLICKS TO CLAIM */}
                  {isUnopened && !isExpired ? (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 shadow-inner">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                          <PackageOpen className="w-5 h-5 animate-bounce" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white">កាដូថ្មីមិនទាន់បានបើក!</p>
                          <p className="text-[11px] text-slate-400">
                            ចុចប៊ូតុងខាងស្តាំដើម្បីបើកទទួលយកកាដូរបស់អ្នក
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleClaim(g.id)}
                        disabled={claimingId === g.id}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white font-black text-xs shadow-lg shadow-amber-500/30 transition-all active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{claimingId === g.id ? 'កំពុងបើក...' : '🎁 ទទួលយកកាដូ'}</span>
                      </button>
                    </div>
                  ) : (
                    /* ALREADY CLAIMED / OPENED: SHOW KEY / LINK / DOWNLOAD */
                    g.content && (
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                            {g.giftType === 'FILE' ? (
                              <>
                                <FolderDown className="w-3.5 h-3.5 text-blue-400" />
                                <span>Link ទាញយក Software របស់អ្នក៖</span>
                              </>
                            ) : g.giftType === 'VOUCHER' ? (
                              <>
                                <Tag className="w-3.5 h-3.5 text-pink-400" />
                                <span>កូដបញ្ចុះតម្លៃ (Discount Code) របស់អ្នក៖</span>
                              </>
                            ) : (
                              <>
                                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                                <span>កូដ / Product Key របស់អ្នក៖</span>
                              </>
                            )}
                          </span>

                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> បានទទួលយក
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-dark-950 border border-slate-700/80 flex items-center justify-between gap-2">
                          <code className="font-mono font-black text-xs sm:text-sm text-emerald-400 truncate select-all">
                            {isExpired ? '••••••••••••••••••••' : g.content}
                          </code>

                          {isExpired ? (
                            <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>ផុតកំណត់</span>
                            </span>
                          ) : g.giftType === 'FILE' ? (
                            <a
                              href={g.content}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow active:scale-95 cursor-pointer"
                            >
                              <FolderDown className="w-3.5 h-3.5" />
                              <span>ទាញយក File</span>
                            </a>
                          ) : (
                            <button
                              onClick={() => copyContent(g.id, g.content!)}
                              className="px-3.5 py-2 rounded-xl bg-pink-600/20 hover:bg-pink-600 text-pink-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow active:scale-95 cursor-pointer"
                            >
                              {copiedId === g.id ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400">បានចម្លង ✓</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>{g.giftType === 'VOUCHER' ? 'ចម្លងកូដបញ្ចុះតម្លៃ' : 'ចម្លង Key'}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

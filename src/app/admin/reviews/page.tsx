'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  Search,
  Trash2,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { formatDateKhmer } from '@/lib/translations';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStar, setSelectedStar] = useState<number | 'ALL'>('ALL');
  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reviews?limit=100');
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('តើអ្នកពិតជាចង់លុបការវាយតម្លៃនេះមែនទេ?')) return;

    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        success('បានលុបការវាយតម្លៃជោគជ័យ!');
        loadData();
      } else {
        error('បរាជ័យ', data.error || 'មិនអាចលុបបានទេ');
      }
    } catch (err) {
      error('មានបញ្ហា', 'សូមព្យាយាមម្តងទៀត');
    }
  };

  const filtered = reviews.filter((r) => {
    if (selectedStar !== 'ALL' && r.rating !== selectedStar) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchComment = r.comment?.toLowerCase().includes(q);
      const matchUser = r.user?.name?.toLowerCase().includes(q);
      const matchProduct = r.product?.name?.toLowerCase().includes(q);
      if (!matchComment && !matchUser && !matchProduct) return false;
    }
    return true;
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
            <span>គ្រប់គ្រងការវាយតម្លៃ (Customer Reviews)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            ពិនិត្យមើល និងគ្រប់គ្រងមតិយោបល់ និងផ្កាយដែលអតិថិជនបានផ្ដល់ឱ្យផលិតផល
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-black text-amber-300">{avgRating} / 5.0</span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-black text-blue-300">{reviews.length} មតិ</span>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះអតិថិជន ផលិតផល ឬខ្លឹមសារ..."
            className="w-full bg-dark-850 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Star Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedStar('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedStar === 'ALL'
                ? 'bg-amber-500 text-dark-950 shadow-md shadow-amber-500/25'
                : 'bg-dark-850 text-slate-300 hover:bg-dark-800 border border-slate-700/60'
            }`}
          >
            ទាំងអស់ ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((s) => {
            const count = reviews.filter((r) => r.rating === s).length;
            return (
              <button
                key={s}
                onClick={() => setSelectedStar(s)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  selectedStar === s
                    ? 'bg-amber-500 text-dark-950 shadow-md shadow-amber-500/25'
                    : 'bg-dark-850 text-slate-300 hover:bg-dark-800 border border-slate-700/60'
                }`}
              >
                <span>{s}</span>
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-dark-900 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-slate-800 space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">មិនទាន់មានការវាយតម្លៃនៅឡើយទេ</h3>
          <p className="text-xs text-slate-400">
            នៅពេលអតិថិជនសរសេរ Review លើផលិតផល វានឹងបង្ហាញនៅទីនេះដោយស្វ័យប្រវត្តិ។
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((rev) => (
            <div
              key={rev.id}
              className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                {/* Header: User & Rating */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-dark-950 font-black flex items-center justify-center text-sm shadow-md">
                      {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{rev.user?.name || 'អតិថិជន'}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          Verified Buyer
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {formatDateKhmer(rev.createdAt || new Date())}
                      </p>
                    </div>
                  </div>

                  {/* Star Rating Badge */}
                  <div className="flex items-center gap-0.5 bg-dark-950/80 px-2.5 py-1 rounded-full border border-amber-500/30">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-3.5 h-3.5 ${
                          idx < rev.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-xs text-slate-200 leading-relaxed bg-dark-900/60 p-3 rounded-xl border border-slate-800/80">
                  "{rev.comment}"
                </p>
              </div>

              {/* Footer: Product Info & Delete Action */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px]">
                <Link
                  href={`/products/${rev.product?.slug}`}
                  target="_blank"
                  className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 hover:underline truncate max-w-[200px]"
                >
                  <span>{rev.product?.name || 'ផលិតផល'}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </Link>

                <button
                  onClick={() => handleDelete(rev.id)}
                  className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1 border border-red-500/20 transition-colors"
                  title="លុបការវាយតម្លៃ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>លុប</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

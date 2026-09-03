'use client';

import React, { useState } from 'react';
import { Star, Send, CheckCircle, MessageSquarePlus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string | Date;
  user: {
    name: string;
    avatar?: string | null;
  };
}

interface ProductReviewsProps {
  productId: string;
  initialReviews: ReviewItem[];
}

export default function ProductReviews({ productId, initialReviews }: ProductReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'បរាជ័យក្នុងការវាយតម្លៃ');
      }

      setReviews([data.review, ...reviews]);
      setComment('');
      setRating(5);
      setSuccess(true);
      setShowForm(false);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'មានបញ្ហាកើតឡើង');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-8 border-t border-slate-800 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          ការវាយតម្លៃពីអតិថិជន ({reviews.length})
        </h3>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
          >
            <MessageSquarePlus className="w-4 h-4" /> សរសេរការវាយតម្លៃ (Write Review)
          </button>
        )}
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>ការវាយតម្លៃរបស់អ្នកត្រូវបានរក្សាទុកដោយជោគជ័យ! អរគុណសម្រាប់ការចែករំលែក។</span>
        </div>
      )}

      {showForm && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">សរសេរការវាយតម្លៃរបស់អ្នក</h4>
            <button
              onClick={() => setShowForm(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              បោះបង់
            </button>
          </div>

          {!user ? (
            <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 text-center text-xs text-slate-300 space-y-2">
              <p>សូមចូលគណនីដើម្បីអាចវាយតម្លៃផលិតផលបាន</p>
              <Link
                href="/login"
                className="inline-block px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                ចូលគណនីឥឡូវនេះ
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ជ្រើសរើសផ្កាយ (Rating)
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-slate-600 transition-colors focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-amber-400 font-bold ml-2">
                    {rating} / 5 ផ្កាយ
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  មតិយោបល់ ឬបទពិសោធន៍ប្រើប្រាស់ (Review Comment)
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="សរសេរការវាយតម្លៃរបស់អ្នកនៅទីនេះ..."
                  required
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={submitting || !comment.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'កំពុងបញ្ជូន...' : 'បញ្ជូនការវាយតម្លៃ'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="p-8 rounded-2xl bg-dark-900/60 border border-slate-800/80 text-center space-y-2">
          <p className="text-xs text-slate-400">មិនទាន់មានការវាយតម្លៃសម្រាប់ផលិតផលនេះនៅឡើយទេ</p>
          <p className="text-[11px] text-slate-500">
            ក្លាយជាអ្នកដំបូងគេដែលធ្វើការវាយតម្លៃលើផលិតផលនេះ!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-md">
                    {rev.user?.avatar ? (
                      <img
                        src={rev.user.avatar}
                        alt={rev.user.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      rev.user?.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-tight">
                      {rev.user?.name || 'អតិថិជន'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString('km-KH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

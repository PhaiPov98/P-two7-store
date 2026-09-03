import React from 'react';
import Link from 'next/link';
import {
  Zap,
  ShieldCheck,
  Headphones,
  Lock,
  ChevronRight,
  FolderDown,
  Monitor,
  Star,
  CheckCircle,
  ArrowRight,
  BadgeCheck,
  KeyRound,
  Layers,
  FileSpreadsheet,
  Palette,
  Cpu,
  Gamepad2,
  Crown,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/product/ProductCard';
import FileCard from '@/components/file/FileCard';
import HeroBanner from '@/components/home/HeroBanner';
import { KHMER_TEXT } from '@/lib/translations';

// Dynamic icon mapping for categories
const categoryIcons: Record<string, any> = {
  Monitor,
  FileSpreadsheet,
  ShieldCheck,
  Palette,
  Cpu,
  Gamepad2,
  Crown,
  FolderDown,
};

export const revalidate = 0; // Fresh data

export default async function HomePage() {
  const [featuredProducts, reviews] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
      },
      orderBy: [{ isBestSeller: 'desc' }, { soldCount: 'desc' }],
      take: 8,
    }),
    prisma.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 6,
    }),
  ]);

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION (Dynamic 3D Flipping Carousel with Badges Removed) */}
      <HeroBanner />

      {/* 2. BESTSELLING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              ផលិតផលលក់ដាច់បំផុត
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            មើលផលិតផលទាំងអស់ <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

      {/* 5. CUSTOMER REVIEWS (Dynamic Real Data) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-1 text-amber-400 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            ការវាយតម្លៃពីអតិថិជន
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            មតិពិតៗពីអតិថិជនដែលបានទិញ និងប្រើប្រាស់សេវាកម្មរបស់យើង
          </p>
        </div>

        {reviews && reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString('km-KH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed italic line-clamp-4">
                    "{review.comment}"
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow overflow-hidden">
                      {review.user?.avatar ? (
                        <img
                          src={review.user.avatar}
                          alt={review.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        review.user?.name?.charAt(0)?.toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-white truncate">
                        {review.user?.name || 'អតិថិជន'}
                      </p>
                      {review.product && (
                        <Link
                          href={`/products/${review.product.slug}`}
                          className="text-[10px] text-blue-400 hover:text-blue-300 truncate block transition-colors"
                        >
                          {review.product.name}
                        </Link>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5" /> បានផ្ទៀងផ្ទាត់
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-3xl bg-dark-900/60 border border-slate-800 text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6 fill-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-white">មិនទាន់មានការវាយតម្លៃនៅឡើយទេ</h3>
            <p className="text-xs text-slate-400">
              ការវាយតម្លៃពីអតិថិជនទាំងអស់នឹងត្រូវបានបង្ហាញនៅទីនេះដោយស្វ័យប្រវត្តិ នៅពេលមានការវាយតម្លៃថ្មី។
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 mt-2"
            >
              ស្វែងរកផលិតផលដើម្បីទិញ និងវាយតម្លៃ <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

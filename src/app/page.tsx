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

export const revalidate = 30; // Fast cached data with 30s background revalidation

export default async function HomePage() {
  let featuredProducts: any[] = [];
  let reviews: any[] = [];
  let stats = {
    totalCustomers: 0,
    avgRating: '0.0',
    totalReviews: 0,
  };

  try {
    const [prods, revs, totalOrders, totalCustomers, reviewStats] = await Promise.all([
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
      prisma.order.count({
        where: {
          OR: [
            { orderStatus: 'COMPLETED' },
            { paymentStatus: 'PAID' },
          ],
        },
      }),
      prisma.user.count({
        where: { role: 'CUSTOMER' },
      }),
      prisma.review.aggregate({
        _avg: { rating: true },
        _count: { id: true },
      }),
    ]);

    featuredProducts = prods || [];
    reviews = revs || [];
    stats = {
      totalCustomers: Math.max(totalOrders || 0, totalCustomers || 0),
      avgRating: reviewStats?._avg?.rating ? reviewStats._avg.rating.toFixed(1) : '0.0',
      totalReviews: reviewStats?._count?.id || 0,
    };
  } catch (error) {
    console.error('HomePage data fetch error:', error);
  }

  return (
    <div className="space-y-10 sm:space-y-16 pb-16">
      {/* 1. HERO SECTION (Dynamic 3D Flipping Carousel with Real Stats) */}
      <HeroBanner stats={stats} />

      {/* 2. BESTSELLING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <div>
            <h2 className="text-base sm:text-2xl md:text-3xl font-bold sm:font-black text-white leading-tight">
              ផលិតផលលក់ដាច់បំផុត
            </h2>
          </div>
          <Link
            href="/products"
            className="text-[11px] sm:text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 sm:gap-1 transition-colors shrink-0 whitespace-nowrap"
          >
            <span>មើលទាំងអស់</span> <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featuredProducts && featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        ) : (
          <div className="p-6 sm:p-10 rounded-2xl bg-dark-900/50 border border-slate-800/80 text-center space-y-2">
            <p className="text-xs sm:text-sm text-slate-400">មិនទាន់មានផលិតផលដាក់លក់នៅឡើយទេ</p>
          </div>
        )}
      </section>

      {/* 5. CUSTOMER REVIEWS (Only show when real reviews exist) */}
      {reviews && reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-6 sm:mb-10">
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-amber-400" />
              ))}
            </div>
            <h2 className="text-base sm:text-2xl md:text-3xl font-bold sm:font-black text-white">
              ការវាយតម្លៃពីអតិថិជន
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
              មតិពិតៗពីអតិថិជនដែលបានទិញ និងប្រើប្រាស់សេវាកម្មរបស់យើង
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
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

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic line-clamp-4">
                    "{review.comment}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[11px] sm:text-xs font-black flex-shrink-0 shadow overflow-hidden">
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

                  <span className="text-[9px] sm:text-[10px] text-emerald-400 flex items-center gap-1 font-semibold flex-shrink-0">
                    <CheckCircle className="w-3 h-3" /> បានផ្ទៀងផ្ទាត់
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Star,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Cpu,
  Monitor,
  Tag,
  FileText,
  ArrowLeft,
  Share2,
  Lock,
  Headphones,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import ProductActionButtons from '@/components/product/ProductActionButtons';
import ProductReviews from '@/components/product/ProductReviews';
import { formatPrice, formatPriceRiel, KHMER_TEXT } from '@/lib/translations';

export const revalidate = 0;

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      file: true,
      reviews: {
        include: {
          user: { select: { name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Related products
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    take: 3,
  });

  const featuresList = product.features
    ? product.features.split(',').map((f) => f.trim())
    : ['Official License Key', 'Lifetime Online Activation', '1 PC / 1 User', 'Full Update Support'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors">
          {KHMER_TEXT.nav.home}
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-white transition-colors">
          {KHMER_TEXT.nav.products}
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.category?.slug}`}
          className="hover:text-white transition-colors"
        >
          {product.category?.nameKm}
        </Link>
        <span>/</span>
        <span className="text-slate-200 truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Main Product Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Product Media Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card rounded-3xl overflow-hidden aspect-[4/3] relative border border-slate-800 p-2">
            <img
              src={product.images}
              alt={product.name}
              className="w-full h-full object-cover rounded-2xl shadow-2xl"
            />
            {product.discountPercent && product.discountPercent > 0 && (
              <div className="absolute top-5 left-5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                បញ្ចុះតម្លៃ {product.discountPercent}%
              </div>
            )}
          </div>

          {/* Quick Security Badges */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-dark-850 border border-slate-800 flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-yellow-400" />
              <div>
                <p className="font-bold text-white">ផ្ញើជូនភ្លាមៗ</p>
                <p className="text-[10px] text-slate-400">ស្វ័យប្រវត្តិ 24/7</p>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-dark-850 border border-slate-800 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-bold text-white">ធានា 100%</p>
                <p className="text-[10px] text-slate-400">Activate ជោគជ័យ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Product Details & Purchase Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                {product.category?.nameKm}
              </span>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> {KHMER_TEXT.stockStatus.inStock}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              {product.name}
            </h1>

            {/* Ratings & Sold */}
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-300">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({product.reviewCount} ការវាយតម្លៃ)</span>
              </div>
              <span>•</span>
              <span className="text-slate-300 font-medium">{product.soldCount} នាក់បានទិញរួចរាល់</span>
            </div>
          </div>

          {/* Price Block */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-dark-850 to-dark-900 border border-slate-800 space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-white">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-base text-slate-400 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              ប្រហាក់ប្រហែល {formatPriceRiel(product.price)} (ទូទាត់តាម KHQR, ABA, Wing ឬ Card)
            </p>
          </div>

          {/* Action Buttons (Add to Cart, Buy Now) */}
          <ProductActionButtons product={product as any} />

          {/* Attached File Highlight Box */}
          {(product.file || product.fileId || product.downloadUrl) && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-lg shadow-emerald-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs uppercase border border-emerald-500/30">
                  {product.file?.fileType || 'EXE'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">
                    រួមបញ្ចូល File ដំឡើង Software (.EXE) ស្រាប់
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    {product.file?.title || product.name} {product.file?.fileSize ? `(${product.file.fileSize})` : ''} • ទាញយកបានភ្លាមៗក្រោយទូទាត់
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap hidden sm:inline-block">
                Instant Download
              </span>
            </div>
          )}

          {/* Spec Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-dark-850/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ប្រព័ន្ធគាំទ្រ (Platform)</span>
              <span className="font-bold text-white">{product.platform || 'Windows 10 / 11'}</span>
            </div>
            <div className="p-3 rounded-xl bg-dark-850/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ជំនាន់ (Version)</span>
              <span className="font-bold text-white">{product.version || 'Latest Build'}</span>
            </div>
            <div className="p-3 rounded-xl bg-dark-850/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">អាជ្ញាប័ណ្ណ (License)</span>
              <span className="font-bold text-white">Lifetime Activation</span>
            </div>
          </div>

          {/* Features Checklist */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              មុខងារសំខាន់ៗ (Features)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {featuresList.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Description & Requirements Tabs */}
      <div className="pt-8 border-t border-slate-800 space-y-6">
        <h3 className="text-xl font-bold text-white">ព័ត៌មានលម្អិត និងតម្រូវការប្រព័ន្ធ</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
              <FileText className="w-4 h-4" /> ការពិពណ៌នាផលិតផល
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> តម្រូវការប្រព័ន្ធ (System Requirements)
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {product.systemRequirements || 'Windows 10/11 64-bit, 4GB RAM, Internet connection for activation.'}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <ProductReviews
        productId={product.id}
        initialReviews={product.reviews as any}
      />
    </div>
  );
}

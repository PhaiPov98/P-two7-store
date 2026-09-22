'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ShoppingBag, Zap, ShieldCheck, Check, Tag } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice, formatPriceRiel, KHMER_TEXT } from '@/lib/translations';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { info } = useToast();
  const router = useRouter();
  const [isAdded, setIsAdded] = useState(false);

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Paid products require login, free products do not
    if (product.price > 0 && !user) {
      info('សូមចូលគណនីជាមុនសិន', 'ដើម្បីទិញផលិតផលនេះ សូមចូលគណនីរបស់អ្នក');
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images,
        categoryName: product.category?.nameKm,
      }, 1);
      router.push(`/login?redirect=${encodeURIComponent('/checkout')}`);
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images,
      categoryName: product.category?.nameKm,
    }, 1);
    router.push('/checkout');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images,
      categoryName: product.category?.nameKm,
    }, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group relative border border-slate-800 hover:border-blue-500/40 transition-all duration-300">
      {/* Top Badges Bar: Discount & Instant Delivery (Never Overlap) */}
      <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 right-2 sm:right-2.5 z-10 flex items-center justify-between gap-1.5 pointer-events-none">
        {product.discountPercent && product.discountPercent > 0 ? (
          <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-md shadow-red-500/30 flex items-center gap-0.5 sm:gap-1 shrink-0">
            <Tag className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
            <span>-{product.discountPercent}%</span>
          </div>
        ) : (
          <div />
        )}

        <div className="bg-dark-900/90 backdrop-blur-md border border-blue-500/30 text-blue-300 text-[10px] sm:text-[11px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1 shrink-0 shadow-md">
          <Zap className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-yellow-400 fill-yellow-400 shrink-0" />
          <span>
            <span className="hidden sm:inline">ផ្តល់ជូន</span>ភ្លាមៗ
          </span>
        </div>
      </div>

      {/* Image Area */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-dark-850">
        <img
          src={product.images}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-80" />
      </Link>

      {/* Card Content */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1.5 sm:mb-2 gap-1">
            <span className="text-blue-400 font-medium bg-blue-500/10 px-1.5 sm:px-2 py-0.5 rounded border border-blue-500/20 truncate max-w-[85px] xs:max-w-[100px] sm:max-w-none">
              {product.category?.nameKm || 'Software'}
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-semibold shrink-0">
              <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-slate-400 text-[9px] sm:text-[11px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/products/${product.slug}`} className="block group-hover:text-blue-400 transition-colors">
            <h3 className="font-bold text-xs sm:text-base text-white line-clamp-2 leading-relaxed min-h-[2.4rem] sm:min-h-0">
              {product.name}
            </h3>
          </Link>

          {/* Short Description (Hidden on compact mobile for clean app look, visible on desktop) */}
          <p className="hidden sm:block text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.shortDesc || product.description}
          </p>

          {/* Sold count & Stock */}
          <div className="flex items-center gap-1.5 sm:gap-3 mt-1.5 sm:mt-3 text-[10px] sm:text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium shrink-0">
              <ShieldCheck className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              {KHMER_TEXT.stockStatus.inStock}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="truncate hidden sm:inline">{product.soldCount} នាក់បានទិញ</span>
          </div>
        </div>

        {/* Pricing & Buttons */}
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-800/80">
          <div className="flex items-baseline justify-between mb-2 sm:mb-3">
            <div>
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-xl font-black text-white">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[11px] text-slate-400 block">
                {formatPriceRiel(product.price)}
              </span>
            </div>

            {(product.file || product.fileId || product.downloadUrl) ? (
              <span className="text-[9px] sm:text-[10px] font-bold text-teal-300 bg-teal-500/15 px-1.5 sm:px-2 py-0.5 rounded border border-teal-500/30 shrink-0">
                Key + File
              </span>
            ) : (
              <span className="text-[9px] sm:text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                License
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5">
            <button
              onClick={handleAddToCart}
              title={KHMER_TEXT.actions.addToCart}
              aria-label={KHMER_TEXT.actions.addToCart}
              className={`h-8 sm:h-9 px-2 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 shrink-0 sm:flex-1 cursor-pointer ${
                isAdded
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-blue-500/10 hover:bg-blue-500/20 active:scale-95 text-blue-400 border border-blue-500/30 hover:border-blue-500/50'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-400 shrink-0 animate-in zoom-in" />
                  <span className="hidden sm:inline whitespace-nowrap text-emerald-400">បានបន្ថែម</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-blue-400 shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">{KHMER_TEXT.actions.addToCart}</span>
                </>
              )}
            </button>
            <button
              onClick={handleBuyNow}
              className="btn-uiverse-buy h-8 sm:h-9 px-2 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs flex-1 flex items-center justify-center gap-1 font-bold whitespace-nowrap active:scale-95 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-green-400 shrink-0" />
              <span className="whitespace-nowrap">{KHMER_TEXT.actions.buyNow}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

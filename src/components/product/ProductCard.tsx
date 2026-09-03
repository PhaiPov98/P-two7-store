'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ShoppingBag, Zap, ShieldCheck, Check, Tag } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPrice, formatPriceRiel, KHMER_TEXT } from '@/lib/translations';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group relative border border-slate-800 hover:border-blue-500/40 transition-all duration-300">
      {/* Discount Badge */}
      {product.discountPercent && product.discountPercent > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-lg shadow-red-500/30 flex items-center gap-1">
          <Tag className="w-3 h-3" />
          -{product.discountPercent}%
        </div>
      )}

      {/* Instant Delivery Badge */}
      <div className="absolute top-3 right-3 z-10 bg-dark-900/80 backdrop-blur-md border border-blue-500/30 text-blue-400 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
        <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        {KHMER_TEXT.badges.instantDelivery}
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
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1.5 sm:mb-2">
            <span className="text-blue-400 font-medium bg-blue-500/10 px-1.5 sm:px-2 py-0.5 rounded border border-blue-500/20 truncate max-w-[90px] sm:max-w-none">
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
            <h3 className="font-bold text-xs sm:text-base text-white line-clamp-2 leading-snug min-h-[2.4rem] sm:min-h-0">
              {product.name}
            </h3>
          </Link>

          {/* Short Description (Hidden on compact mobile for clean app look, visible on desktop) */}
          <p className="hidden sm:block text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.shortDesc || product.description}
          </p>

          {/* Sold count & Stock */}
          <div className="flex items-center gap-1.5 sm:gap-3 mt-2 sm:mt-3 text-[10px] sm:text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium shrink-0">
              <ShieldCheck className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              {KHMER_TEXT.stockStatus.inStock}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="truncate hidden sm:inline">{product.soldCount} នាក់បានទិញ</span>
          </div>
        </div>

        {/* Pricing & Buttons */}
        <div className="mt-3 sm:mt-5 pt-2 sm:pt-4 border-t border-slate-800/80">
          <div className="flex items-baseline justify-between mb-2.5 sm:mb-4">
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

          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-1">
            <button
              onClick={handleAddToCart}
              className="btn-uiverse-df-cart py-1.5 sm:py-2.5 px-1.5 sm:px-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs flex items-center justify-center gap-1"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">{KHMER_TEXT.actions.addToCart}</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="btn-uiverse-buy py-1.5 sm:py-2.5 px-1.5 sm:px-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs flex items-center justify-center gap-1"
            >
              <Zap className="w-3 h-3 text-green-400 shrink-0" />
              <span className="truncate">{KHMER_TEXT.actions.buyNow}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

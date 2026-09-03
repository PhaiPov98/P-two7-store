'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Zap, Minus, Plus } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { KHMER_TEXT } from '@/lib/translations';

export default function ProductActionButtons({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    addToCart(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images,
        categoryName: product.category?.nameKm,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    addToCart(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images,
        categoryName: product.category?.nameKm,
      },
      quantity
    );
    router.push('/checkout');
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-300">ចំនួន (Quantity):</span>
        <div className="flex items-center rounded-xl bg-dark-850 border border-slate-700 p-1">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-1.5 rounded-lg hover:bg-dark-700 text-slate-400 hover:text-white transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-10 text-center text-xs font-bold text-white font-mono">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="p-1.5 rounded-lg hover:bg-dark-700 text-slate-400 hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleAddToCart}
          className="btn-uiverse-df-cart py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-5 h-5 text-blue-400" />
          <span>{KHMER_TEXT.actions.addToCart}</span>
        </button>
        <button
          onClick={handleBuyNow}
          className="btn-uiverse-buy py-3.5 px-6 rounded-2xl"
        >
          <Zap className="w-4 h-4 text-green-400" />
          <span>{KHMER_TEXT.actions.buyNow}</span>
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, SlidersHorizontal, KeyRound, BadgePercent, Check, X, RotateCcw } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { Product, Category } from '@/types';
import { KHMER_TEXT } from '@/lib/translations';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category') || 'ALL';
  const initialSearch = searchParams?.get('search') || '';
  const initialDiscount = searchParams?.get('discount') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>('latest');
  const [onlyDiscount, setOnlyDiscount] = useState<boolean>(initialDiscount);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(100);

  // Fetch products and categories
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [resProd, resCat] = await Promise.all([
          fetch('/api/products/public'),
          fetch('/api/admin/categories'),
        ]);

        if (resProd.ok) {
          const data = await resProd.json();
          setProducts(data.products || []);
        }
        if (resCat.ok) {
          const data = await resCat.json();
          setCategories(data.categories || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Sync search param changes
  useEffect(() => {
    if (!searchParams) return;
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('search');
    if (q) setSearchQuery(q);
    const disc = searchParams.get('discount');
    if (disc === 'true') setOnlyDiscount(true);
  }, [searchParams]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category
        if (selectedCategory !== 'ALL' && p.category?.slug !== selectedCategory) {
          return false;
        }
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q) || false;
          const matchCat = p.category?.nameKm?.toLowerCase().includes(q) || false;
          if (!matchName && !matchDesc && !matchCat) return false;
        }
        // Discount
        if (onlyDiscount && (!p.discountPercent || p.discountPercent <= 0)) {
          return false;
        }
        // In Stock
        if (onlyInStock && p.stockCount <= 0) {
          return false;
        }
        // Max Price
        if (p.price > maxPrice) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'popular') return b.soldCount - a.soldCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, selectedCategory, searchQuery, sortBy, onlyDiscount, onlyInStock, maxPrice]);

  const resetFilters = () => {
    setSelectedCategory('ALL');
    setSearchQuery('');
    setSortBy('latest');
    setOnlyDiscount(false);
    setOnlyInStock(false);
    setMaxPrice(100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-black text-white">ផលិតផលទាំងអស់</h1>
        </div>

        {/* Live Search Bar */}
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={KHMER_TEXT.nav.searchPlaceholder}
            className="w-full bg-dark-850 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                <span>តម្រងស្វែងរក</span>
              </div>
              <button
                onClick={resetFilters}
                className="text-[11px] text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> កំណត់ឡើងវិញ
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                ប្រភេទផលិតផល
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`btn-uiverse-swipe-cat ${
                    selectedCategory === 'ALL' ? 'active' : ''
                  }`}
                >
                  <span className="cat-name">
                    <span>ទាំងអស់ (All Categories)</span>
                  </span>
                  <span className="cat-badge">
                    {products.length}
                  </span>
                </button>
                {categories
                  .filter((c) => c.slug !== 'digital-files-tools')
                  .map((cat) => {
                    const count = products.filter((p) => p.category?.slug === cat.slug).length;
                    const isSelected = selectedCategory === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`btn-uiverse-swipe-cat ${
                          isSelected ? 'active' : ''
                        }`}
                      >
                        <span className="cat-name">
                          <span>{cat.nameKm}</span>
                        </span>
                        <span className="cat-badge">
                          {count}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-300">តម្លៃអតិបរមា</span>
                <span className="text-blue-400 font-bold font-mono">${maxPrice}</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="1"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>$5</span>
                <span>$100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Sort & Count Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-dark-900 border border-slate-800">
            <p className="text-xs text-slate-300">
              បង្ហាញ <strong className="text-white font-bold">{filteredProducts.length}</strong> ផលិតផល
            </p>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">តម្រៀបតាម:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-dark-850 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="latest">{KHMER_TEXT.sort.latest}</option>
                <option value="price-asc">{KHMER_TEXT.sort.priceLowHigh}</option>
                <option value="price-desc">{KHMER_TEXT.sort.priceHighLow}</option>
                <option value="popular">{KHMER_TEXT.sort.popular}</option>
              </select>
            </div>
          </div>

          {/* Loading or Empty State */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-dark-900 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-dark-900/50 rounded-2xl border border-dashed border-slate-800">
              <KeyRound className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">រកមិនឃើញផលិតផលទេ</h3>
              <p className="text-xs text-slate-400 mt-1">សូមព្យាយាមផ្លាស់ប្តូរពាក្យស្វែងរក ឬដោះតម្រងចេញ</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
              >
                កំណត់ឡើងវិញ
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">កំពុងផ្ទុក...</div>}>
      <ProductsContent />
    </Suspense>
  );
}


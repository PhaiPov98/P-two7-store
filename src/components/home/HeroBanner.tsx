'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  ChevronLeft,
  ChevronRight,
  Users,
  Star,
} from 'lucide-react';
import { KHMER_TEXT } from '@/lib/translations';

interface SlideItem {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  badge?: string;
}

export interface HeroStats {
  totalCustomers: number;
  avgRating: string;
  totalReviews: number;
}

interface HeroBannerProps {
  stats?: HeroStats;
}

const DEFAULT_SLIDES: SlideItem[] = [
  {
    id: '1',
    image: '/hero-slide-1.jpg',
    title: 'Windows 11 & Office 365',
    subtitle: 'Product Key ស្របច្បាប់ ១០០% Activate ពេញមួយជីវិត ផ្ញើជូនភ្លាមៗ 24/7។',
    badge: '🔥 HOT RELEASE • GENUINE LICENSE',
  },
  {
    id: '2',
    image: '/hero-slide-2.jpg',
    title: 'Adobe Creative Suite',
    subtitle: 'កម្មវិធីឌីហ្សាញអាជីព Photoshop, Premiere Pro, Illustrator ជាមួយ AI។',
    badge: '🎨 CREATIVE SUITE • FULL APPS',
  },
  {
    id: '3',
    image: '/hero-slide-3.jpg',
    title: 'Cybersecurity & Tools',
    subtitle: 'ការពារទិន្នន័យ និងកុំព្យូទ័ររបស់អ្នកដោយសុវត្ថិភាពខ្ពស់កម្រិតស្តង់ដារ។',
    badge: '🛡️ MAXIMUM SECURITY • 24/7 PROTECTION',
  },
];

const DEFAULT_TICKER =
  'ទិញ Product Key និងទាញយក Software & Tools បានភ្លាមៗ និងងាយស្រួល។ ធានាគុណភាពស្របច្បាប់ 100% ដំណើរការទូទាត់រហ័សតាម Bakong KHQR និងប្រព័ន្ធផ្ញើជូន Product Key ស្វ័យប្រវត្តភ្លាមៗ 24/7។';

const SLIDE_DURATION = 4000;

export default function HeroBanner({ stats }: HeroBannerProps) {
  const [slides, setSlides] = useState<SlideItem[]>(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ticker, setTicker] = useState(DEFAULT_TICKER);

  useEffect(() => {
    async function loadData() {
      try {
        const [resBanners, resSettings] = await Promise.all([
          fetch('/api/banners/public'),
          fetch('/api/settings/public'),
        ]);

        if (resBanners.ok) {
          const d = await resBanners.json();
          if (d.banners && d.banners.length > 0) {
            const merged = d.banners.map((b: any, idx: number) => ({
              id: b.id || String(idx + 1),
              image: b.image || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].image,
              title: b.title || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].title,
              subtitle:
                DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length]?.subtitle ||
                'ទិញ License Key ស្របច្បាប់ ផ្ញើជូនភ្លាមៗ 24/7។',
              badge:
                DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length]?.badge ||
                '⚡ GENUINE SOFTWARE & KEYS',
            }));
            setSlides(merged);
          }
        }

        if (resSettings.ok) {
          const s = await resSettings.json();
          if (s.settings?.hero_ticker_text) {
            setTicker(s.settings.hero_ticker_text);
          }
        }
      } catch (e) {
        console.error('Failed to load hero data:', e);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    slides.forEach((slide) => {
      if (slide.image) {
        const img = new Image();
        img.src = slide.image;
      }
    });
  }, [slides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlide = slides[currentIndex] || slides[0] || DEFAULT_SLIDES[0];

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4 space-y-3 sm:space-y-4 select-none">
      {/* 1. CAROUSEL BANNER CARD */}
      <div className="relative w-full h-[230px] sm:h-[340px] md:h-[420px] lg:h-[480px] rounded-2xl sm:rounded-3xl overflow-hidden border border-cyan-500/25 shadow-xl bg-dark-950 flex items-center">
        {/* SLIDE IMAGES */}
        {slides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none -z-10'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center"
              draggable={false}
              loading="eager"
            />
          </div>
        ))}

        {/* GRADIENT OVERLAYS */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/95 via-dark-950/60 to-dark-950/30 sm:bg-gradient-to-r sm:from-dark-950/95 sm:via-dark-950/60 sm:to-transparent pointer-events-none z-10" />

        {/* CONTENT */}
        <div className="relative z-20 px-4 py-3 sm:p-8 lg:p-12 w-full max-w-2xl space-y-2 sm:space-y-4 pb-6 sm:pb-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-cyan-500/25 border border-cyan-400/50 backdrop-blur-md shadow-md shadow-cyan-950/40">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-cyan-300 tracking-wide uppercase truncate max-w-[220px] sm:max-w-none">
              {currentSlide.badge || '✨ GENUINE LICENSE • 24/7'}
            </span>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
                {currentSlide.title}
              </span>
            </h1>
            <p className="hidden sm:block text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2 leading-relaxed drop-shadow-md">
              {currentSlide.subtitle}
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-0.5 sm:pt-1">
            <Link
              href="/products"
              prefetch={true}
              className="btn-uiverse-buy px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg"
            >
              <Zap className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-400" />
              <span>{KHMER_TEXT.actions.buyNow}</span>
            </Link>
          </div>
        </div>

        {/* DESKTOP PREV / NEXT ARROWS */}
        <div className="hidden sm:flex absolute bottom-6 right-6 z-30 items-center gap-2">
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-full bg-dark-900/80 border border-slate-700 text-white hover:bg-blue-600 hover:border-blue-500 flex items-center justify-center transition-all shadow backdrop-blur-md"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-8 h-8 rounded-full bg-dark-900/80 border border-slate-700 text-white hover:bg-blue-600 hover:border-blue-500 flex items-center justify-center transition-all shadow backdrop-blur-md"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* SLIDE DOT INDICATORS */}
        <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-5 bg-cyan-400 shadow-md shadow-cyan-400/50' : 'w-1.5 bg-slate-600/80 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. DYNAMIC REAL-TIME TRUST STATS BAR */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 p-2 sm:p-3.5 rounded-2xl bg-dark-900/70 border border-slate-800/80 backdrop-blur-xl shadow-lg text-center">
        {/* Item 1: Real Customer Purchases */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Users className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </div>
          <div className="text-left">
            <p className="text-xs sm:text-sm font-black text-white font-mono leading-tight">
              {stats?.totalCustomers ? stats.totalCustomers.toLocaleString() : '0'}
            </p>
            <p className="text-[9px] sm:text-xs text-slate-400 leading-tight truncate">អតិថិជនបានទិញ</p>
          </div>
        </div>

        {/* Item 2: Auto Key Delivery */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 border-x border-slate-800/80 px-1">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Zap className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </div>
          <div className="text-left">
            <p className="text-xs sm:text-sm font-black text-emerald-400 font-mono leading-tight">&lt; 10s</p>
            <p className="text-[9px] sm:text-xs text-slate-400 leading-tight truncate">ផ្ញើ Key ស្វ័យប្រវត្តិ</p>
          </div>
        </div>

        {/* Item 3: Real Average Rating */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Star className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-amber-400" />
          </div>
          <div className="text-left">
            <p className="text-xs sm:text-sm font-black text-amber-400 font-mono leading-tight">
              {stats?.totalReviews && stats.totalReviews > 0 ? `${stats.avgRating} / 5.0` : '0.0 / 5.0'}
            </p>
            <p className="text-[9px] sm:text-xs text-slate-400 leading-tight truncate">
              {stats?.totalReviews && stats.totalReviews > 0 ? `ការវាយតម្លៃ (${stats.totalReviews})` : '0 ការវាយតម្លៃ'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. TICKER MARQUEE */}
      <div className="p-2 sm:p-2.5 rounded-xl bg-dark-950/80 border border-slate-800/60 overflow-hidden relative">
        <div className="scrolling-ticker-wrapper">
          <div className="scrolling-ticker-track text-[11px] sm:text-xs text-slate-300 font-medium whitespace-nowrap">
            <span className="flex items-center gap-2">{ticker}</span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-2">{ticker}</span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-2">{ticker}</span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-2">{ticker}</span>
            <span className="text-slate-500">•</span>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Star,
  Users,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { KHMER_TEXT } from '@/lib/translations';

interface SlideItem {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  badge?: string;
}

const DEFAULT_SLIDES: SlideItem[] = [
  {
    id: '1',
    image: '/hero-slide-1.jpg',
    title: 'Windows 11 & Office 365',
    subtitle: 'Product Key ស្របច្បាប់ ១០០% ដំណើរការ Activate ពេញមួយជីវិត ផ្ញើជូនភ្លាមៗ 24/7។',
    badge: '🔥 HOT RELEASE • GENUINE LICENSE',
  },
  {
    id: '2',
    image: '/hero-slide-2.jpg',
    title: 'Adobe Creative Suite',
    subtitle: 'កម្មវិធីឌីហ្សាញអាជីព Photoshop, Premiere Pro, Illustrator ជាមួយ AI Firefly។',
    badge: '🎨 CREATIVE SUITE • FULL APPS',
  },
  {
    id: '3',
    image: '/hero-slide-3.jpg',
    title: 'Cybersecurity & Tools',
    subtitle: 'ការពារទិន្នន័យ និងកុំព្យូទ័ររបស់អ្នកដោយសុវត្ថិភាពខ្ពស់កម្រិតស្តង់ដារអន្តរជាតិ។',
    badge: '🛡️ MAXIMUM SECURITY • 24/7 PROTECTION',
  },
];

const DEFAULT_TICKER =
  'ទិញ Product Key និងទាញយក Software & Tools បានភ្លាមៗ និងងាយស្រួល។ ធានាគុណភាពស្របច្បាប់ 100% ដំណើរការទូទាត់រហ័សតាម Bakong KHQR និងប្រព័ន្ធផ្ញើជូន Product Key ស្វ័យប្រវត្តភ្លាមៗ 24/7។';

const SLIDE_DURATION = 4000; // 4 seconds auto-slide

// Customer avatar samples for the social proof counter
const CUSTOMER_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&auto=format&fit=crop&q=80',
];

export default function HeroBanner() {
  const [slides, setSlides] = useState<SlideItem[]>(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ticker, setTicker] = useState(DEFAULT_TICKER);

  // Fetch dynamic banners & settings from API
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

  // Preload all slide images immediately into memory so transitions are instant
  useEffect(() => {
    slides.forEach((slide) => {
      if (slide.image) {
        const img = new Image();
        img.src = slide.image;
      }
    });
  }, [slides]);

  // Slide Auto-Rotation Timer (Runs reliably every 4 seconds)
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

  const handleSelectSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  const currentSlide = slides[currentIndex] || slides[0] || DEFAULT_SLIDES[0];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 select-none">
      {/* MAIN CAROUSEL CONTAINER */}
      <div className="relative w-full min-h-[500px] sm:min-h-[540px] lg:min-h-[580px] rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_0_60px_-15px_rgba(6,182,212,0.35)] flex items-center group bg-dark-950">
        {/* BACKGROUND SLIDES WITH INSTANT PRELOADED TRANSITIONS */}
        {slides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
              idx === currentIndex
                ? 'opacity-100 z-0'
                : 'opacity-0 pointer-events-none -z-10'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-right lg:object-center select-none"
              draggable={false}
              loading="eager"
            />
          </div>
        ))}

        {/* CINEMATIC GRADIENT OVERLAYS (Left dark for text, Right bright for art) */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/95 via-dark-950/50 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-transparent to-dark-950/30 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-purple-600/15 pointer-events-none z-10" />

        {/* FLOATING CONTENT OVER SLIDE */}
        <div className="relative z-20 px-6 sm:px-10 lg:px-14 py-10 max-w-3xl space-y-6">
          {/* Top Glowing Store Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-purple-500/20 border border-cyan-400/40 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-cyan-300 tracking-wide uppercase">
              {currentSlide.badge || '✨ ផ្លូវការ & ទំនុកចិត្តខ្ពស់ • 24/7 Auto Delivery'}
            </span>
          </div>

          {/* Main 3D Headline */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-2xl">
              <span className="bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent filter drop-shadow-[0_4px_24px_rgba(56,189,248,0.4)]">
                P-Two7 Store
              </span>
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <Link
              href="/products"
              prefetch={true}
              className="btn-uiverse-buy px-8 py-4 rounded-2xl text-white font-black text-sm sm:text-base tracking-wide shadow-xl shadow-green-950/40 cursor-pointer"
            >
              <Zap className="w-5 h-5 text-green-400 animate-pulse" />
              <span>{KHMER_TEXT.actions.buyNow}</span>
            </Link>
          </div>

          {/* OPTION 4: LIVE COMMUNITY & TRUST STATS (3 GLASS COUNTER BADGES) */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
            {/* Stat 1: Customers Counter with Avatar Stack */}
            <div className="p-3 rounded-2xl bg-dark-950/70 border border-slate-800/80 backdrop-blur-xl shadow-lg flex items-center gap-3 hover:border-cyan-500/40 transition-all">
              <div className="flex -space-x-2 shrink-0">
                {CUSTOMER_AVATARS.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Customer"
                    className="w-7 h-7 rounded-full border-2 border-dark-950 object-cover shadow"
                  />
                ))}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white">1,500+</p>
                <p className="text-[10px] text-slate-400 truncate">អតិថិជនបានទិញ</p>
              </div>
            </div>

            {/* Stat 2: Instant Auto Delivery Speed */}
            <div className="p-3 rounded-2xl bg-dark-950/70 border border-slate-800/80 backdrop-blur-xl shadow-lg flex items-center gap-3 hover:border-emerald-500/40 transition-all">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Zap className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-emerald-400">&lt; 10 វិនាទី</p>
                <p className="text-[10px] text-slate-400 truncate">ផ្ញើ Key ស្វ័យប្រវត្តិ</p>
              </div>
            </div>

            {/* Stat 3: 4.9/5 Star Ratings */}
            <div className="p-3 rounded-2xl bg-dark-950/70 border border-slate-800/80 backdrop-blur-xl shadow-lg flex items-center gap-3 hover:border-amber-500/40 transition-all">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-amber-400">4.9 / 5.0</p>
                <p className="text-[10px] text-slate-400 truncate">ការវាយតម្លៃផ្កាយ 5</p>
              </div>
            </div>
          </div>
        </div>

        {/* OPTION 5: NAVIGATION PREV & NEXT BUTTONS ([ < ] [ > ]) */}
        <div className="absolute top-6 right-6 z-30 flex items-center gap-2">
          <button
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="w-10 h-10 rounded-xl bg-dark-950/70 border border-slate-800/80 hover:border-cyan-400/50 hover:bg-dark-900 text-slate-300 hover:text-white backdrop-blur-md flex items-center justify-center transition-all shadow-lg active:scale-95 group/arrow cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover/arrow:-translate-x-0.5" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next Slide"
            className="w-10 h-10 rounded-xl bg-dark-950/70 border border-slate-800/80 hover:border-cyan-400/50 hover:bg-dark-900 text-slate-300 hover:text-white backdrop-blur-md flex items-center justify-center transition-all shadow-lg active:scale-95 group/arrow cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 transition-transform group-hover/arrow:translate-x-0.5" />
          </button>
        </div>

        {/* MINIMAL PAGINATION DOTS AT BOTTOM */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-950/70 border border-slate-800/80 backdrop-blur-md">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all rounded-full cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 h-1.5 bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                  : 'w-1.5 h-1.5 bg-slate-600 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* SMOOTH CONTINUOUS MARQUEE TICKER */}
      <div className="mt-4 p-2 sm:p-2.5 rounded-2xl bg-dark-900/80 border border-slate-800/80 backdrop-blur-xl flex items-center shadow-xl">
        <div className="scrolling-ticker-wrapper">
          <div className="scrolling-ticker-track">
            {[...Array(4)].map((_, i) => (
              <span
                key={i}
                className="text-xs sm:text-sm font-medium text-slate-200 flex items-center gap-3 shrink-0"
              >
                <span>{ticker}</span>
                <span className="text-cyan-400 font-black">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

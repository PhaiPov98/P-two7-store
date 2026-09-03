'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Boxes,
  Zap,
  Download,
  Wrench,
  BookOpen,
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileCode,
  HardDrive,
  Send,
  X,
  Layers,
  FileDown,
  ExternalLink,
  Cpu,
  Monitor,
} from 'lucide-react';
import FileCard from '@/components/file/FileCard';
import { DigitalFile, Tutorial } from '@/types';

function FreeHubContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') || 'all';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<DigitalFile[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState<Tutorial | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [filesRes, tutorialsRes] = await Promise.all([
          fetch('/api/files/public'),
          fetch('/api/tutorials'),
        ]);

        if (filesRes.ok) {
          const data = await filesRes.json();
          const allFiles: DigitalFile[] = data.files || [];
          setFiles(allFiles.filter((f) => f.isFree));
        }

        if (tutorialsRes.ok) {
          const tData = await tutorialsRes.json();
          setTutorials(tData.tutorials || []);
        }
      } catch (e) {
        console.error('Failed to load free files & tutorials:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter free files by tab and search query
  const filteredFiles = useMemo(() => {
    let result = files;

    if (activeTab === 'iso') {
      result = result.filter(
        (f) =>
          f.fileType.toLowerCase() === 'iso' ||
          f.title.toLowerCase().includes('windows') ||
          f.slug.toLowerCase().includes('windows')
      );
    } else if (activeTab === 'office') {
      result = result.filter(
        (f) =>
          f.title.toLowerCase().includes('office') ||
          f.slug.toLowerCase().includes('office')
      );
    } else if (activeTab === 'tools') {
      result = result.filter(
        (f) =>
          f.fileType.toLowerCase() !== 'iso' ||
          f.title.toLowerCase().includes('tool') ||
          f.title.toLowerCase().includes('winrar') ||
          f.title.toLowerCase().includes('activator')
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q) ||
          f.fileType.toLowerCase().includes(q)
      );
    }

    return result;
  }, [files, activeTab, searchQuery]);

  // Filter tutorials by search query
  const filteredTutorials = useMemo(() => {
    if (!searchQuery.trim()) return tutorials;
    const q = searchQuery.toLowerCase().trim();
    return tutorials.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );
  }, [tutorials, searchQuery]);

  // Parse steps of selected guide
  const selectedGuideSteps = useMemo(() => {
    if (!selectedGuide) return [];
    try {
      return typeof selectedGuide.steps === 'string'
        ? JSON.parse(selectedGuide.steps)
        : selectedGuide.steps;
    } catch (e) {
      return [selectedGuide.steps];
    }
  }, [selectedGuide]);

  const navTabs = [
    { id: 'all', label: 'ទាំងអស់ (All Free)', icon: Boxes, count: files.length },
    { id: 'iso', label: 'Windows ISOs', icon: HardDrive },
    { id: 'office', label: 'Office Installers', icon: FileCode },
    { id: 'tools', label: 'Tools & Utilities', icon: Wrench },
    { id: 'guides', label: 'មេរៀនដំឡើង', icon: BookOpen, count: tutorials.length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. 100% FREE SPOTLIGHT HERO */}
      <section className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-emerald-500/20 bg-gradient-to-b from-dark-900 via-dark-850 to-dark-950 shadow-2xl">
        {/* Glow effects */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-blue-600/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-5">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-snug">
            ទាញយកកម្មវិធី & ឯកសារ Free 100%
          </h1>
        </div>
      </section>

      {/* 2. SEARCH & TABS */}
      <section className="space-y-4">
        {/* Search Input - Lakshay-art Animated Border */}
        <div className="search-lakshay max-w-2xl mx-auto">
          <div className="border-white"></div>
          <div className="border-glow"></div>
          <div className="border-dark"></div>
          <div className="border-outer-glow"></div>
          <div className="pink-mask"></div>
          <div className="search-icon-wrap">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកឯកសារ Free, ISO, Tool, ឬមេរៀន..."
            className="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white z-10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Clean Filter Tabs - SelfMadeSystem Laser Animated Container */}
        <div className="flex items-center justify-center py-2">
          <div className="selfmade-nav">
            <div className="selfmade-container">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`selfmade-btn ${isActive ? 'selfmade-btn-active' : ''}`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-sky-400'}`} />
                    <span>{tab.label}</span>
                    {typeof tab.count === 'number' && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                          isActive ? 'bg-sky-950/80 text-white' : 'bg-dark-800 text-slate-400'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Animated Laser SVG Outline */}
              <svg
                className="selfmade-outline"
                overflow="visible"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  className="selfmade-rect"
                  pathLength="100"
                  x="0.5"
                  y="0.5"
                  width="99"
                  height="99"
                  rx="10"
                  ry="10"
                  fill="transparent"
                  strokeWidth="1.5"
                ></rect>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FREE FILES GRID */}
      {activeTab !== 'guides' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FileDown className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                បញ្ជីឯកសារ និងកម្មវិធី Free ({filteredFiles.length})
              </h2>
            </div>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              FREE 100%
            </span>
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-400 text-xs">កំពុងផ្ទុកឯកសារ Free...</div>
          ) : filteredFiles.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center text-slate-400 space-y-3 border border-slate-800">
              <FileDown className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">មិនមានឯកសារដែលត្រូវនឹងការស្វែងរករបស់អ្នកឡើយ</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                }}
                className="text-xs text-blue-400 hover:underline"
              >
                បង្ហាញឯកសារ Free ទាំងអស់
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFiles.map((file) => (
                <FileCard key={file.id} file={file as any} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. FREE GUIDES & INSTALLATION TUTORIALS (Dynamic from Database) */}
      {(activeTab === 'all' || activeTab === 'guides') && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                មេរៀនដំឡើង & ការណែនាំ (Free Tutorials) ({filteredTutorials.length})
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-slate-400 text-xs">កំពុងផ្ទុកមេរៀន...</div>
          ) : filteredTutorials.length === 0 ? (
            <div className="glass-card p-10 rounded-2xl text-center text-slate-400 border border-slate-800 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">មិនទាន់មានមេរៀនត្រូវគ្នានឹងការស្វែងរកនេះទេ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredTutorials.map((guide) => (
                <div
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide)}
                  className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                        {guide.category}
                      </span>
                      <span className="text-slate-400 text-[10px]">{guide.readTime || '3 នាទីអាន'}</span>
                    </div>

                    <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors leading-snug">
                      {guide.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                    <span className="text-[11px] text-slate-400">ចុចអានការណែនាំ</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Guide Detail Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card max-w-xl w-full rounded-2xl p-6 border border-slate-700 bg-dark-900 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {selectedGuide.category}
              </span>
              <button
                onClick={() => setSelectedGuide(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">{selectedGuide.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedGuide.description || 'ការណែនាំលម្អិតមួយជំហានម្តងៗ'}
              </p>
            </div>

            <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
              {selectedGuideSteps.map((step: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-dark-850 border border-slate-800 flex items-start gap-3 text-xs text-slate-200 leading-relaxed"
                >
                  <div className="w-5 h-5 rounded-md bg-emerald-600/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    {idx + 1}
                  </div>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: step.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>'),
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedGuide(null)}
                className="btn-uiverse-emerald px-6 py-2.5 rounded-xl text-xs font-bold"
              >
                យល់ព្រម
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FreeHubPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-slate-400">
          កំពុងផ្ទុក...
        </div>
      }
    >
      <FreeHubContent />
    </Suspense>
  );
}

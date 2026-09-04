'use client';

import React, { useState, useMemo } from 'react';
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

interface FreeSoftwareClientProps {
  initialFiles: any[];
  initialTutorials: any[];
}

export default function FreeSoftwareClient({
  initialFiles,
  initialTutorials,
}: FreeSoftwareClientProps) {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') || 'all';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<Tutorial | null>(null);

  const [files, setFiles] = useState<DigitalFile[]>(initialFiles);
  const [tutorials, setTutorials] = useState<Tutorial[]>(initialTutorials);

  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  useEffect(() => {
    async function syncLatest() {
      try {
        const res = await fetch(`/api/files/public?_t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const d = await res.json();
          if (d.files && Array.isArray(d.files)) {
            setFiles(d.files.filter((f: any) => f.isFree));
          }
        }
      } catch (e) {
        // Fallback to initialFiles
      }
    }
    syncLatest();
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
        (f) => f.fileType.toLowerCase() !== 'iso'
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
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            មជ្ឈមណ្ឌលចែករំលែក Software ដើម, Windows Clean ISOs, Office Installers,
            និងឧបករណ៍ចាំបាច់នានា ផ្តល់ជូនដោយឥតគិតថ្លៃ គ្មានមេរោគ 100% Clean & Safe។
          </p>
        </div>
      </section>

      {/* 2. SEARCH & TABS */}
      <section className="space-y-4">
        {/* Search Input */}
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

        {/* Clean Filter Tabs */}
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

          {filteredFiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFiles.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center text-slate-400 border border-slate-800 space-y-3">
              <FileDown className="w-10 h-10 mx-auto text-slate-600" />
              <p className="font-bold text-slate-300">មិនមានឯកសារដែលត្រូវនឹងការស្វែងរករបស់អ្នកឡើយ</p>
              <button
                onClick={() => {
                  setActiveTab('all');
                  setSearchQuery('');
                }}
                className="text-xs text-blue-400 hover:text-blue-300 underline font-medium"
              >
                បង្ហាញឯកសារ Free ទាំងអស់
              </button>
            </div>
          )}
        </section>
      )}

      {/* 4. TUTORIALS SECTION */}
      {(activeTab === 'all' || activeTab === 'guides') && (
        <section className="space-y-4 pt-4 border-t border-slate-800">
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

          {filteredTutorials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredTutorials.map((tut) => (
                <div
                  key={tut.id}
                  className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {tut.category}
                    </span>
                    <h3 className="font-bold text-base text-white">{tut.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {tut.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedGuide(tut)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span>អានការណែនាំលម្អិត</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {tut.videoUrl && (
                      <a
                        href={tut.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Video</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-10 text-center text-slate-400 border border-slate-800">
              <BookOpen className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs">មិនទាន់មានមេរៀនត្រូវតាមការស្វែងរកនេះទេ</p>
            </div>
          )}
        </section>
      )}

      {/* Guide Detail Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-slate-700 max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {selectedGuide.category}
                </span>
                <h3 className="font-black text-xl text-white mt-2">{selectedGuide.title}</h3>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">{selectedGuide.description}</p>

            {/* Steps list */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white">ជំហាននៃការអនុវត្ត៖</h4>
              <div className="space-y-2.5">
                {selectedGuideSteps.map((step: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-dark-850/80 border border-slate-800 text-xs text-slate-200 leading-relaxed flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedGuide(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
              >
                បិទផ្ទាំង (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

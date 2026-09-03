'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  ExternalLink,
  Upload,
  Layers,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [tickerText, setTickerText] = useState('');
  const [savingTicker, setSavingTicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    link: '/products',
    order: '1',
    isActive: true,
  });

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [resBanners, resSettings] = await Promise.all([
        fetch('/api/admin/banners'),
        fetch('/api/admin/settings'),
      ]);

      if (resBanners.ok) {
        const d = await resBanners.json();
        setBanners(d.banners || []);
      }

      if (resSettings.ok) {
        const s = await resSettings.json();
        setTickerText(s.settings?.hero_ticker_text || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tickerText.trim()) return;

    try {
      setSavingTicker(true);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'hero_ticker_text',
          value: tickerText.trim(),
        }),
      });

      if (res.ok) {
        success('បានរក្សាទុកអក្សររត់ជោគជ័យ!');
      } else {
        error('បរាជ័យក្នុងការរក្សាទុក');
      }
    } catch (err) {
      error('មានបញ្ហា');
    } finally {
      setSavingTicker(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      image: '',
      link: '/products',
      order: (banners.length + 1).toString(),
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (banner: any) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      image: banner.image,
      link: banner.link || '/products',
      order: banner.order?.toString() || '1',
      isActive: banner.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingBanner ? 'PUT' : 'POST';
      const payload = editingBanner ? { id: editingBanner.id, ...formData } : formData;

      const res = await fetch('/api/admin/banners', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        success(editingBanner ? 'បានកែសម្រួល Banner ជោគជ័យ!' : 'បានបន្ថែម Banner ថ្មីជោគជ័យ!');
        setShowModal(false);
        loadData();
      } else {
        const d = await res.json();
        error('បរាជ័យ', d.error || 'មានបញ្ហាក្នុងការរក្សាទុក');
      }
    } catch (err) {
      error('មានបញ្ហា');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`តើអ្នកពិតជាចង់លុប Banner "${title}" មែនទេ?`)) return;

    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        success('បានលុប Banner ជោគជ័យ!');
        loadData();
      } else {
        error('មិនអាចលុបបានទេ');
      }
    } catch (err) {
      error('មានបញ្ហា');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <span>គ្រប់គ្រង Banners (Hero 3D Slides)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            បន្ថែម និងកែសម្រួលផ្ទាំងរូបភាពរំកិលមានចលនា (Moving Background Slides) នៅលើទំព័រដើម
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-uiverse-primary px-4 py-2.5 rounded-xl text-xs font-bold w-fit flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>បន្ថែម Banner ថ្មី</span>
        </button>
      </div>

      {/* Announcement Ticker Settings Card */}
      <div className="glass-card p-5 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-dark-900 to-blue-950/20 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>អក្សររត់ផ្សព្វផ្សាយលើទំព័រដើម (Homepage Scrolling Ticker)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                កែសម្រួលខ្លឹមសារអក្សរដែលរត់មានចលនានៅខាងក្រោម Hero Banner
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveTicker} className="space-y-3">
          <textarea
            rows={2}
            value={tickerText}
            onChange={(e) => setTickerText(e.target.value)}
            placeholder="បញ្ចូលខ្លឹមសារអក្សររត់នៅទីនេះ..."
            className="w-full bg-dark-850 border border-slate-700/80 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
          />

          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500 font-mono">
              {tickerText.length} តួអក្សរ
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setTickerText(
                    'ទិញ Product Key និងទាញយក Software & Tools បានភ្លាមៗ និងងាយស្រួល។ ធានាគុណភាពស្របច្បាប់ 100% ដំណើរការទូទាត់រហ័សតាម Bakong KHQR និងប្រព័ន្ធផ្ញើជូន Product Key ស្វ័យប្រវត្តភ្លាមៗ 24/7។'
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 text-[11px] font-semibold transition-colors border border-slate-700/60"
              >
                កំណត់ជាលំនាំដើម (Default)
              </button>
              <button
                type="submit"
                disabled={savingTicker}
                className="btn-uiverse-primary px-5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{savingTicker ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកអក្សររត់'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Grid of Banners */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 rounded-3xl bg-dark-900 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-slate-800 space-y-3">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">មិនទាន់មាន Banner ទេ</h3>
          <p className="text-xs text-slate-400">
            ចុចប៊ូតុងខាងលើដើម្បីបន្ថែមរូបភាព Banner ដំបូងរបស់អ្នក។
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((b, idx) => (
            <div
              key={b.id}
              className="glass-card rounded-3xl overflow-hidden border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
            >
              {/* Preview Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-dark-950">
                <img
                  src={b.image}
                  alt={b.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-dark-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
                  Slide #{idx + 1}
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {b.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>

              {/* Info & Actions */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{b.title}</h3>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">{b.image}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400">លំដាប់: {b.order}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-blue-400 transition-colors"
                      title="កែសម្រួល"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id, b.title)}
                      className="p-1.5 rounded-lg bg-dark-800 hover:bg-red-950/40 text-red-400 transition-colors"
                      title="លុប"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card max-w-lg w-full rounded-3xl p-6 border border-slate-700 bg-dark-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">
                {editingBanner ? 'កែសម្រួល Banner' : 'បន្ថែម Banner ថ្មី'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">ចំណងជើងសម្គាល់ (Title / Tag) *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. Windows 11 & Office 365"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">រូបភាព (Image URL / Path) *</label>
                <input
                  type="text"
                  required
                  placeholder="/hero-slide-1.jpg ឬ https://..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  អាចដាក់ Link រូបភាពពីអ៊ីនធឺណិត (Unsplash, Cloud) ឬដាក់ `/hero-slide-1.jpg`
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">លំដាប់បង្ហាញ (Order)</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Link ចុចចូល (Target Link)</label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-cyan-600"
                  />
                  <span className="font-bold text-slate-200">Active (បើកដំណើរការបង្ហាញលើ Homepage)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-uiverse-secondary px-4 py-2 rounded-xl text-xs"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="btn-uiverse-primary px-6 py-2 rounded-xl text-xs font-bold"
                >
                  {editingBanner ? 'រក្សាទុក' : 'បន្ថែម'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, X, Edit2, Trash2, Tag, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [nameKm, setNameKm] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Folder');
  
  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const d = await res.json();
        setCategories(d.categories || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setNameKm('');
    setNameEn('');
    setSlug('');
    setDescription('');
    setIcon('Folder');
    setShowModal(true);
  };

  const openEditModal = (cat: any) => {
    setEditingId(cat.id);
    setNameKm(cat.nameKm);
    setNameEn(cat.nameEn);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Folder');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = Boolean(editingId);
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing
        ? { id: editingId, nameKm, nameEn, slug, description, icon }
        : { nameKm, nameEn, slug, description, icon };

      const res = await fetch('/api/admin/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const resData = await res.json();

      if (res.ok) {
        success(isEditing ? 'បានកែប្រែ Category ជោគជ័យ!' : 'បានបង្កើត Category ជោគជ័យ!');
        setShowModal(false);
        setEditingId(null);
        loadData();
      } else {
        error('បរាជ័យ', resData.error || 'មិនអាចរក្សាទុកបានទេ');
      }
    } catch (e) {
      error('មានបញ្ហា', 'សូមព្យាយាមម្តងទៀត');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`តើអ្នកពិតជាចង់លុប Category "${name}" មែនទេ?`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      });
      const resData = await res.json();

      if (res.ok) {
        success('ជោគជ័យ', 'បានលុប Category រួចរាល់');
        loadData();
      } else {
        error('មិនអាចលុបបានទេ', resData.error || 'មានបញ្ហា');
      }
    } catch (e) {
      error('មានបញ្ហា', 'សូមព្យាយាមម្តងទៀត');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-400" />
            <span>គ្រប់គ្រងប្រភេទផលិតផល (Categories)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            អ្នកអាច បង្កើត (Add), កែប្រែ (Edit), ឬ លុប (Delete) ប្រភេទផលិតផលដែលបង្ហាញនៅលើគេហទំព័រ
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-uiverse-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 w-fit shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>បន្ថែម Category ថ្មី</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">កំពុងផ្ទុកទិន្នន័យ...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl border border-slate-800 text-slate-400 text-sm">
          មិនទាន់មាន Category នៅឡើយទេ
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all space-y-3 relative group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-white">{cat.nameKm}</h3>
                  {cat.nameEn && cat.nameEn !== cat.nameKm && (
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{cat.nameEn}</p>
                  )}
                </div>
                <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md">
                  {cat.slug}
                </span>
              </div>

              {cat.description && (
                <p className="text-xs text-slate-400 line-clamp-2">{cat.description}</p>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="bg-slate-800/60 px-2 py-0.5 rounded text-[11px]">
                    {cat._count?.products || 0} ផលិតផល
                  </span>
                  <span className="bg-slate-800/60 px-2 py-0.5 rounded text-[11px]">
                    {cat._count?.files || 0} ឯកសារ
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-600/30 rounded-lg transition-colors"
                    title="កែប្រែ (Edit)"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.nameKm)}
                    className="p-1.5 text-red-400 hover:text-white hover:bg-red-600/30 rounded-lg transition-colors"
                    title="លុប (Delete)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-card max-w-md w-full rounded-3xl p-6 border border-slate-700 bg-dark-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-400" />
                <span>{editingId ? 'កែប្រែ Category' : 'បន្ថែម Category ថ្មី'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  ឈ្មោះជាភាសាខ្មែរ (Khmer Name) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nameKm}
                  onChange={(e) => setNameKm(e.target.value)}
                  placeholder="ឧ. កាត់វីដេអូ ឬ Windows Keys"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  ឈ្មោះជាភាសាអង់គ្លេស (English Name){' '}
                  <span className="text-slate-500 text-[11px] font-normal">(ស្រេចចិត្ត / Optional)</span>
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => {
                    setNameEn(e.target.value);
                    if (!editingId && e.target.value.trim()) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="ឧ. Video Editing (បើមិនដាក់ ប្រព័ន្ធនឹងយកតាមឈ្មោះខ្មែរ)"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Slug / URL ដំណភ្ជាប់{' '}
                  <span className="text-slate-500 text-[11px] font-normal">(ស្រេចចិត្ត / Optional)</span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ឧ. video-editing (ទុកទំនេរ ប្រព័ន្ធនឹងបង្កើត auto)"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">ការពិពណ៌នា (Description)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ព័ត៌មានលម្អិតអំពី Category នេះ..."
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-dark-850 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="btn-uiverse-primary px-6 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20"
                >
                  <span>{editingId ? 'រក្សាទុកការកែប្រែ' : 'បង្កើត Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

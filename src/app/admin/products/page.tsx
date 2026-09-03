'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  KeyRound,
  Eye,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { formatPrice } from '@/lib/translations';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDesc: '',
    price: '',
    comparePrice: '',
    discountPercent: '',
    images: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
    categoryId: '',
    version: '',
    platform: 'Windows (PC / Laptop)',
    systemRequirements: '',
    features: '',
    fileId: '',
    downloadUrl: '',
    isFeatured: false,
    isBestSeller: false,
    isActive: true,
  });

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [resProd, resCat, resFiles] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/files'),
      ]);
      if (resProd.ok) {
        const d = await resProd.json();
        setProducts(d.products || []);
      }
      if (resCat.ok) {
        const c = await resCat.json();
        setCategories(c.categories || []);
        if (c.categories?.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: c.categories[0].id }));
        }
      }
      if (resFiles.ok) {
        const f = await resFiles.json();
        setFiles(f.files || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      shortDesc: '',
      price: '',
      comparePrice: '',
      discountPercent: '',
      images: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
      categoryId: categories[0]?.id || '',
      version: 'Latest 2026',
      platform: 'Windows (PC / Laptop)',
      systemRequirements: 'Windows 10/11 64-bit, 4GB RAM',
      features: 'Lifetime License, 1 PC Activation, 100% Update Support',
      fileId: '',
      downloadUrl: '',
      isFeatured: false,
      isBestSeller: false,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDesc: product.shortDesc || '',
      price: product.price.toString(),
      comparePrice: product.comparePrice?.toString() || '',
      discountPercent: product.discountPercent?.toString() || '',
      images: product.images,
      categoryId: product.categoryId,
      version: product.version || '',
      platform: product.platform || '',
      systemRequirements: product.systemRequirements || '',
      features: product.features || '',
      fileId: product.fileId || '',
      downloadUrl: product.downloadUrl || '',
      isFeatured: product.isFeatured,
      isBestSeller: product.isBestSeller,
      isActive: product.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`តើអ្នកពិតជាចង់លុបផលិតផល "${name}" មែនទេ?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      const d = await res.json();
      if (res.ok) {
        success('បានលុបផលិតផលជោគជ័យ!');
        loadData();
      } else {
        error('មិនអាចលុបបានទេ', d.error || 'មានបញ្ហាក្នុងការលុប');
      }
    } catch (err) {
      error('មានបញ្ហា', 'សូមព្យាយាមម្តងទៀត');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const payload = editingProduct ? { id: editingProduct.id, ...formData } : formData;

      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        success(editingProduct ? 'បានកែសម្រួលផលិតផលជោគជ័យ!' : 'បានបន្ថែមផលិតផលថ្មីជោគជ័យ!');
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

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.nameKm.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">គ្រប់គ្រងផលិតផល (Products)</h1>
          <p className="text-xs text-slate-400 mt-0.5">បង្កើត កែសម្រួល តម្លៃ ស្តុក និងព័ត៌មាន Software</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-uiverse-primary px-4 py-2.5 rounded-xl text-xs font-bold w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>បន្ថែមផលិតផលថ្មី</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះ ឬប្រភេទ..."
            className="w-full bg-dark-850 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-400">សរុប: {filtered.length} ផលិតផល</span>
      </div>

      {/* Products Table */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 bg-dark-900 border-b border-slate-800">
              <tr>
                <th className="p-4">រូបភាព & ឈ្មោះផលិតផល</th>
                <th className="p-4">ប្រភេទ</th>
                <th className="p-4">តម្លៃ (Price)</th>
                <th className="p-4">Keys អាចប្រើបាន</th>
                <th className="p-4">បានលក់</th>
                <th className="p-4">ស្ថានភាព</th>
                <th className="p-4 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-dark-850/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={prod.images} alt={prod.name} className="w-10 h-10 rounded-xl object-cover bg-dark-850" />
                      <div>
                        <p className="font-bold text-white line-clamp-1">{prod.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">/{prod.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-blue-400 font-medium">{prod.category?.nameKm}</td>
                  <td className="p-4 font-mono font-bold text-white">{formatPrice(prod.price)}</td>
                  <td className="p-4 font-mono font-bold text-emerald-400">
                    {prod._count?.keys || 0} Keys
                  </td>
                  <td className="p-4 font-mono text-slate-300">{prod.soldCount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${prod.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {prod.isActive ? 'សកម្ម (Active)' : 'បានបិទ'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-blue-400 transition-colors"
                        title="កែសម្រួល"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id, prod.name)}
                        className="p-1.5 rounded-lg bg-dark-800 hover:bg-red-950/40 text-red-400 transition-colors"
                        title="លុប"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-card max-w-2xl w-full rounded-3xl p-6 border border-slate-700 bg-dark-900 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">
                {editingProduct ? 'កែសម្រួលផលិតផល' : 'បន្ថែមផលិតផលថ្មី'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">ឈ្មោះផលិតផល *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">ប្រភេទ (Category) *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameKm} ({c.nameEn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">តម្លៃ ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">តម្លៃចាស់ ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.comparePrice}
                    onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">បញ្ចុះតម្លៃ (%)</label>
                  <input
                    type="number"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">រូបភាព (Image URL)</label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">ការពិពណ៌នាសង្ខេប (Short Desc)</label>
                <input
                  type="text"
                  value={formData.shortDesc}
                  onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">ការពិពណ៌នាពេញលេញ (Description)</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Attached Download File Section */}
              <div className="p-3.5 rounded-2xl bg-dark-900 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>📦 ភ្ជាប់ឯកសារទាញយក (Download File / Setup .exe)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">ជម្រើសបន្ថែម (Optional)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      ជ្រើសរើស File ពីបញ្ជី Files (Files & Tools)
                    </label>
                    <select
                      value={formData.fileId}
                      onChange={(e) => setFormData({ ...formData, fileId: e.target.value })}
                      className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="">-- មិនភ្ជាប់ File --</option>
                      {files.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.title} ({f.fileType} - {f.fileSize})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      ឬដាក់ Link Cloud (Drive, Mega, etc.)
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={formData.downloadUrl}
                      onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                      className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">ជំនាន់ (Version)</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Platform</label>
                  <input
                    type="text"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Best Seller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Active</span>
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
                  {editingProduct ? 'រក្សាទុក' : 'បន្ថែម'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

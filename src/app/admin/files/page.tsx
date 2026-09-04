'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  FolderDown,
  Plus,
  Edit2,
  Trash2,
  X,
  Download,
  HardDrive,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  FileCode,
  FileArchive,
  Search,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { formatPrice } from '@/lib/translations';

export default function AdminFilesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFile, setEditingFile] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'upload' | 'link'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    version: '1.0',
    fileType: 'ZIP',
    fileSize: '10 MB',
    filePath: '',
    isFree: true,
    price: '0',
    changelog: '',
    requirements: '',
    categoryId: '',
    isActive: true,
  });

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [resFiles, resCat] = await Promise.all([
        fetch('/api/admin/files'),
        fetch('/api/admin/categories'),
      ]);
      if (resFiles.ok) {
        const d = await resFiles.json();
        setFiles(d.files || []);
      }
      if (resCat.ok) {
        const c = await resCat.json();
        const catList = c.categories || [];
        setCategories(catList);
        if (catList.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: catList[0].id }));
        }
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

  const openAddModal = () => {
    setEditingFile(null);
    setUploadMode('upload');
    setFormData({
      title: '',
      slug: '',
      description: '',
      version: '1.0',
      fileType: 'ZIP',
      fileSize: '',
      filePath: '',
      isFree: true,
      price: '0',
      changelog: '- កំណែប្រែដំបូង (Initial Release)',
      requirements: 'Windows 10/11 ឬ macOS',
      categoryId: categories[0]?.id || '',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (f: any) => {
    setEditingFile(f);
    setUploadMode(f.filePath?.startsWith('http') ? 'link' : 'upload');
    setFormData({
      title: f.title,
      slug: f.slug,
      description: f.description || '',
      version: f.version || '1.0',
      fileType: f.fileType || 'ZIP',
      fileSize: f.fileSize || '',
      filePath: f.filePath || '',
      isFree: f.isFree,
      price: f.price?.toString() || '0',
      changelog: f.changelog || '',
      requirements: f.requirements || '',
      categoryId: f.categoryId,
      isActive: f.isActive,
    });
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      setUploading(true);
      const data = new FormData();
      data.append('file', selectedFile);

      const res = await fetch('/api/admin/files/upload', {
        method: 'POST',
        body: data,
      });

      const resData = await res.json();
      if (res.ok) {
        success('បាន Upload ឯកសារជោគជ័យ!', resData.filename);
        setFormData((prev) => ({
          ...prev,
          filePath: resData.filename,
          fileSize: resData.fileSize,
          fileType: resData.fileType,
          title: prev.title || selectedFile.name.replace(/\.[^/.]+$/, ''),
          slug:
            prev.slug ||
            selectedFile.name
              .replace(/\.[^/.]+$/, '')
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-'),
        }));
      } else {
        error('មិនអាច Upload បានទេ', resData.error || 'មានបញ្ហា');
      }
    } catch (err) {
      error('មានបញ្ហាក្នុងការ Upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`តើអ្នកពិតជាចង់លុបឯកសារ "${name}" មែនទេ?`)) return;
    try {
      const res = await fetch(`/api/admin/files?id=${id}`, { method: 'DELETE' });
      const resData = await res.json();
      if (res.ok) {
        success('បានលុបឯកសារជោគជ័យ!');
        loadData();
      } else {
        error('មិនអាចលុបបានទេ', resData.error || 'មានបញ្ហា');
      }
    } catch (e) {
      error('មានបញ្ហា');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId) {
      error('សូមជ្រើសរើស Category', 'ប្រសិនបើមិនទាន់មាន Category ទេ សូមបង្កើតជាមុនសិន');
      return;
    }

    if (!formData.filePath) {
      error('សូម Upload ឯកសារ ឬ ដាក់ Link ទាញយក', 'អ្នកមិនទាន់បានបញ្ចូល File Path ឬ Link នៅឡើយទេ');
      return;
    }

    // Auto-generate title if left blank
    let finalTitle = formData.title.trim();
    if (!finalTitle) {
      if (formData.filePath.startsWith('http')) {
        try {
          const urlObj = new URL(formData.filePath);
          const pathname = urlObj.pathname.split('/').filter(Boolean).pop() || 'Download File';
          finalTitle = decodeURIComponent(pathname).replace(/\.[^/.]+$/, '') || 'Cloud Download File';
        } catch {
          finalTitle = 'ឯកសារទាញយក (Digital File)';
        }
      } else {
        finalTitle = formData.filePath.replace(/^\d+-/, '').replace(/\.[^/.]+$/, '') || 'ឯកសារទាញយក';
      }
    }

    try {
      const method = editingFile ? 'PUT' : 'POST';
      const payload = {
        ...(editingFile ? { id: editingFile.id } : {}),
        ...formData,
        title: finalTitle,
      };

      const res = await fetch('/api/admin/files', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (res.ok) {
        success(editingFile ? 'បានកែសម្រួលឯកសារជោគជ័យ!' : 'បានបន្ថែមឯកសារជោគជ័យ!');
        setShowModal(false);
        loadData();
      } else {
        error('បរាជ័យ', resData.error || 'មិនអាចរក្សាទុកបានទេ');
      }
    } catch (e) {
      error('មានបញ្ហា', 'សូមព្យាយាមម្តងទៀត');
    }
  };

  const filtered = files.filter(
    (f) =>
      f.title?.toLowerCase().includes(search.toLowerCase()) ||
      f.category?.nameKm?.toLowerCase().includes(search.toLowerCase()) ||
      f.filePath?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <FolderDown className="w-6 h-6 text-blue-400" />
            <span>គ្រប់គ្រងឯកសារ & Tools (Files Download)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            អ្នកអាច Upload ឯកសារ Free ឬ លក់ Software/Preset សម្រាប់ឱ្យអតិថិជនដោនឡូត (Download)
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-uiverse-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 w-fit shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>+ បន្ថែម / Upload File ថ្មី</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ស្វែងរកតាមឈ្មោះឯកសារ ឬ Category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Files Table / List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">កំពុងផ្ទុកទិន្នន័យឯកសារ...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-3xl border border-slate-800 text-slate-400 text-sm space-y-3">
          <FolderDown className="w-10 h-10 mx-auto text-slate-600" />
          <p>មិនទាន់មានឯកសារនៅឡើយទេ</p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
          >
            + Upload File ដំបូងរបស់អ្នក
          </button>
        </div>
      ) : (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 bg-dark-900 border-b border-slate-800">
                <tr>
                  <th className="p-4">ឈ្មោះឯកសារ</th>
                  <th className="p-4">ប្រភេទ (Category)</th>
                  <th className="p-4">ទម្រង់ & ទំហំ</th>
                  <th className="p-4">តម្លៃ (Price)</th>
                  <th className="p-4">Downloads</th>
                  <th className="p-4">ស្ថានភាព</th>
                  <th className="p-4 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-dark-850/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-white line-clamp-1">{f.title}</p>
                      <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5 truncate max-w-xs">
                        {f.filePath?.startsWith('http') ? (
                          <>
                            <LinkIcon className="w-3 h-3 text-blue-400 shrink-0" />
                            <span className="text-blue-400 truncate">{f.filePath}</span>
                          </>
                        ) : (
                          <>
                            <HardDrive className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>storage/files/{f.filePath}</span>
                          </>
                        )}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="text-[11px] bg-slate-800/80 px-2 py-0.5 rounded-md font-medium text-slate-300">
                        {f.category?.nameKm || 'ទូទៅ'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-purple-400 font-bold">{f.fileType}</span>
                      {f.fileSize && <span className="text-slate-400 ml-1">({f.fileSize})</span>}
                    </td>
                    <td className="p-4 font-mono font-bold">
                      {f.isFree ? (
                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          FREE
                        </span>
                      ) : (
                        <span className="text-amber-400">{formatPrice(f.price)}</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3 text-slate-500" />
                        {f.downloadCount || 0} ដង
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          f.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {f.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/api/download/${f.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-emerald-400 hover:text-white hover:bg-emerald-600/20 rounded-lg transition-colors"
                          title="សាកល្បង Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => openEditModal(f)}
                          className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-600/20 rounded-lg transition-colors"
                          title="កែសម្រួល"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(f.id, f.title)}
                          className="p-1.5 text-red-400 hover:text-white hover:bg-red-600/20 rounded-lg transition-colors"
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
      )}

      {/* Modal: Add / Edit File */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="glass-card max-w-xl w-full rounded-3xl p-6 sm:p-8 border border-slate-700 bg-dark-900 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <FolderDown className="w-5 h-5 text-blue-400" />
                <span>{editingFile ? 'កែសម្រួលព័ត៌មានឯកសារ' : 'Upload / បន្ថែមឯកសារថ្មី'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Category selector */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  ប្រភេទ (Category) <span className="text-red-400">*</span>
                </label>
                {categories.length === 0 ? (
                  <div className="text-amber-400 text-xs p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center justify-between">
                    <span>⚠️ មិនទាន់មាន Category នៅឡើយទេ</span>
                    <Link
                      href="/admin/categories"
                      className="text-blue-400 font-bold underline hover:text-blue-300"
                    >
                      + បង្កើត Category ជាមុន
                    </Link>
                  </div>
                ) : (
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameKm}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  ឈ្មោះឯកសារ (File Title) <span className="text-slate-500 font-normal text-xs">(មិនបាច់បំពេញក៏បាន — ប្រព័ន្ធនឹងបង្កើតតាមឈ្មោះ File ស្វ័យប្រវត្តិ)</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ឧ. CapCut Pro Preset Pack ឬ ទុកចោលដើម្បីឱ្យប្រព័ន្ធដាក់តាមឈ្មោះ File"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none placeholder:text-slate-600"
                />
              </div>

              {/* Method choice: Upload directly from PC OR Google Drive/Link */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  ប្រភពឯកសារ (File Source) <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setUploadMode('upload')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${
                      uploadMode === 'upload'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                        : 'bg-dark-850 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload ពី Computer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('link')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${
                      uploadMode === 'link'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                        : 'bg-dark-850 border-slate-700 text-slate-400'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Link Cloud (Drive / Mega)</span>
                  </button>
                </div>

                {uploadMode === 'upload' ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-dark-850/50 hover:bg-dark-850 p-6 rounded-2xl text-center cursor-pointer transition-all"
                    >
                      <Upload className="w-8 h-8 mx-auto text-blue-400 mb-2 animate-bounce" />
                      <p className="font-bold text-white">
                        {uploading
                          ? 'កំពុង Upload ឯកសារ...'
                          : formData.filePath && !formData.filePath.startsWith('http')
                          ? `✅ បានជ្រើស៖ ${formData.filePath}`
                          : 'ចុចទីនេះដើម្បីជ្រើសរើសឯកសារ (ZIP, RAR, EXE, MP4, Preset...)'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        ប្រព័ន្ធនឹងគណនាទំហំ (Size) និងប្រភេទ (Type) ឱ្យដោយស្វ័យប្រវត្តិ
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={formData.filePath}
                      onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
                      placeholder="https://drive.google.com/file/d/... ឬ Mega/Mediafire link"
                      className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      ដាក់ Link ទាញយកផ្ទាល់ពី Google Drive, Mega, Telegram, ឬ Cloud Drive ផ្សេងៗ
                    </p>
                  </div>
                )}
              </div>

              {/* Format, Size, Version */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">ទម្រង់ (Format)</label>
                  <input
                    type="text"
                    value={formData.fileType}
                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value.toUpperCase() })}
                    placeholder="ZIP, MP4, EXE"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">ទំហំ (Size)</label>
                  <input
                    type="text"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    placeholder="ឧ. 150 MB"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">ជំនាន់ (Version)</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="ឧ. 1.0"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Free vs Paid Toggle */}
              <div className="p-3 bg-dark-850 rounded-2xl border border-slate-800 space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-dark-900 border-slate-700"
                  />
                  <div>
                    <span className="font-bold text-emerald-400 text-xs">
                      🎁 ទាញយកឥតគិតថ្លៃ (Free Download)
                    </span>
                    <p className="text-[11px] text-slate-400">
                      បើកដំណើរការនេះ ដើម្បីឱ្យអតិថិជនចុចដោនឡូតបាន Free ដោយមិនចាំបាច់បង់ប្រាក់
                    </p>
                  </div>
                </label>

                {!formData.isFree && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                    <span className="text-slate-300 font-bold">តម្លៃ ($):</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-24 bg-dark-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">ការពិពណ៌នា (Description)</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="ព័ត៌មានបន្ថែមអំពីឯកសារនេះ..."
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-dark-850 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-uiverse-primary px-6 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  <span>{editingFile ? 'រក្សាទុកការកែប្រែ' : 'បង្ហោះឯកសារ (Publish)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  FileCode,
  HardDrive,
  Wrench,
  Search,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AdminTutorialsPage() {
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Windows Setup');
  const [readTime, setReadTime] = useState('3 នាទីអាន');
  const [icon, setIcon] = useState('BookOpen');
  const [description, setDescription] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/tutorials');
      if (res.ok) {
        const d = await res.json();
        setTutorials(d.tutorials || []);
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
    setTitle('');
    setSlug('');
    setCategory('Windows Setup');
    setReadTime('3 នាទីអាន');
    setIcon('HardDrive');
    setDescription('');
    setStepsText(
      'ទាញយកឯកសារ ISO...\nទាញយក Rufus...\nដំណើរការ Rufus និងជ្រើសរើស Flash Drive...\nចុច START ដើម្បីដំណើរការ...'
    );
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (t: any) => {
    setEditingId(t.id);
    setTitle(t.title);
    setSlug(t.slug);
    setCategory(t.category);
    setReadTime(t.readTime || '3 នាទីអាន');
    setIcon(t.icon || 'BookOpen');
    setDescription(t.description || '');

    let stepsArr: string[] = [];
    try {
      stepsArr = JSON.parse(t.steps);
    } catch (e) {
      stepsArr = [t.steps];
    }
    setStepsText(Array.isArray(stepsArr) ? stepsArr.join('\n') : t.steps);
    setIsActive(t.isActive);
    setShowModal(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 40);
      setSlug(generated || `tutorial-${Date.now()}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      error('សូមបំពេញចំណងជើង និង Slug');
      return;
    }

    setSaving(true);
    const stepsArray = stepsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const payload = {
        id: editingId,
        title: title.trim(),
        slug: slug.trim(),
        category: category.trim(),
        readTime: readTime.trim(),
        icon: icon.trim(),
        description: description.trim(),
        steps: stepsArray,
        isActive,
      };

      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/tutorials', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'មានបញ្ហាកើតឡើង');

      success(editingId ? 'កែប្រែមេរៀនបានជោគជ័យ' : 'បង្កើតមេរៀនថ្មីបានជោគជ័យ');
      setShowModal(false);
      loadData();
    } catch (err: any) {
      error(err.message || 'ប្រតិបត្តិការមិនជោគជ័យ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, titleStr: string) => {
    if (!confirm(`តើអ្នកប្រាកដជាចង់លុបមេរៀន "${titleStr}" មែនទេ?`)) return;

    try {
      const res = await fetch(`/api/admin/tutorials?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        success('បានលុបមេរៀនជោគជ័យ');
        loadData();
      } else {
        const d = await res.json();
        error(d.error || 'បរាជ័យក្នុងការលុប');
      }
    } catch (e) {
      error('មានបញ្ហាកើតឡើង');
    }
  };

  const filteredTutorials = tutorials.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-sky-400" />
            គ្រប់គ្រងមេរៀន & ការណែនាំ (Tutorials)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            បន្ថែម កែប្រែ ឬលុបមេរៀនណែនាំដំឡើង Windows, Office, និង Tools ផ្សេងៗ
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-uiverse-emerald px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>បង្កើតមេរៀនថ្មី</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="ស្វែងរកតាមចំណងជើង ឬប្រភេទ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-dark-850 border border-slate-700/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Tutorials Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">កំពុងផ្ទុកទិន្នន័យ...</div>
      ) : filteredTutorials.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 space-y-3 rounded-2xl border border-slate-800">
          <BookOpen className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-semibold text-slate-300">មិនទាន់មានមេរៀននៅឡើយទេ</p>
          <button
            onClick={openCreateModal}
            className="text-xs text-sky-400 hover:underline inline-block"
          >
            + បង្កើតមេរៀនដំបូង
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTutorials.map((t) => {
            let steps: string[] = [];
            try {
              steps = JSON.parse(t.steps);
            } catch (e) {
              steps = [t.steps];
            }

            return (
              <div
                key={t.id}
                className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                      {t.category}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {t.readTime || '3 នាទីអាន'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white leading-snug">{t.title}</h3>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {t.description || `${steps.length} ជំហានណែនាំ`}
                  </p>

                  <div className="text-[11px] text-slate-500 bg-dark-900/80 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="font-semibold text-slate-300">ចំនួនជំហាន:</span> {steps.length} Steps
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      t.isActive
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {t.isActive ? 'Active (បង្ហាញ)' : 'Hidden (លាក់)'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="កែប្រែ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id, t.title)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="លុប"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card max-w-xl w-full rounded-2xl p-6 border border-slate-700 bg-dark-900 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                {editingId ? 'កែប្រែមេរៀន' : 'បង្កើតមេរៀនថ្មី'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ចំណងជើងមេរៀន (Title) *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="ឧ. របៀបបង្កើត USB Boot Windows 11..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-dark-850 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Slug / URL Identifier *
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="guide-win11-usb"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-dark-850 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ប្រភេទ (Category) *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-dark-850 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Windows Setup">Windows Setup</option>
                    <option value="Office Setup">Office Setup</option>
                    <option value="System Utility">System Utility</option>
                    <option value="Antivirus & Security">Antivirus & Security</option>
                    <option value="Adobe & Design">Adobe & Design</option>
                    <option value="General Tools">General Tools</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ពេលវេលាអាន (Read Time)
                  </label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="3 នាទីអាន"
                    className="w-full px-3.5 py-2 rounded-xl bg-dark-850 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    រូបតំណាង Icon
                  </label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-dark-850 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="HardDrive">HardDrive (Flash / Disk)</option>
                    <option value="FileCode">FileCode (Software / Office)</option>
                    <option value="Wrench">Wrench (Tools & Utilities)</option>
                    <option value="BookOpen">BookOpen (Tutorials)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ការពិពណ៌នាសង្ខេប (Description)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ការណែនាំលម្អិតមួយជំហានម្តងៗ..."
                  className="w-full px-3.5 py-2 rounded-xl bg-dark-850 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    ជំហានណែនាំ (Steps - សរសេរមួយបន្ទាត់ស្មើ ១ ជំហាន) *
                  </label>
                  <span className="text-[10px] text-slate-500">ប្រើ **ពាក្យ** សម្រាប់អក្សរដិត</span>
                </div>
                <textarea
                  rows={5}
                  value={stepsText}
                  onChange={(e) => setStepsText(e.target.value)}
                  placeholder="ជំហានទី ១...&#10;ជំហានទី ២...&#10;ជំហានទី ៣..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-dark-850 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500 leading-relaxed font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded bg-dark-850 border-slate-700 text-sky-500 focus:ring-0"
                />
                <label htmlFor="isActiveToggle" className="text-xs text-slate-300 select-none">
                  បង្ហាញមេរៀននេះនៅលើគេហទំព័រ (Active)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-uiverse-emerald px-5 py-2 rounded-xl text-xs font-bold"
                >
                  {saving ? 'កំពុងរក្សាទុក...' : editingId ? 'កែប្រែ' : 'បង្កើតថ្មី'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

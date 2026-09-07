'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Wand2,
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
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [uploadingImage, setUploadingImage] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

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
    newKeys: '',
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
      newKeys: '',
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
      newKeys: '',
    });
    setShowModal(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('ប្រភេទ File មិនត្រឹមត្រូវ', 'សូមជ្រើសរើសរូបភាព (JPG, PNG, WEBP)');
      return;
    }

    try {
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormData((prev) => ({ ...prev, images: compressedDataUrl }));
          success('បាន Upload រូបភាពជោគជ័យ!');
          setUploadingImage(false);
        };
        img.onerror = () => {
          error('មិនអាចផ្ទុករូបភាពបានទេ');
          setUploadingImage(false);
        };
        img.src = readerEvent.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch {
      error('មានបញ្ហាក្នុងការ Upload រូបភាព');
      setUploadingImage(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('តើអ្នកពិតជាចង់លុប Key នេះចេញពីស្តុកមែនទេ?')) return;
    try {
      const res = await fetch(`/api/admin/keys?id=${keyId}`, { method: 'DELETE' });
      if (res.ok) {
        success('បានលុប Key ជោគជ័យ!');
        if (editingProduct) {
          setEditingProduct((prev: any) => ({
            ...prev,
            keys: prev.keys?.filter((k: any) => k.id !== keyId),
          }));
        }
        loadData();
      } else {
        const d = await res.json();
        error('មិនអាចលុបបានទេ', d.error || 'មានបញ្ហា');
      }
    } catch {
      error('មានបញ្ហា');
    }
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

  const generateDescriptions = (target: 'short' | 'full' | 'both') => {
    if (!formData.name?.trim()) {
      error('សូមបញ្ចូលឈ្មោះផលិតផលជាមុនសិន', 'ប្រព័ន្ធត្រូវការឈ្មោះផលិតផលដើម្បី Generate ការពិពណ៌នា');
      return;
    }

    const cleanName = formData.name.trim();
    const lower = cleanName.toLowerCase();
    const selectedCat = categories.find((c) => c.id === formData.categoryId);
    const catName = selectedCat ? (selectedCat.nameKm || selectedCat.nameEn) : '';

    let shortDesc = '';
    let fullDesc = '';

    if (lower.includes('windows 11') || lower.includes('win 11') || lower.includes('w11')) {
      const isPro = lower.includes('pro');
      const edition = isPro ? 'Windows 11 Pro' : 'Windows 11';
      shortDesc = `Digital License Key ${edition} សុទ្ធ 100% ប្រើប្រាស់បានមួយជីវិត (Lifetime) គាំទ្រ Update ផ្ទាល់ពី Microsoft`;
      fullDesc = `🌟 លក្ខណៈពិសេសសំខាន់ៗ៖\n• Genuine Digital License Key សម្រាប់ ${edition} (64-bit / 32-bit)\n• ប្រើប្រាស់បានរហូត (Lifetime Activation) លើកុំព្យូទ័រ 1 គ្រឿង\n• អាច Update Windows ថ្មីៗដោយផ្ទាល់ពី Microsoft Security Center\n• គាំទ្រទាំងការដំឡើងថ្មី (Clean Install) និង Upgrade ពី Windows ចាស់\n\n🛡️ ការធានា និងសេវាកម្ម៖\n• ធានា Key សុទ្ធ 100% អាច Activate តាម Online ភ្លាមៗ\n• ផ្តល់ជូនការណែនាំដំឡើង និងជំនួយបច្ចេកទេស 24/7`;
    } else if (lower.includes('windows 10') || lower.includes('win 10') || lower.includes('w10')) {
      const isPro = lower.includes('pro');
      const edition = isPro ? 'Windows 10 Pro' : 'Windows 10';
      shortDesc = `Digital License Key ${edition} សុទ្ធ 100% ប្រើប្រាស់បានមួយជីវិត (Lifetime) សម្រាប់ PC និង Laptop`;
      fullDesc = `🌟 លក្ខណៈពិសេសសំខាន់ៗ៖\n• Genuine Digital License Key សម្រាប់ ${edition} (64-bit / 32-bit)\n• ប្រើប្រាស់បានរហូត (Lifetime Activation) គ្មានផុតកំណត់\n• Update ប្រព័ន្ធសុវត្ថិភាព និង Feature ថ្មីៗពី Microsoft ដោយសុវត្ថិភាព\n• ដំណើរការរលូនជាមួយកម្មវិធីការងារ និង Game គ្រប់ប្រភេទ\n\n🛡️ ការធានា និងសេវាកម្ម៖\n• Key សុទ្ធពីក្រុមហ៊ុន Active តាម Online ភ្លាមៗ\n• Support ជួយដោះស្រាយបញ្ហាគ្រប់ជំហាន`;
    } else if (lower.includes('office') || lower.includes('365') || lower.includes('word') || lower.includes('excel')) {
      shortDesc = `កញ្ចប់កម្មវិធី ${cleanName} កំណែពេញលេញ ប្រើប្រាស់សម្រាប់ការិយាល័យ ការសិក្សា និងអាជីវកម្ម`;
      fullDesc = `🌟 កម្មវិធីរួមបញ្ចូល៖\n• Microsoft Word, Excel, PowerPoint, Outlook, OneNote, Access...\n• មុខងារ AI និង Template ទំនើបៗជួយសម្រួលការងារ\n• គាំទ្រភាសាខ្មែរ និង Font ខ្មែរគ្រប់ប្រភេទ\n\n⚡ អត្ថប្រយោជន៍៖\n• កំណែពេញលេញ គ្មានការរំខានផ្ទាំង Activate\n• ដំណើរការរលូននៅលើ Windows និង macOS\n\n🛡️ ការធានា៖\n• ធានាការប្រើប្រាស់ និង Support បច្ចេកទេសរហ័សទាន់ចិត្ត`;
    } else if (lower.includes('adobe') || lower.includes('photoshop') || lower.includes('illustrator') || lower.includes('premiere') || lower.includes('acrobat')) {
      shortDesc = `កម្មវិធី ${cleanName} កំណែពេញលេញសម្រាប់ Graphic Design, កាត់តរូបភាព និង Video កម្រិតអាជីព`;
      fullDesc = `🌟 លក្ខណៈពិសេស៖\n• ដំឡើងងាយស្រួល ប្រើប្រាស់មុខងារ Professional គ្រប់បែបយ៉ាង\n• Export រូបភាព និង Video កម្រិតច្បាស់អតិបរមា (HD, 4K)\n• គាំទ្រ Plugin, Preset និង Font ពេញលេញ\n\n⚡ ស័ក្តិសមសម្រាប់៖\n• អ្នកឌីហ្សាញ (Graphic Designer), Video Editor, Content Creator\n\n🛡️ ការធានា៖\n• ផ្តល់ជូន Link ដោនឡូតលឿន និងការណែនាំដំឡើងមួយជំហានម្តងៗ`;
    } else if (lower.includes('capcut') || lower.includes('filmora') || lower.includes('davinci') || lower.includes('video')) {
      shortDesc = `កម្មវិធីកាត់តវីដេអូ ${cleanName} ប្រើប្រាស់មុខងារ VIP/Pro គ្មាន Watermark Export 4K លឿនរហ័ស`;
      fullDesc = `🌟 មុខងារពិសេស៖\n• ដោះសោ Effect, Transition, Sound FX, Filters កម្រិត VIP ពេញលេញ\n• Export វីដេអូ 2K/4K គ្មានជាប់ Watermark/Logo\n• មុខងារ Auto Caption និង AI ឆ្លាតវៃ\n\n🛡️ ការធានា៖\n• ធានាប្រើប្រាស់បានស្រួល មិនរអាក់រអួល`;
    } else if (lower.includes('canva') || lower.includes('chatgpt') || lower.includes('midjourney') || lower.includes('ai') || lower.includes('claude') || lower.includes('netflix')) {
      shortDesc = `គណនី ${cleanName} ប្រើប្រាស់មុខងារ Premium ពេញលេញ ល្បឿនលឿន និងគ្មានដែនកំណត់`;
      fullDesc = `🌟 លក្ខណៈពិសេស៖\n• ប្រើប្រាស់មុខងារ Pro/Premium និង Template រាប់លានឥតគិតថ្លៃ\n• AI ជំនួយការឆ្លាតវៃ ជួយសន្សំពេលវេលាធ្វើការងារ\n• ដំណើរការបានគ្រប់ Device (Phone, Tablet, PC/Laptop)\n\n🛡️ ការធានា៖\n• ធានាគណនីប្រើប្រាស់បានពេញលេញតាមកាលកំណត់ និង Support 24/7`;
    } else if (lower.includes('idm') || lower.includes('internet download manager')) {
      shortDesc = `Internet Download Manager (IDM) License ប្រើប្រាស់មួយជីវិត បង្កើនល្បឿន Download ដល់ 5X`;
      fullDesc = `🌟 លក្ខណៈពិសេស៖\n• បង្កើនល្បឿនទាញយក File, Video, Music រហូតដល់ 5 ដង\n• ដំណើរការស្វ័យប្រវត្តិលើ Google Chrome, MS Edge, Brave, Firefox\n• មុខងារ Resume ទាញយកបន្តពេលដាច់ Internet\n\n🛡️ ការធានា៖\n• ប្រើប្រាស់បានរហូត គ្មានលោត Pop-up Fake Serial`;
    } else if (lower.includes('antivirus') || lower.includes('kaspersky') || lower.includes('bitdefender') || lower.includes('nod32') || lower.includes('malwarebytes')) {
      shortDesc = `License Key ${cleanName} សុទ្ធ ការពារកុំព្យូទ័រពីមេរោគ Ransomware, Trojan និង Hackers 100%`;
      fullDesc = `🌟 ការពារកម្រិតខ្ពស់៖\n• កម្ចាត់មេរោគ, Ransomware, Spyware និង Phishing Web\n• ការពារប្រតិបត្តិការធនាគារ និងទិន្នន័យឯកជនភាព\n• Update Database មេរោគថ្មីៗរៀងរាល់ថ្ងៃ\n\n🛡️ ការធានា៖\n• Key សុទ្ធ 100% Active ផ្ទាល់លើ Software ផ្លូវការ`;
    } else {
      const catText = catName ? ` ក្នុងជំពូក ${catName}` : '';
      shortDesc = `${cleanName} គុណភាពខ្ពស់ សុទ្ធ 100% ផ្តល់ជូនការប្រើប្រាស់ពេញលេញ ជាមួយការធានា និងជំនួយបច្ចេកទេស`;
      fullDesc = `🌟 ព័ត៌មានលម្អិតអំពី ${cleanName}៖\n• ផលិតផលឌីជីថល / License គុណភាពខ្ពស់${catText}\n• ទទួលបានទិន្នន័យ (Key / File / គណនី) ស្វ័យប្រវត្តភ្លាមៗបន្ទាប់ពីទូទាត់\n• ងាយស្រួលដំឡើង និងប្រើប្រាស់ គាំទ្រទាំងលើ ${formData.platform || 'PC/Laptop'}\n\n⚡ អត្ថប្រយោជន៍ទទួលបាន៖\n• ដំណើរការរលូន សុវត្ថិភាព 100%\n• មានការណែនាំដំឡើងយ៉ាងក្បោះក្បាយ\n\n🛡️ ការធានា និងការគាំទ្រ៖\n• ធានាគុណភាព ១០០% និងផ្តល់សេវា Support ជូនអតិថិជនរហ័សទាន់ចិត្ត`;
    }

    if (target === 'short' || target === 'both') {
      setFormData((prev) => ({ ...prev, shortDesc }));
    }
    if (target === 'full' || target === 'both') {
      setFormData((prev) => ({ ...prev, description: fullDesc }));
    }

    success(
      target === 'both'
        ? 'បានបង្កើតការពិពណ៌នាទាំងពីរជោគជ័យ!'
        : target === 'short'
        ? 'បានបង្កើតការពិពណ៌នាសង្ខេបជោគជ័យ!'
        : 'បានបង្កើតការពិពណ៌នាពេញលេញជោគជ័យ!'
    );
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card max-w-2xl w-full rounded-3xl border border-slate-700 bg-dark-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 p-5 sm:p-6 pb-4 shrink-0 bg-dark-900">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  <span>{editingProduct ? 'កែសម្រួលផលិតផល' : 'បន្ថែមផលិតផលថ្មី'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
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
                    <label className="block font-bold text-slate-300 mb-1">
                      ប្រភេទ (Category) <span className="text-slate-500 font-normal text-xs">(មិនចាំបាច់ / Optional)</span>
                    </label>
                    <select
                      value={formData.categoryId || ''}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">(គ្មានប្រភេទ / ទូទៅ - General)</option>
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

                {/* Product Image Upload / URL */}
                <div className="space-y-2 p-3.5 bg-dark-900 rounded-2xl border border-slate-700/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-purple-400" />
                      <span>រូបភាពផលិតផល (Product Image)</span>
                    </label>
                    <div className="flex items-center gap-1 bg-dark-850 p-0.5 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setImageMode('upload')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                          imageMode === 'upload'
                            ? 'bg-purple-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload រូបភាព</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode('url')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                          imageMode === 'url'
                            ? 'bg-purple-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>Image URL</span>
                      </button>
                    </div>
                  </div>

                  {imageMode === 'upload' ? (
                    <div className="space-y-2">
                      <input
                        type="file"
                        ref={imageInputRef}
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />

                      {formData.images ? (
                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-850 border border-slate-700">
                          <img
                            src={formData.images}
                            alt="Product preview"
                            className="w-16 h-16 rounded-lg object-cover border border-slate-600 bg-black"
                          />
                          <div className="flex-1 min-w-0 text-xs">
                            <span className="font-bold text-emerald-400 block truncate">✅ រូបភាពរួចរាល់</span>
                            <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                              បានផ្ទុកក្នុងប្រព័ន្ធ និងត្រៀមបង្ហាញលើ Store
                            </span>
                            <button
                              type="button"
                              onClick={() => imageInputRef.current?.click()}
                              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 underline mt-1 block text-left"
                            >
                              ប្តូររូបភាពថ្មី
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, images: '' }))}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            title="ដករូបចេញ"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="w-full py-4 px-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-purple-500 bg-dark-850/60 hover:bg-dark-850 text-slate-300 flex flex-col items-center justify-center gap-1.5 text-xs transition-all cursor-pointer"
                        >
                          <Upload className="w-6 h-6 text-purple-400 animate-bounce" />
                          <span className="font-bold text-white">
                            {uploadingImage ? 'កំពុងដំណើរការ...' : 'ចុចត្រង់នេះដើម្បីជ្រើសរើសរូបភាពពី Computer ឬ ទូរស័ព្ទ'}
                          </span>
                          <span className="text-[10px] text-slate-400">គាំទ្រ JPG, PNG, WEBP (ប្រព័ន្ធនឹង Optimize ទំហំស្វ័យប្រវត្តិ)</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={formData.images}
                        onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                        placeholder="https://images.unsplash.com/... ឬ link រូបភាព"
                        className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-purple-500 focus:outline-none"
                      />
                      {formData.images && (
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-dark-850 border border-slate-800">
                          <img
                            src={formData.images}
                            alt="URL preview"
                            className="w-10 h-10 rounded-lg object-cover bg-black border border-slate-700"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <span className="text-[11px] text-slate-400 truncate">Image Preview ពី URL</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-300">
                      ការពិពណ៌នាសង្ខេប (Short Desc)
                    </label>
                    <button
                      type="button"
                      onClick={() => generateDescriptions('short')}
                      className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all cursor-pointer"
                      title="Generate ការពិពណ៌នាសង្ខេបដោយស្វ័យប្រវត្តិតាមឈ្មោះផលិតផល"
                    >
                      <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                      <span>✨ Auto Generate</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="ឧ. License Key Windows 11 Pro របស់សុទ្ធ 100%..."
                    value={formData.shortDesc}
                    onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-300">
                      ការពិពណ៌នាពេញលេញ (Description)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => generateDescriptions('both')}
                        className="text-[10px] font-bold text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-dark-850 hover:bg-slate-800 border border-slate-700 transition-all"
                        title="Generate ទាំងការពិពណ៌នាសង្ខេប និងពេញលេញ"
                      >
                        ⚡ Generate ទាំងពីរ (Both)
                      </button>
                      <button
                        type="button"
                        onClick={() => generateDescriptions('full')}
                        className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all cursor-pointer"
                        title="Generate ការពិពណ៌នាពេញលេញដោយស្វ័យប្រវត្តិតាមឈ្មោះផលិតផល"
                      >
                        <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                        <span>✨ Auto Generate</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="ព័ត៌មានលម្អិត លក្ខណៈពិសេស ការធានា និងវិធីប្រើប្រាស់..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 focus:border-purple-500 focus:outline-none text-xs leading-relaxed"
                  />
                </div>

                {/* Product License Keys Management Section */}
                <div className="p-3.5 rounded-2xl bg-dark-900 border border-blue-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-blue-400" />
                      <label className="text-xs font-bold text-white">
                        🔑 បញ្ចូល Product Keys (License Activation)
                      </label>
                    </div>
                    {editingProduct?.keys && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                        {editingProduct.keys.filter((k: any) => k.status === 'AVAILABLE').length} Available Keys ក្នុងស្តុក
                      </span>
                    )}
                  </div>

                  {/* Show existing keys if editing */}
                  {editingProduct?.keys && editingProduct.keys.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-slate-800">
                      <p className="text-[11px] text-slate-400 font-medium">Keys ដែលមានក្នុងផលិតផលនេះបច្ចុប្បន្ន៖</p>
                      <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                        {editingProduct.keys.map((k: any) => (
                          <div
                            key={k.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-dark-850 border border-slate-800 text-[11px] font-mono"
                          >
                            <span className={k.status === 'AVAILABLE' ? 'text-emerald-400' : 'text-slate-500 line-through'}>
                              {k.key}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                k.status === 'AVAILABLE'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                {k.status}
                              </span>
                              {k.status === 'AVAILABLE' && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteKey(k.id)}
                                  className="text-red-400 hover:text-red-300 p-0.5 rounded"
                                  title="លុប Key នេះ"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Textarea to paste new keys */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-300">
                        {editingProduct ? '+ បញ្ចូល / Paste Keys ថ្មីបន្ថែម' : 'Paste Product Keys (មួយជួរម្តងៗ)'}
                      </label>
                      {formData.newKeys && (
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                          ⚡ រកឃើញ {formData.newKeys.split('\n').filter((k) => k.trim().length > 0).length} Keys
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      value={formData.newKeys}
                      onChange={(e) => setFormData({ ...formData, newKeys: e.target.value })}
                      placeholder={"ឧទាហរណ៍ (Paste មួយជួរ ឬច្រើនជួរ):\nDEMO-W11PR-VK7JG-NPHTM-C97JM-9MPGT\nDEMO-W11PR-NRG8B-VKK3Q-CXVCJ-9G2XF"}
                      className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500">
                      💡 លោកអ្នកអាច Copy & Paste Keys ពី Excel, Notepad ឬ Keygen ចូលទីនេះបានភ្លាមៗ (មួយជួរ = Key មួយ)
                    </p>
                  </div>
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
              </div>

              {/* Modal Fixed Footer */}
              <div className="flex items-center justify-end gap-2 p-4 sm:p-5 border-t border-slate-800 bg-dark-900 shrink-0">
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

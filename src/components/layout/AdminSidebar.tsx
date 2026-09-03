'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  KeyRound,
  FolderDown,
  ShoppingBag,
  Users,
  Tag,
  MessageSquare,
  Download,
  ArrowLeft,
  ShieldAlert,
  Zap,
  BookOpen,
  Star,
  Sparkles,
  Gift,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const links = [
    { href: '/admin', label: 'ផ្ទាំងគ្រប់គ្រង (Dashboard)', icon: LayoutDashboard },
    { href: '/admin/products', label: 'ផលិតផល (Products)', icon: Package },
    { href: '/admin/categories', label: 'ប្រភេទផលិតផល (Categories)', icon: Layers },
    { href: '/admin/keys', label: 'Product Keys (License)', icon: KeyRound },
    { href: '/admin/files', label: 'ឯកសារ & Tools (Files)', icon: FolderDown },
    { href: '/admin/gifts', label: 'ផ្ញើកាដូ (User Gifts)', icon: Gift },
    { href: '/admin/tutorials', label: 'មេរៀន & Tutorials', icon: BookOpen },
    { href: '/admin/orders', label: 'ការបញ្ជាទិញ (Orders)', icon: ShoppingBag },
    { href: '/admin/reviews', label: 'ការវាយតម្លៃ (Reviews)', icon: Star },
    { href: '/admin/support', label: 'សារសាកសួរ (Support)', icon: MessageSquare },
    { href: '/admin/users', label: 'អតិថិជន & Users', icon: Users },
    { href: '/admin/coupons', label: 'កូដបញ្ចុះតម្លៃ (Coupons)', icon: Tag },
    { href: '/admin/downloads', label: 'Download Audit Logs', icon: Download },
    { href: '/admin/profile', label: 'សុវត្ថិភាព & Password', icon: ShieldAlert },
    { href: '/admin/banners', label: 'គ្រប់គ្រង Banners (Hero)', icon: Sparkles },
  ];

  return (
    <aside className="w-full lg:w-64 space-y-6 flex-shrink-0">
      {/* Admin Title Card */}
      <div className="glass-card p-5 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-dark-900 to-dark-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/25">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
              ADMINISTRATION
            </span>
            <h3 className="font-bold text-sm text-white">ផ្ទាំងគ្រប់គ្រង Admin</h3>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="glass-card p-3 rounded-2xl border border-slate-800 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`btn-uiverse-google-wave ${
                isActive ? 'btn-uiverse-google-active' : ''
              }`}
            >
              <Icon className="nav-icon" />
              <span className="nav-text">{link.label}</span>
            </Link>
          );
        })}

        <div className="pt-2 mt-2 border-t border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-dark-850 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ត្រឡប់ទៅកាន់ Store</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}

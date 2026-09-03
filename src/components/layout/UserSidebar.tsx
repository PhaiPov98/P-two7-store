'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  KeyRound,
  Download,
  User,
  LogOut,
  Gift,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { KHMER_TEXT } from '@/lib/translations';

export default function UserSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    { href: '/account', label: 'ផ្ទាំងគ្រប់គ្រង (Dashboard)', icon: LayoutDashboard },
    { href: '/account/orders', label: 'ការបញ្ជាទិញ (Orders)', icon: ShoppingBag },
    { href: '/account/keys', label: 'Product Keys របស់ខ្ញុំ', icon: KeyRound },
    { href: '/account/downloads', label: 'ការទាញយក (Downloads)', icon: Download },
    { href: '/account/gifts', label: 'ការដូរកាដូ (Gifts & Redeem)', icon: Gift },
    { href: '/account/profile', label: 'ព័ត៌មានផ្ទាល់ខ្លួន (Profile)', icon: User },
  ];

  return (
    <aside className="w-full lg:w-64 space-y-6">
      {/* User Profile Card */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden border border-slate-700 shrink-0 relative">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user?.name || 'User'}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              className="w-full h-full object-cover"
            />
          ) : null}
          <span className="absolute inset-0 flex items-center justify-center -z-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="overflow-hidden">
          <p className="font-bold text-sm text-white truncate">{user?.name || 'គណនីអតិថិជន'}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email || 'customer@bozzpov.com'}</p>
        </div>
      </div>

      {/* Navigation Menu */}
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

        <div className="pt-3 mt-2 border-t border-slate-800 flex items-center justify-between px-2">
          <button
            onClick={logout}
            className="btn-uiverse-logout"
            title={KHMER_TEXT.nav.logout}
          >
            <div className="logout-sign">
              <LogOut className="w-4 h-4 text-white" />
            </div>
            <div className="logout-text">{KHMER_TEXT.nav.logout}</div>
          </button>
          <span className="text-[11px] text-slate-400 font-medium">ចាកចេញពីគណនី</span>
        </div>
      </nav>
    </aside>
  );
}

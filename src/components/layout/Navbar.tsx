'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingBag,
  User as UserIcon,
  Search,
  Menu,
  X,
  KeyRound,
  Download,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  UserPlus,
  Zap,
  Home,
  Package,
  Headphones,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { KHMER_TEXT } from '@/lib/translations';
import ThemeToggle from '@/components/layout/ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname || '';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-dark-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300 border border-white/20 shrink-0">
              <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  {KHMER_TEXT.brandName}
                </span>
                <span className="bg-blue-500/20 text-blue-400 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-500/30">
                  STORE
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-400 font-medium tracking-wide">
                {KHMER_TEXT.brandSubtitle}
              </p>
            </div>
          </Link>

          {/* Navigation Links - Desktop Floating Glass Capsule */}
          {/* Navigation Links - Desktop Floating Capsule with Drop-Letter Buttons (Uiverse by doniaskima) */}
          <nav className="hidden lg:flex items-center gap-2 p-1.5 rounded-full bg-dark-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
            {/* 1. Home */}
            <Link
              href="/"
              prefetch={true}
              className={`nav-btn-53 ${currentPath === '/' ? 'nav-btn-53-active' : ''}`}
            >
              <div className="original">
                <Home className="w-3.5 h-3.5" />
                <span>{KHMER_TEXT.nav.home}</span>
              </div>
              <div className="letters">
                <span className="letter">H</span>
                <span className="letter">O</span>
                <span className="letter">M</span>
                <span className="letter">E</span>
              </div>
            </Link>

            {/* 2. Products */}
            <Link
              href="/products"
              prefetch={true}
              className={`nav-btn-53 ${currentPath.startsWith('/products') ? 'nav-btn-53-active' : ''}`}
            >
              <div className="original">
                <Package className="w-3.5 h-3.5" />
                <span>{KHMER_TEXT.nav.products}</span>
              </div>
              <div className="letters">
                <span className="letter">S</span>
                <span className="letter">H</span>
                <span className="letter">O</span>
                <span className="letter">P</span>
              </div>
            </Link>

            {/* 3. Free Software */}
            <Link
              href="/software"
              prefetch={true}
              className={`nav-btn-53 ${currentPath.startsWith('/software') ? 'nav-btn-53-active' : ''}`}
            >
              <div className="original">
                <Download className="w-3.5 h-3.5" />
                <span>កម្មវិធី Free</span>
                <span className="relative flex h-2 w-2 ml-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="letters">
                <span className="letter">F</span>
                <span className="letter">R</span>
                <span className="letter">E</span>
                <span className="letter">E</span>
              </div>
            </Link>

            {/* 4. Support */}
            <Link
              href="/support"
              prefetch={true}
              className={`nav-btn-53 ${currentPath.startsWith('/support') ? 'nav-btn-53-active' : ''}`}
            >
              <div className="original">
                <Headphones className="w-3.5 h-3.5" />
                <span>{KHMER_TEXT.nav.support}</span>
              </div>
              <div className="letters">
                <span className="letter">H</span>
                <span className="letter">E</span>
                <span className="letter">L</span>
                <span className="letter">P</span>
              </div>
            </Link>
          </nav>


          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Theme Toggle (Dark / Light Mode) */}
            <ThemeToggle />

            {/* Cart Button */}
            <Link
              href="/cart"
              className="btn-uiverse-icon p-2 sm:p-2.5 rounded-xl text-slate-200 transition-all duration-200 shrink-0"
              title={KHMER_TEXT.nav.cart}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] sm:text-[11px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Dropdown / Login */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="hidden sm:flex p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs font-bold items-center gap-1.5 hover:bg-purple-600/30 transition-all shadow-md shrink-0"
                    title="ផ្ទាំងគ្រប់គ្រង Admin"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span className="hidden md:inline">Admin</span>
                  </Link>
                )}

                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="btn-uiverse-secondary flex items-center gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 sm:pr-3 rounded-xl transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-md overflow-hidden border border-slate-700/60 relative shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                      <span className="absolute inset-0 flex items-center justify-center -z-0">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs font-medium max-w-[85px] truncate hidden sm:inline text-left">
                      {user.name}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      onMouseLeave={() => setUserDropdownOpen(false)}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-dark-900/95 border border-slate-700/80 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
                    >
                      <div className="px-4 py-2 border-b border-slate-800">
                        <p className="text-xs text-slate-400">គណនី</p>
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        {user.role === 'ADMIN' && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-[10px] font-bold">
                            ADMIN
                          </span>
                        )}
                      </div>

                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-purple-300 hover:bg-purple-950/40 hover:text-white transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-purple-400" />
                          {KHMER_TEXT.nav.adminDashboard}
                        </Link>
                      )}

                      <Link
                        href="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-dark-800 hover:text-white transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-blue-400" />
                        {KHMER_TEXT.nav.account}
                      </Link>

                      <Link
                        href="/account/keys"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-dark-800 hover:text-white transition-colors"
                      >
                        <KeyRound className="w-4 h-4 text-emerald-400" />
                        Product Keys របស់ខ្ញុំ
                      </Link>

                      <Link
                        href="/account/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-dark-800 hover:text-white transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-indigo-400" />
                        ការបញ្ជាទិញ
                      </Link>

                      <Link
                        href="/account/downloads"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-dark-800 hover:text-white transition-colors"
                      >
                        <Download className="w-4 h-4 text-cyan-400" />
                        ការទាញយក
                      </Link>

                      <div className="border-t border-slate-800 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="btn-uiverse-danger w-full justify-start px-4 py-2 text-xs rounded-lg m-1 border-0"
                        >
                          <LogOut className="w-4 h-4" />
                          {KHMER_TEXT.nav.logout}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Login Button */}
                <Link
                  href="/login"
                  prefetch={true}
                  className="btn-uiverse-remon125 btn-uiverse-remon125-cyan !py-1.5 !px-2.5 sm:!px-3.5 text-xs shrink-0"
                  title={KHMER_TEXT.nav.login}
                >
                  <span className="bg-layer" />
                  <span className="bg-layer" />
                  <span className="bg-layer" />
                  <span className="bg-layer" />
                  <span className="relative z-10">{KHMER_TEXT.nav.login}</span>
                </Link>

                {/* Register Button - visible on md+ (on mobile it is in Hamburger Menu) */}
                <Link
                  href="/register"
                  prefetch={true}
                  className="btn-uiverse-remon125 btn-uiverse-remon125-blue !hidden md:!inline-flex !py-1.5 !px-3.5 text-xs shrink-0"
                  title={KHMER_TEXT.nav.register}
                >
                  <span className="bg-layer" />
                  <span className="bg-layer" />
                  <span className="bg-layer" />
                  <span className="bg-layer" />
                  <UserPlus className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">{KHMER_TEXT.nav.register}</span>
                </Link>

                {/* Admin Link - visible on sm+ (on mobile it is in Hamburger Menu) */}
                <Link
                  href="/admin-login"
                  prefetch={true}
                  className="btn-uiverse-remon125 btn-uiverse-remon125-purple !hidden sm:!inline-flex !py-1.5 !px-3 text-xs shrink-0"
                  title="ចូលជា Admin"
                >
                  <span className="bg-layer" />
                  <span className="bg-layer" />
                  <span className="bg-layer" />
                  <span className="bg-layer" />
                  <ShieldCheck className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">Admin</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn-uiverse-icon lg:hidden p-2 rounded-xl text-slate-300 hover:text-white shrink-0"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-3 animate-in slide-in-from-top-4">
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3 rounded-xl flex items-center gap-2 transition-all ${
                  currentPath === '/'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-dark-850 text-slate-300 hover:text-white'
                }`}
              >
                <Home className="w-4 h-4 text-blue-400" />
                <span>{KHMER_TEXT.nav.home}</span>
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3 rounded-xl flex items-center gap-2 transition-all ${
                  currentPath.startsWith('/products')
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-dark-850 text-slate-300 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4 text-indigo-400" />
                <span>{KHMER_TEXT.nav.products}</span>
              </Link>
              <Link
                href="/software"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3 rounded-xl flex items-center gap-2 transition-all ${
                  currentPath.startsWith('/software')
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'bg-dark-850 text-emerald-400 hover:text-white font-bold'
                }`}
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>កម្មវិធី Free</span>
              </Link>
              <Link
                href="/support"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3 rounded-xl flex items-center gap-2 transition-all ${
                  currentPath.startsWith('/support')
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-dark-850 text-slate-300 hover:text-white'
                }`}
              >
                <Headphones className="w-4 h-4 text-cyan-400" />
                <span>{KHMER_TEXT.nav.support}</span>
              </Link>
            </div>

            {/* Additional Quick Actions in Mobile Menu */}
            {!user && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-md"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{KHMER_TEXT.nav.register}</span>
                </Link>
                <Link
                  href="/admin-login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs font-bold text-center flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Admin</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

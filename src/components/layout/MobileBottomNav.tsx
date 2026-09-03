'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, FolderDown, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function MobileBottomNav() {
  const pathname = usePathname() || '';
  const { totalItems } = useCart();
  const { user } = useAuth();

  // Don't show bottom nav on admin dashboard to keep admin clean
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    {
      label: 'ទំព័រដើម',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'ផលិតផល',
      href: '/products',
      icon: Package,
      isActive: pathname.startsWith('/products'),
    },
    {
      label: 'កម្មវិធី Free',
      href: '/files',
      icon: FolderDown,
      isActive: pathname.startsWith('/files'),
    },
    {
      label: 'រទេះទំនិញ',
      href: '/cart',
      icon: ShoppingBag,
      isActive: pathname === '/cart',
      badge: totalItems > 0 ? totalItems : null,
    },
    {
      label: user ? (user.role === 'ADMIN' ? 'Admin' : 'គណនី') : 'ចូល',
      href: user ? (user.role === 'ADMIN' ? '/admin' : '/account') : '/login',
      icon: User,
      isActive: pathname.startsWith('/account') || pathname.startsWith('/login') || pathname.startsWith('/admin'),
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-950/95 backdrop-blur-2xl border-t border-slate-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                item.isActive
                  ? 'text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    item.isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-[9px] font-black text-white flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[60px]">
                {item.label}
              </span>
              {item.isActive && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-blue-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

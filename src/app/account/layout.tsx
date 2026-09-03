import React from 'react';
import UserSidebar from '@/components/layout/UserSidebar';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <UserSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

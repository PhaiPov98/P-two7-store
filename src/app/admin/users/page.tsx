'use client';

import React, { useState, useEffect } from 'react';
import { Users, Shield, User, RefreshCw, Trash2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { formatDateKhmer } from '@/lib/translations';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const d = await res.json();
        setUsers(d.users || []);
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

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`តើអ្នកពិតជាចង់លុបគណនី "${userName}" ចេញពីប្រព័ន្ធមែនទេ?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        success('បានលុប User ជោគជ័យ!', `បានលុបគណនី ${userName}`);
        loadData();
      } else {
        error('មិនអាចលុបបានទេ', data.error || 'មានបញ្ហា');
      }
    } catch (e) {
      error('មានបញ្ហា', 'សូមព្យាយាមម្តងទៀត');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">គ្រប់គ្រងអ្នកប្រើប្រាស់ (Users)</h1>
          <p className="text-xs text-slate-400 mt-0.5">បញ្ជីអតិថិជន និង Admin ក្នុងប្រព័ន្ធ Bozz Pov</p>
        </div>
        <button
          onClick={loadData}
          className="px-3.5 py-2 bg-dark-850 hover:bg-dark-800 text-slate-300 border border-slate-700 rounded-xl text-xs flex items-center gap-1.5 w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 bg-dark-900 border-b border-slate-800">
              <tr>
                <th className="p-4">ឈ្មោះ & Email</th>
                <th className="p-4">លេខទូរស័ព្ទ</th>
                <th className="p-4">Role</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Downloads</th>
                <th className="p-4">កាលបរិច្ឆេទចុះឈ្មោះ</th>
                <th className="p-4 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-dark-850/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400 font-mono">{u.phone || '-'}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-white">{u._count?.orders || 0}</td>
                  <td className="p-4 font-mono font-bold text-emerald-400">{u._count?.downloads || 0}</td>
                  <td className="p-4 text-slate-400 text-[11px]">{formatDateKhmer(u.createdAt)}</td>
                  <td className="p-4 text-right">
                    {u.role === 'ADMIN' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 text-[10px] font-semibold border border-purple-500/20">
                        <Shield className="w-3 h-3 text-purple-400" />
                        Admin
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-1.5 rounded-lg bg-dark-800 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-colors"
                        title="លុបគណនី User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

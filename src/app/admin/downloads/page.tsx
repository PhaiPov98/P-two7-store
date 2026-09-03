'use client';

import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, FileCode, Globe } from 'lucide-react';
import { formatDateKhmer } from '@/lib/translations';

export default function AdminDownloadsPage() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/downloads');
      if (res.ok) {
        const d = await res.json();
        setDownloads(d.downloads || []);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">Download Audit Logs (កំណត់ត្រាទាញយក)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            ត្រួតពិនិត្យរាល់សកម្មភាពទាញយកឯកសារ Private Files, IP Address និង User Agent
          </p>
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
                <th className="p-4">ឯកសារ (File)</th>
                <th className="p-4">អ្នកទាញយក (User)</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">User Agent / ឧបករណ៍</th>
                <th className="p-4 text-right">កាលបរិច្ឆេទ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {downloads.map((d) => (
                <tr key={d.id} className="hover:bg-dark-850/50 transition-colors">
                  <td className="p-4 font-bold text-white">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-purple-400" />
                      <span>{d.file?.title}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-white">{d.user?.name || 'Guest'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{d.user?.email || '-'}</p>
                  </td>
                  <td className="p-4 font-mono text-cyan-400">
                    <div className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" />
                      <span>{d.ipAddress || '127.0.0.1'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[10px] text-slate-400 font-mono max-w-[200px] truncate">
                    {d.userAgent || 'Unknown'}
                  </td>
                  <td className="p-4 text-right text-slate-400">
                    {formatDateKhmer(d.createdAt)}
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

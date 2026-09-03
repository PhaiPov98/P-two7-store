import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Download, FileCode, HardDrive, Clock, FolderDown } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import FileDownloadButton from '@/components/file/FileDownloadButton';
import { formatDateKhmer } from '@/lib/translations';

export const revalidate = 0;

export default async function UserDownloadsPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect('/login?redirect=/account/downloads');
  }

  // Fetch download logs for this user
  const downloadLogs = await prisma.download.findMany({
    where: { userId: session.id },
    include: {
      file: {
        include: { category: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Also fetch all available free & purchased files
  const availableFiles = await prisma.file.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { downloadCount: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">ការទាញយករបស់ខ្ញុំ (Downloads)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            ឯកសារ និង Tools ដែលអ្នកបានទាញយក ឬមានសិទ្ធិទាញយក
          </p>
        </div>
      </div>

      {/* Download History */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          ប្រវត្តិនៃការទាញយកកន្លងមក ({downloadLogs.length})
        </h3>

        {downloadLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">លោកអ្នកមិនទាន់មានប្រវត្តិទាញយកនៅឡើយទេ</p>
        ) : (
          <div className="space-y-2">
            {downloadLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-dark-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{log.file.title}</h4>
                    <p className="text-[10px] text-slate-400">
                      ទំហំ: {log.file.fileSize} • ជំនាន់: {log.file.version} • កាលបរិច្ឆេទ: {formatDateKhmer(log.createdAt)}
                    </p>
                  </div>
                </div>

                <FileDownloadButton file={log.file as any} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Tools Catalog */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FolderDown className="w-4 h-4 text-emerald-400" />
            ឯកសារ និង Tools ទាំងអស់
          </h3>
          <Link href="/files" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
            មើលទាំងអស់
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableFiles.map((f) => (
            <div key={f.id} className="p-4 rounded-2xl bg-dark-900 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {f.isFree ? 'FREE' : `$${f.price.toFixed(2)}`}
                </span>
                <h4 className="font-bold text-xs text-white mt-1 line-clamp-1">{f.title}</h4>
                <p className="text-[10px] text-slate-400">{f.fileSize} • {f.fileType}</p>
              </div>
              <FileDownloadButton file={f as any} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

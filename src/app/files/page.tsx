import React from 'react';
import { FolderDown, Filter, Download } from 'lucide-react';
import prisma from '@/lib/prisma';
import FileCard from '@/components/file/FileCard';
import { KHMER_TEXT } from '@/lib/translations';

export const revalidate = 0;

export default async function FilesPage({
  searchParams,
}: {
  searchParams: { filter?: string; category?: string };
}) {
  const filterType = searchParams.filter;
  const catSlug = searchParams.category;

  const whereClause: any = { isActive: true };
  if (filterType === 'free') whereClause.isFree = true;
  if (filterType === 'premium') whereClause.isFree = false;
  if (catSlug) whereClause.category = { slug: catSlug };

  const [files, categories] = await Promise.all([
    prisma.file.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { downloadCount: 'desc' },
    }),
    prisma.category.findMany({
      orderBy: { nameKm: 'asc' },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FolderDown className="w-4 h-4" />
            <span>OFFICIAL REPOSITORY & CLEAN TOOLS</span>
          </div>
          <h1 className="text-3xl font-black text-white">ឯកសារ និង Tools</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ទាញយក Windows Clean ISO, Diagnostic Tools, Installers ធានាគ្មានមេរោគ
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <a
          href="/files"
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            !filterType && !catSlug
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
              : 'bg-dark-850 text-slate-300 hover:bg-dark-800 border border-slate-700/60'
          }`}
        >
          ទាំងអស់ ({files.length})
        </a>
        <a
          href="/files?filter=free"
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'free'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
              : 'bg-dark-850 text-slate-300 hover:bg-dark-800 border border-slate-700/60'
          }`}
        >
          Free Downloads
        </a>
        <a
          href="/files?filter=premium"
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'premium'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
              : 'bg-dark-850 text-slate-300 hover:bg-dark-800 border border-slate-700/60'
          }`}
        >
          Premium Tools
        </a>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map((file) => (
          <FileCard key={file.id} file={file as any} />
        ))}
      </div>
    </div>
  );
}

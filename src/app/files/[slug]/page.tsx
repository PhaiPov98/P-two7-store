import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Download,
  FolderDown,
  HardDrive,
  Cpu,
  History,
  ShieldCheck,
  CheckCircle2,
  Gift,
  ArrowLeft,
  FileCode,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import FileDownloadButton from '@/components/file/FileDownloadButton';
import { formatPrice, KHMER_TEXT } from '@/lib/translations';

export const revalidate = 0;

export default async function FileDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const file = await prisma.file.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!file) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors">
          {KHMER_TEXT.nav.home}
        </Link>
        <span>/</span>
        <Link href="/files" className="hover:text-white transition-colors">
          {KHMER_TEXT.nav.files}
        </Link>
        <span>/</span>
        <span className="text-slate-200 truncate">{file.title}</span>
      </div>

      {/* Main File Box */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/10">
              <FileCode className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {file.fileType}
                </span>
                {file.isFree ? (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Gift className="w-3 h-3" /> FREE
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                    {formatPrice(file.price)}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{file.title}</h1>
              <p className="text-xs text-slate-400 mt-1">ប្រភេទ: {file.category?.nameKm}</p>
            </div>
          </div>

          <div className="flex-shrink-0">
            <FileDownloadButton file={file as any} />
          </div>
        </div>

        {/* Spec Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-dark-900 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">ជំនាន់ (Version)</span>
            <span className="font-bold text-white text-sm">{file.version}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">ទំហំឯកសារ (Size)</span>
            <span className="font-bold text-white text-sm">{file.fileSize}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">ទម្រង់ (Format)</span>
            <span className="font-bold text-purple-400 text-sm">{file.fileType}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">ទាញយករួច (Downloads)</span>
            <span className="font-bold text-emerald-400 text-sm">
              {file.downloadCount.toLocaleString()} ដង
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white">ការពិពណ៌នាអំពីឯកសារ</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {file.description}
          </p>
        </div>

        {/* Requirements & Changelog */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> តម្រូវការប្រព័ន្ធ (Requirements)
            </h4>
            <p className="text-xs text-slate-300 bg-dark-850 p-4 rounded-xl border border-slate-800 whitespace-pre-line leading-relaxed">
              {file.requirements || 'Windows 10/11 64-bit'}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4" /> កំណត់ត្រាផ្លាស់ប្តូរ (Changelog)
            </h4>
            <p className="text-xs text-slate-300 bg-dark-850 p-4 rounded-xl border border-slate-800 whitespace-pre-line leading-relaxed font-mono">
              {file.changelog || '- Original Release'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

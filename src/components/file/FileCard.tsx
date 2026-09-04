'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileCode, CheckCircle2, HardDrive, Shield, ArrowRight, Gift } from 'lucide-react';
import { DigitalFile } from '@/types';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, KHMER_TEXT } from '@/lib/translations';

interface FileCardProps {
  file: DigitalFile;
}

export default function FileCard({ file }: FileCardProps) {
  const [downloading, setDownloading] = useState(false);
  const { success, error, info } = useToast();
  const { user } = useAuth();

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!file.isFree && !user) {
      info('សូមចូលគណនី', 'ដើម្បីទាញយកឯកសារ Paid សូមចូលគណនីរបស់អ្នកជាមុនសិន');
      return;
    }

    try {
      setDownloading(true);
      info('កំពុងទាញយក...', `កំពុងរៀបចំឯកសារ ${file.title}`);
      
      // Direct navigation to download endpoint
      window.open(`/api/download/${file.id}`, '_blank');
      success('កំពុងទាញយក!', `ឯកសារ ${file.title} ត្រូវបានបើកដំណើរការទាញយក`);
    } catch (err) {
      error('មានបញ្ហា', 'មិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើទាញយកបានទេ');
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'ISO':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'ZIP':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'EXE':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between border border-slate-800 hover:border-purple-500/40 transition-all duration-300">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getBadgeColor(file.fileType)}`}>
            {file.fileType}
          </span>
          {file.isFree ? (
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Gift className="w-3 h-3" />
              FREE
            </span>
          ) : (
            <span className="text-[11px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
              {formatPrice(file.price)}
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/files/${file.slug}`} className="block group">
          <h3 className="font-bold text-base text-white group-hover:text-purple-400 transition-colors line-clamp-1">
            {file.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
          {file.description}
        </p>

        {/* Meta Info */}
        <div className="grid grid-cols-3 gap-2 mt-4 py-2 px-3 rounded-xl bg-dark-850/80 border border-slate-800 text-[11px] text-slate-300">
          <div>
            <span className="text-slate-400 block text-[10px]">Version</span>
            <span className="font-semibold text-white truncate block">{file.version}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">ទំហំឯកសារ</span>
            <span className="font-semibold text-white truncate block">{file.fileSize}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Downloads</span>
            <span className="font-semibold text-emerald-400 truncate block">
              {(file.downloadCount / 1000).toFixed(1)}k
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
        {/* Uiverse.io cloud-download button by RashadGhzi */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          title={downloading ? 'កំពុងទាញយក...' : KHMER_TEXT.actions.download}
          aria-label={downloading ? 'កំពុងទាញយក...' : KHMER_TEXT.actions.download}
          className="group relative inline-flex items-center justify-center w-[44px] h-[44px] rounded-full shadow-lg
                     transform transition-all duration-300
                     focus:outline-none focus:ring-4 focus:ring-blue-500/40
                     hover:scale-110 hover:shadow-xl
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
          style={{
            background: file.isFree
              ? 'linear-gradient(135deg, #10b981, #06b6d4)'
              : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          }}
        >
          {downloading ? (
            <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg
              width="22px" height="22px"
              className="rotate-0 transition ease-out duration-300 scale-100 group-hover:-rotate-45 group-hover:scale-75"
              viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd" clipRule="evenodd"
                d="M8 10C8 7.79086 9.79086 6 12 6C14.2091 6 16 7.79086 16 10V11H17C18.933 11 20.5 12.567 20.5 14.5C20.5 16.433 18.933 18 17 18H16.9C16.3477 18 15.9 18.4477 15.9 19C15.9 19.5523 16.3477 20 16.9 20H17C20.0376 20 22.5 17.5376 22.5 14.5C22.5 11.7793 20.5245 9.51997 17.9296 9.07824C17.4862 6.20213 15.0003 4 12 4C8.99974 4 6.51381 6.20213 6.07036 9.07824C3.47551 9.51997 1.5 11.7793 1.5 14.5C1.5 17.5376 3.96243 20 7 20H7.1C7.65228 20 8.1 19.5523 8.1 19C8.1 18.4477 7.65228 18 7.1 18H7C5.067 18 3.5 16.433 3.5 14.5C3.5 12.567 5.067 11 7 11H8V10ZM13 11C13 10.4477 12.5523 10 12 10C11.4477 10 11 10.4477 11 11V16.5858L9.70711 15.2929C9.31658 14.9024 8.68342 14.9024 8.29289 15.2929C7.90237 15.6834 7.90237 16.3166 8.29289 16.7071L11.2929 19.7071C11.6834 20.0976 12.3166 20.0976 12.7071 19.7071L15.7071 16.7071C16.0976 16.3166 16.0976 15.6834 15.7071 15.2929C15.3166 14.9024 14.6834 14.9024 14.2929 15.2929L13 16.5858V11Z"
                fill="#FFFFFF"
              />
            </svg>
          )}
        </button>

        <Link
          href={`/files/${file.slug}`}
          className="flex-1 btn-uiverse-mohsinech py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
          title="មើលព័ត៌មានបន្ថែម"
        >
          <span data-text="មើលព័ត៌មាន →">
            មើលព័ត៌មាន →
          </span>
        </Link>
      </div>
    </div>
  );
}

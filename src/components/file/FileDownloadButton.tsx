'use client';

import React, { useState } from 'react';
import { DigitalFile } from '@/types';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { KHMER_TEXT } from '@/lib/translations';

export default function FileDownloadButton({ file }: { file: DigitalFile }) {
  const [downloading, setDownloading] = useState(false);
  const { success, error, info } = useToast();
  const { user } = useAuth();

  const handleDownload = async () => {
    if (!file.isFree && !user) {
      info('សូមចូលគណនី', 'ដើម្បីទាញយកឯកសារនេះ សូមចូលគណនីរបស់អ្នកជាមុនសិន');
      return;
    }

    try {
      setDownloading(true);
      info('កំពុងរៀបចំ...', `កំពុងទាញយក ${file.title}`);

      const res = await fetch(`/api/download/${file.id}`);
      if (!res.ok) {
        const errData = await res.json();
        error('មិនអាចទាញយកបានទេ', errData.error || 'សូមព្យាយាមម្តងទៀត');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.slug}.${file.fileType.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      success('ទាញយកជោគជ័យ!', `ឯកសារ ${file.title} ត្រូវបានទាញយករួចរាល់`);
    } catch (err) {
      error('មានបញ្ហា', 'មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ');
    } finally {
      setDownloading(false);
    }
  };

  const gradientFrom = file.isFree ? '#10b981' : '#3b82f6';
  const gradientTo   = file.isFree ? '#06b6d4' : '#8b5cf6';

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      title={downloading ? 'កំពុងទាញយក...' : KHMER_TEXT.actions.downloadNow}
      aria-label={downloading ? 'កំពុងទាញយក...' : KHMER_TEXT.actions.downloadNow}
      className="group relative inline-flex items-center justify-center w-[46px] h-[46px] rounded-full shadow-lg
                 transform scale-100 transition-all duration-300
                 focus:outline-none focus:ring-4 focus:ring-blue-500/40
                 hover:scale-110 hover:shadow-blue-500/30 hover:shadow-xl
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      {downloading ? (
        /* Spinner while downloading */
        <svg
          className="animate-spin w-[26px] h-[26px] text-white"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : (
        /* Cloud-download icon from Uiverse.io by RashadGhzi */
        <svg
          width="26px"
          height="26px"
          className="rotate-0 transition ease-out duration-300 scale-100 group-hover:-rotate-45 group-hover:scale-75"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8 10C8 7.79086 9.79086 6 12 6C14.2091 6 16 7.79086 16 10V11H17C18.933 11 20.5 12.567 20.5 14.5C20.5 16.433 18.933 18 17 18H16.9C16.3477 18 15.9 18.4477 15.9 19C15.9 19.5523 16.3477 20 16.9 20H17C20.0376 20 22.5 17.5376 22.5 14.5C22.5 11.7793 20.5245 9.51997 17.9296 9.07824C17.4862 6.20213 15.0003 4 12 4C8.99974 4 6.51381 6.20213 6.07036 9.07824C3.47551 9.51997 1.5 11.7793 1.5 14.5C1.5 17.5376 3.96243 20 7 20H7.1C7.65228 20 8.1 19.5523 8.1 19C8.1 18.4477 7.65228 18 7.1 18H7C5.067 18 3.5 16.433 3.5 14.5C3.5 12.567 5.067 11 7 11H8V10ZM13 11C13 10.4477 12.5523 10 12 10C11.4477 10 11 10.4477 11 11V16.5858L9.70711 15.2929C9.31658 14.9024 8.68342 14.9024 8.29289 15.2929C7.90237 15.6834 7.90237 16.3166 8.29289 16.7071L11.2929 19.7071C11.6834 20.0976 12.3166 20.0976 12.7071 19.7071L15.7071 16.7071C16.0976 16.3166 16.0976 15.6834 15.7071 15.2929C15.3166 14.9024 14.6834 14.9024 14.2929 15.2929L13 16.5858V11Z"
            fill="#FFFFFF"
          />
        </svg>
      )}
    </button>
  );
}

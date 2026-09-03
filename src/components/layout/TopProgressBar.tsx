'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset loading when route changes
    setLoading(false);
    setProgress(100);
    const timer = setTimeout(() => {
      setProgress(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('/#') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:') &&
        target.getAttribute('target') !== '_blank'
      ) {
        // Only trigger if navigating to a different path
        if (href !== window.location.pathname) {
          setLoading(true);
          setProgress(25);

          const step1 = setTimeout(() => setProgress(65), 150);
          const step2 = setTimeout(() => setProgress(85), 350);

          return () => {
            clearTimeout(step1);
            clearTimeout(step2);
          };
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-[3px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_12px_rgba(59,130,246,0.8)] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}

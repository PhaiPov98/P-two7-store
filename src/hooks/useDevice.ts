'use client';

import { useState, useEffect } from 'react';

export function useDevice() {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDevice('mobile');
        setIsMobile(true);
        setIsDesktop(false);
      } else if (width < 1024) {
        setDevice('tablet');
        setIsMobile(false);
        setIsDesktop(false);
      } else {
        setDevice('desktop');
        setIsMobile(false);
        setIsDesktop(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { device, isMobile, isDesktop };
}

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollRestorer() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set scroll restoration to manual to prevent browser/Next.js conflicts
    if ('scrollRestoration' in window.history) {
      try {
        window.history.scrollRestoration = 'manual';
      } catch (e) {}
    }

    const win = window as any;
    win.__scrollCache = win.__scrollCache || {};

    // Restore scroll position from memory cache, cookie, or session storage
    let targetScroll = win.__scrollCache[pathname] || 0;

    // Read from cookies (highly reliable sandbox fallback)
    try {
      const cookiePrefix = `scroll-${pathname}=`;
      const match = document.cookie.split(';').find(c => c.trim().startsWith(cookiePrefix));
      if (match) {
        targetScroll = Math.max(targetScroll, parseInt(match.trim().substring(cookiePrefix.length), 10));
      }
    } catch (e) {}

    // Read from sessionStorage
    try {
      const savedScroll = sessionStorage.getItem(`scroll-${pathname}`);
      if (savedScroll) {
        targetScroll = Math.max(targetScroll, parseInt(savedScroll, 10));
      }
    } catch (e) {}

    if (targetScroll > 0) {
      let attempts = 0;
      const maxAttempts = 30; // 30 * 50ms = 1.5 seconds max polling
      const interval = setInterval(() => {
        window.scrollTo(0, targetScroll);
        attempts++;
        if (Math.abs(window.scrollY - targetScroll) <= 5 || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }

    const handleScroll = () => {
      try {
        const currentScroll = window.scrollY;
        if (currentScroll > 0) {
          win.__scrollCache[pathname] = currentScroll;
          // Set cookie backup
          document.cookie = `scroll-${pathname}=${currentScroll}; path=/; max-age=3600; SameSite=Lax`;
          // Set sessionStorage backup
          sessionStorage.setItem(`scroll-${pathname}`, currentScroll.toString());
        }
      } catch (e) {}
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  return null;
}

'use client';

import { useEffect, useCallback } from 'react';
import { useAutomotiveStore } from '@/lib/store/automotiveStore';

export function useAutomotiveMode() {
  const { isAutomotive, setAutomotive } = useAutomotiveStore();

  const toggleAutomotiveMode = useCallback(() => {
    const nextVal = !isAutomotive;
    setAutomotive(nextVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('automotive-mode', nextVal ? 'true' : 'false');
    }
  }, [isAutomotive, setAutomotive]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check local storage override
    const stored = localStorage.getItem('automotive-mode');
    if (stored !== null) {
      setAutomotive(stored === 'true');
      return;
    }

    // 2. Check URL query parameters
    const params = new URLSearchParams(window.location.search);
    if (params.get('automotive') === '1' || params.get('automotive') === 'true') {
      setAutomotive(true);
      localStorage.setItem('automotive-mode', 'true');
      return;
    }

    // 3. User-Agent hints
    const ua = navigator.userAgent.toLowerCase();
    const isCarUA = 
      ua.includes('carplay') || 
      ua.includes('android auto') || 
      ua.includes('androidauto') || 
      ua.includes('smartdevicelink') || 
      ua.includes('carbrowser') || 
      ua.includes('qnx') || 
      ua.includes('automotive');

    // 4. Resolution hints (e.g., 800x480 up to 1280x800 in landscape)
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isLandscape = w > h;
    const isCarRes = 
      isLandscape &&
      w >= 800 && 
      w <= 1280 && 
      h >= 480 && 
      h <= 800;

    if (isCarUA || isCarRes) {
      setAutomotive(true);
      localStorage.setItem('automotive-mode', 'true');
    }
  }, [setAutomotive]);

  return {
    isAutomotive,
    toggleAutomotiveMode,
  };
}

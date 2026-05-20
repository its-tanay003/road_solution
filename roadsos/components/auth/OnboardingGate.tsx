'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { OnboardingModal } from './OnboardingModal';

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const pathname = usePathname();

  const checkProfile = () => {
    // If the path is admin, bypass onboarding check completely
    if (pathname && pathname.startsWith('/admin')) {
      setIsOpen(false);
      setChecking(false);
      return;
    }

    const saved = localStorage.getItem('roadsos-profile');
    if (!saved) {
      setIsOpen(true);
    } else {
      try {
        const parsed = JSON.parse(saved);
        const hasName = !!parsed.name?.trim();
        const hasPhone = !!parsed.phone?.trim();
        const hasContacts =
          Array.isArray(parsed.contacts) &&
          parsed.contacts.length >= 2 &&
          parsed.contacts.every((c: any) => c.name?.trim() && c.phone?.trim());
        
        if (!hasName || !hasPhone || !hasContacts) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      } catch {
        setIsOpen(true);
      }
    }
    setChecking(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      checkProfile();

      // Listen for custom events or updates (e.g., if settings page saves changes)
      const handleProfileUpdate = () => {
        checkProfile();
      };
      
      window.addEventListener('storage', handleProfileUpdate);
      window.addEventListener('roadsos-profile-updated', handleProfileUpdate);
      
      return () => {
        window.removeEventListener('storage', handleProfileUpdate);
        window.removeEventListener('roadsos-profile-updated', handleProfileUpdate);
      };
    }
  }, [pathname]); // Re-run profile check on route changes

  const handleComplete = (data: any) => {
    localStorage.setItem(
      'roadsos-profile',
      JSON.stringify({
        ...data,
        shareLocation: true,
        shareMedical: true,
        shareCamera: true,
        sosHoldMs: 3000,
        shakeThreshold: 4,
        language: 'en',
        theme: 'auto',
        notifications: true,
      })
    );
    setIsOpen(false);
    
    // Dispatch a custom event to notify other components (like Settings page)
    window.dispatchEvent(new Event('roadsos-profile-updated'));
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
          <p className="text-sm font-black text-gray-400 tracking-tight">Securing your Golden Hour...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <OnboardingModal isOpen={isOpen} onComplete={handleComplete} />
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { OnboardingModal } from './OnboardingModal';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const pathname = usePathname();

  const checkProfile = async () => {
    if (pathname && pathname.startsWith('/admin')) {
      setIsOpen(false);
      setCheckingProfile(false);
      return;
    }

    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        const profile = data.profile;
        const contacts = data.contacts;

        // Check completeness
        const hasName = !!profile?.full_name?.trim();
        const hasPhone = !!profile?.phone?.trim();
        const hasContacts = Array.isArray(contacts) && contacts.length >= 2;

        if (!hasName || !hasPhone || !hasContacts) {
          setIsOpen(true);
        } else {
          // Cache it in localStorage
          localStorage.setItem('roadsos-profile', JSON.stringify({
            name: profile.full_name,
            phone: profile.phone,
            bloodGroup: profile.blood_group,
            conditions: profile.medical_conditions?.join(', ') || '',
            address: profile.home_address || '',
            contacts: contacts.map((c: any) => ({
              name: c.name,
              phone: c.phone,
              relation: c.relationship
            }))
          }));
          setIsOpen(false);
        }
      } else {
        setIsOpen(true);
      }
    } catch (err) {
      console.warn('[OnboardingGate] Failed to fetch profile from DB:', err);
      // Fallback check on localStorage if API is down
      const saved = localStorage.getItem('roadsos-profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const hasName = !!parsed.name?.trim();
          const hasPhone = !!parsed.phone?.trim();
          const hasContacts = Array.isArray(parsed.contacts) && parsed.contacts.length >= 2;
          if (!hasName || !hasPhone || !hasContacts) {
            setIsOpen(true);
          } else {
            setIsOpen(false);
          }
        } catch {
          setIsOpen(true);
        }
      } else {
        setIsOpen(true);
      }
    } finally {
      setCheckingProfile(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      checkProfile();
    } else if (status === 'unauthenticated') {
      setCheckingProfile(false);
    }
  }, [status, pathname]);

  const handleComplete = async (data: any) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to save profile to database');
      }

      // Save to local storage as cache
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
      window.dispatchEvent(new Event('roadsos-profile-updated'));
    } catch (err) {
      console.error('[OnboardingGate] Save profile error:', err);
      alert('Failed to save profile. Please check your connection and try again.');
    }
  };

  // 1. Loading state
  if (status === 'loading' || (status === 'authenticated' && checkingProfile)) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
          <p className="text-sm font-black text-gray-400 tracking-tight">Securing your Golden Hour...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state - Premium Gateway Page
  if (status === 'unauthenticated' && !(pathname && pathname.startsWith('/admin'))) {
    return (
      <div className="min-h-screen w-full bg-gray-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Decorative ambient light */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 -translate-y-1/2 w-[250px] h-[250px] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md bg-gray-900/60 border border-gray-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center relative z-10"
        >
          {/* LOGO */}
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 mb-6 relative">
            <Shield size={32} className="text-red-500" />
            <div className="absolute -inset-0.5 bg-red-500/20 rounded-2xl blur opacity-30 animate-pulse pointer-events-none" />
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight mb-2">ROADSoS</h1>
          <p className="text-gray-400 text-sm max-w-xs mb-8">
            Your instant emergency response lifeline. Track assets, broadcast beacons, and stream real-time distress signals.
          </p>

          <div className="w-full space-y-3.5">
            <button
              onClick={() => signIn('google')}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-bold px-4 py-3.5 rounded-2xl shadow-lg transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.324 0-6.019-2.694-6.019-6.018 0-3.324 2.695-6.019 6.019-6.019 1.488 0 2.846.542 3.896 1.435l3.13-3.13C19.14 2.923 15.942 2 12.24 2 6.58 2 2 6.58 2 12.24S6.58 22.48 12.24 22.48c5.813 0 9.873-4.086 9.873-9.873 0-.665-.06-1.3-.17-1.91l-9.703-.412z"/>
              </svg>
              Sign In with Google
            </button>

            <button
              onClick={() => signIn('apple')}
              className="w-full flex items-center justify-center gap-3 bg-gray-950 hover:bg-black text-white border border-gray-800 font-bold px-4 py-3.5 rounded-2xl shadow-lg transition-all"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.56 2.95-1.39z"/>
              </svg>
              Sign In with Apple
            </button>
          </div>

          <div className="mt-8 text-xs text-gray-500 max-w-[280px]">
            By continuing, you agree to allow ROADSoS to access your public profile for secure onboarding.
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. Authenticated state
  return (
    <>
      {children}
      <OnboardingModal isOpen={isOpen} onComplete={handleComplete} />
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Shield, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingCredentials, setLoadingCredentials] = useState(false);

  const checkProfile = async () => {
    // Skip checks for admin and control room routes
    if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/control-room'))) {
      setCheckingProfile(false);
      return;
    }

    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        const profile = data.profile;
        const contacts = data.contacts;

        // Check completeness (blood group set and at least 2 emergency contacts)
        const hasBloodGroup = profile?.blood_group && profile.blood_group !== 'Unknown';
        const hasContacts = Array.isArray(contacts) && contacts.length >= 2;

        if (!hasBloodGroup || !hasContacts) {
          // If profile is incomplete, redirect to /onboarding unless already there
          if (pathname !== '/onboarding') {
            router.push('/onboarding');
          }
        } else {
          // If complete, save to localStorage cache and redirect to home if on /onboarding
          localStorage.setItem('roadsos-profile', JSON.stringify({
            name: profile.full_name,
            phone: profile.phone,
            bloodGroup: profile.blood_group,
            conditions: profile.medical_conditions?.join(', ') || '',
            allergies: profile.allergies?.join(', ') || '',
            dob: profile.date_of_birth || '',
            address: profile.home_address || '',
            contacts: contacts.map((c: any) => ({
              name: c.name,
              phone: c.phone,
              relation: c.relationship
            }))
          }));

          if (pathname === '/onboarding') {
            router.push('/');
          }
        }
      } else {
        if (pathname !== '/onboarding') {
          router.push('/onboarding');
        }
      }
    } catch (err) {
      console.warn('[OnboardingGate] Failed to fetch profile from DB:', err);
      // Fallback cache check
      const saved = localStorage.getItem('roadsos-profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const hasBloodGroup = parsed.bloodGroup && parsed.bloodGroup !== 'Unknown';
          const hasContacts = Array.isArray(parsed.contacts) && parsed.contacts.length >= 2;
          if (!hasBloodGroup || !hasContacts) {
            if (pathname !== '/onboarding') {
              router.push('/onboarding');
            }
          } else if (pathname === '/onboarding') {
            router.push('/');
          }
        } catch {
          if (pathname !== '/onboarding') {
            router.push('/onboarding');
          }
        }
      } else {
        if (pathname !== '/onboarding') {
          router.push('/onboarding');
        }
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

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    setLoadingCredentials(true);
    // Credentials provider is not configured in auth.ts, so this acts as a beautiful premium mock signup/login flow
    setTimeout(() => {
      setLoadingCredentials(false);
      toast.info('Credential sign-in is mocked. Please use Google or Apple to sign in securely.');
    }, 1200);
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
  if (status === 'unauthenticated' && !(pathname && (pathname.startsWith('/admin') || pathname.startsWith('/control-room')))) {
    return (
      <div className="min-h-screen w-full bg-gray-950 flex flex-col justify-center items-center p-4 relative overflow-y-auto">
        {/* Decorative ambient light */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 -translate-y-1/2 w-[250px] h-[250px] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md bg-gray-900/60 border border-gray-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center relative z-10 my-8"
        >
          {/* LOGO */}
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 mb-6 relative">
            <Shield size={32} className="text-red-500" />
            <div className="absolute -inset-0.5 bg-red-500/20 rounded-2xl blur opacity-30 animate-pulse pointer-events-none" />
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight mb-2">ROADSoS</h1>
          <p className="text-gray-400 text-sm max-w-xs mb-6">
            Emergency Intelligence. Everywhere.
          </p>

          <div className="relative w-full mb-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <span className="relative px-3 bg-gray-900/90 text-xs font-bold text-gray-500 uppercase tracking-widest">Sign in to continue</span>
          </div>

          <div className="w-full space-y-3.5">
            {/* Google Provider Button */}
            <button
              onClick={() => signIn('google')}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-bold px-4 py-3.5 rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 duration-150"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.324 0-6.019-2.694-6.019-6.018 0-3.324 2.695-6.019 6.019-6.019 1.488 0 2.846.542 3.896 1.435l3.13-3.13C19.14 2.923 15.942 2 12.24 2 6.58 2 2 6.58 2 12.24S6.58 22.48 12.24 22.48c5.813 0 9.873-4.086 9.873-9.873 0-.665-.06-1.3-.17-1.91l-9.703-.412z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative w-full flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <span className="relative px-3 bg-gray-900/90 text-xs font-bold text-gray-500 uppercase tracking-widest">or</span>
            </div>

            {/* Apple Provider Button */}
            <button
              onClick={() => signIn('apple')}
              className="w-full flex items-center justify-center gap-3 bg-black hover:bg-neutral-900 text-white border border-neutral-800 font-bold px-4 py-3.5 rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 duration-150"
            >
              <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.56 2.95-1.39z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="relative w-full my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <span className="relative px-3 bg-gray-900/90 text-xs font-bold text-gray-500 uppercase tracking-widest">or</span>
          </div>

          {/* Existing credentials form (mock) */}
          <form onSubmit={handleCredentialsSubmit} className="w-full space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-gray-950/80 border border-gray-800/80 rounded-[10px] pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-950/80 border border-gray-800/80 rounded-[10px] pl-11 pr-11 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingCredentials}
              className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-3.5 rounded-2xl shadow-lg transition-all"
            >
              {loadingCredentials ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-400">
            Don't have an account? <button className="text-orange-500 font-bold hover:underline">Create account</button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. Authenticated state
  return (
    <>
      {children}
    </>
  );
}

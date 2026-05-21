'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { useSOSStore } from '@/lib/store/sosStore';
import '@/lib/i18n'; // Force i18n initialization
import { OnboardingGate } from '@/components/auth/OnboardingGate';

// Theme helper to inject high-contrast emergency styles when SOS is active
function SOSThemeWatcher({ children }: { children: React.ReactNode }) {
  const { status } = useSOSStore();
  const { theme, setTheme } = useTheme();
  const prevThemeRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    if (status === 'active' || status === 'countdown' || status === 'acknowledged') {
      // Save current theme before overriding
      if (theme !== 'emergency') {
        prevThemeRef.current = theme;
        setTheme('emergency');
      }
    } else {
      // Revert to previous theme
      if (theme === 'emergency' && prevThemeRef.current) {
        setTheme(prevThemeRef.current);
      } else if (theme === 'emergency') {
        setTheme('dark');
      }
    }
  }, [status, theme, setTheme]);

  return <>{children}</>;
}

// RTL helper to sync html language and direction attributes
function RTLWatcher({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      html.setAttribute('lang', i18n.language || 'en');
      
      if (i18n.language === 'ar') {
        html.setAttribute('dir', 'rtl');
        html.classList.add('rtl');
      } else {
        html.setAttribute('dir', 'ltr');
        html.classList.remove('rtl');
      }
    }
  }, [i18n.language]);

  return <OnboardingGate>{children}</OnboardingGate>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        themes={['light', 'dark', 'emergency']}
      >
        <SOSThemeWatcher>
          <RTLWatcher>
            {children}
          </RTLWatcher>
        </SOSThemeWatcher>
      </NextThemesProvider>
    </SessionProvider>
  );
}

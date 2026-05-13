import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { hapticLight, announce } from '../lib/accessibilityHelpers';

// ── SVG Icons ──────────────────────────────────────────────────────
const BellIcon = ({ count }: { count: number }) => (
  <div style={{ position: 'relative' }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
    {count > 0 && (
      <span style={{
        position: 'absolute', top: -3, right: -3,
        background: 'var(--red)',
        color: '#fff',
        fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700,
        minWidth: 14, height: 14,
        borderRadius: 7,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 3px',
        lineHeight: 1,
      }}>
        {count > 9 ? '9+' : count}
      </span>
    )}
  </div>
);

const GlobeIcon = ({ lang }: { lang: string }) => (
  <div style={{ position: 'relative' }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 3c-4 0-7 4-7 9s3 9 7 9 7-4 7-9-3-9-7-9z" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
    <span style={{
      position: 'absolute', bottom: -2, right: -4,
      fontSize: 8, fontFamily: 'var(--font-mono)', fontWeight: 700,
      color: 'var(--saffron)',
      lineHeight: 1,
      letterSpacing: '0.02em',
    }}>
      {lang.toUpperCase()}
    </span>
  </div>
);

const GearIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
      stroke="currentColor" strokeWidth="1.8"/>
  </svg>
);

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Page title map ──────────────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  '/map':                 'Live Map',
  '/assistant':           'AI Help',
  '/profile':             'Profile',
  '/settings':            'Settings',
  '/sos-active':          'SOS Active',
  '/dispatched':          'Dispatched',
  '/bystander':           'Bystander Mode',
  '/emergency-contacts':  'Emergency Contacts',
  '/medical':             'Medical Records',
  '/first-aid':           'First Aid Guide',
  '/vision':              'Vision 2030',
  '/impact-data':         'Impact Data',
  '/good-samaritan':      'Good Samaritan Guide',
  '/security':            'Security',
  '/hospitals':           'Hospitals',
  '/analytics':           'Analytics',
};

interface TopBarProps {
  notificationCount?: number;
  currentLang?: string;
}

export function TopBar({ notificationCount = 0, currentLang = 'EN' }: TopBarProps) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // ── Scroll-aware background ──────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Hide on full-screen pages ────────────────────────────────────
  const HIDDEN_PATHS = ['/sos-active', '/login'];
  if (HIDDEN_PATHS.some(p => location.pathname.startsWith(p))) return null;

  const isHome = location.pathname === '/';
  const pageTitle = PAGE_TITLES[location.pathname] ??
    Object.entries(PAGE_TITLES).find(([k]) => location.pathname.startsWith(k))?.[1] ??
    'ROADSoS';

  const iconBtnStyle: React.CSSProperties = {
    width: 44, height: 44,
    borderRadius: '50%',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 150ms ease, color 150ms ease',
    WebkitTapHighlightColor: 'transparent',
    flexShrink: 0,
  };

  return (
    <motion.header
      animate={{ backgroundColor: scrolled ? 'rgba(8,12,20,0.96)' : 'transparent' }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 'var(--sp-4)',
        paddingRight: 'var(--sp-4)',
        zIndex: 200,
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      }}
    >
      {/* Left — logo or back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flex: 1, minWidth: 0 }}>
        {isHome ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, minWidth: 0 }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 18,
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}>
              ROAD<span style={{ color: 'var(--red)' }}>SoS</span>
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 10,
              color: 'var(--text-secondary)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}>
              Emergency Intelligence
            </span>
          </div>
        ) : (
          <>
            <button
              onClick={() => { hapticLight(); navigate(-1); announce(`Going back`); }}
              style={iconBtnStyle}
              aria-label="Go back"
            >
              <BackIcon />
            </button>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 17,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {pageTitle}
            </span>
          </>
        )}
      </div>

      {/* Right — notifications, language, settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <button
          style={iconBtnStyle}
          aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ''}`}
          onClick={() => { hapticLight(); navigate('/notifications'); announce('Opening notifications'); }}
        >
          <BellIcon count={notificationCount} />
        </button>

        <button
          style={iconBtnStyle}
          aria-label={`Language: ${currentLang}. Tap to change`}
          onClick={() => { hapticLight(); announce('Language switcher opened'); }}
        >
          <GlobeIcon lang={currentLang} />
        </button>

        <button
          style={iconBtnStyle}
          aria-label="Settings"
          onClick={() => { hapticLight(); navigate('/settings'); announce('Opening settings'); }}
        >
          <GearIcon />
        </button>
      </div>
    </motion.header>
  );
}

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { hapticLight, announce } from '../lib/accessibilityHelpers';
import './TopBar.css';

// ── SVG Icons ──────────────────────────────────────────────────────
const BellIcon = ({ count }: { count: number }) => (
  <div className="relative">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
    {count > 0 && (
      <span className="notification-badge">
        {count > 9 ? '9+' : count}
      </span>
    )}
  </div>
);

const GlobeIcon = ({ lang }: { lang: string }) => (
  <div className="relative">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 3c-4 0-7 4-7 9s3 9 7 9 7-4 7-9-3-9-7-9z" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
    <span className="lang-badge">
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

  return (
    <motion.header
      className={`top-bar ${scrolled ? 'scrolled' : ''}`}
    >
      {/* Left — logo or back */}
      <div className="top-bar-left">
        {isHome ? (
          <div className="top-bar-logo">
            <span className="top-bar-logo-main">
              ROAD<span className="sos-accent">SoS</span>
            </span>
            <span className="top-bar-logo-sub">
              Emergency Intelligence
            </span>
          </div>
        ) : (
          <>
            <button
              onClick={() => { hapticLight(); navigate(-1); announce(`Going back`); }}
              className="icon-btn"
              aria-label="Go back"
            >
              <BackIcon />
            </button>
            <span className="top-bar-title">
              {pageTitle}
            </span>
          </>
        )}
      </div>

      {/* Right — notifications, language, settings */}
      <div className="top-bar-right">
        <button
          className="icon-btn"
          aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ''}`}
          onClick={() => { hapticLight(); navigate('/notifications'); announce('Opening notifications'); }}
        >
          <BellIcon count={notificationCount} />
        </button>

        <button
          className="icon-btn"
          aria-label={`Language: ${currentLang}. Tap to change`}
          onClick={() => { hapticLight(); announce('Language switcher opened'); }}
        >
          <GlobeIcon lang={currentLang} />
        </button>

        <button
          className="icon-btn"
          aria-label="Settings"
          onClick={() => { hapticLight(); navigate('/settings'); announce('Opening settings'); }}
        >
          <GearIcon />
        </button>
      </div>
    </motion.header>
  );
}

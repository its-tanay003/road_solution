import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticLight, announce } from '../lib/accessibilityHelpers';

// ── SVG Icons ─────────────────────────────────────────────────────
const HomeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <path d="M4 11.5L14 3l10 8.5V24a1 1 0 01-1 1H5a1 1 0 01-1-1V11.5z"
      stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
    <rect x="10" y="16" width="8" height="9" rx="1"
      stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
  </svg>
);

const MapIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <path d="M14 3C10.13 3 7 6.13 7 10c0 5.25 7 15 7 15s7-9.75 7-15c0-3.87-3.13-7-7-7z"
      stroke="currentColor" strokeWidth="1.8" fill="none"/>
    <circle cx="14" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
  </svg>
);

const AIIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <rect x="3" y="6" width="22" height="16" rx="3"
      stroke="currentColor" strokeWidth="1.8" fill="none"/>
    <path d="M9 12h10M9 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M14 6V3M10 6V4M18 6V4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const ProfileIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <circle cx="14" cy="9" r="4.5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
    <path d="M4 25c0-5.523 4.477-10 10-10s10 4.477 10 10"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
  </svg>
);

// ── Tab definition ─────────────────────────────────────────────────
interface Tab {
  id:    string;
  path:  string;
  label: string;
  icon:  React.ReactNode;
  ariaLabel: string;
}

const TABS: Tab[] = [
  { id: 'home',    path: '/',          label: 'Home',    icon: <HomeIcon />,    ariaLabel: 'Home' },
  { id: 'map',     path: '/map',       label: 'Map',     icon: <MapIcon />,     ariaLabel: 'Live Map' },
  // centre slot is SOS — rendered separately as empty spacer
  { id: 'ai',      path: '/assistant', label: 'AI Help', icon: <AIIcon />,      ariaLabel: 'AI Assistant' },
  { id: 'profile', path: '/profile',   label: 'Profile', icon: <ProfileIcon />, ariaLabel: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();

  // Hide nav on full-screen / SOS pages
  const HIDDEN_PATHS = ['/sos-active', '/dispatched', '/login'];
  if (HIDDEN_PATHS.some(p => location.pathname.startsWith(p))) return null;

  const activeId = TABS.find(t => t.path === '/'
    ? location.pathname === '/'
    : location.pathname.startsWith(t.path)
  )?.id ?? '';

  const handleTabClick = (label: string) => {
    hapticLight();
    announce(`Navigated to ${label}`);
  };

  return (
    <nav
      aria-label="Primary navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: `calc(72px + env(safe-area-inset-bottom, 0px))`,
        background: 'rgba(8,12,20,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        paddingTop: 6,
        paddingBottom: 0,
        paddingLeft: 8,
        paddingRight: 8,
        zIndex: 200,
      }}
    >
      {/* Left two tabs */}
      {TABS.slice(0, 2).map(tab => (
        <NavTabItem
          key={tab.id}
          tab={tab}
          isActive={activeId === tab.id}
          onClick={() => handleTabClick(tab.label)}
        />
      ))}

      {/* Centre SOS spacer — the actual button lives in SOSFloatButton */}
      <div
        aria-hidden="true"
        style={{ minWidth: 'var(--touch-md)', flex: 1 }}
      />

      {/* Right two tabs */}
      {TABS.slice(2).map(tab => (
        <NavTabItem
          key={tab.id}
          tab={tab}
          isActive={activeId === tab.id}
          onClick={() => handleTabClick(tab.label)}
        />
      ))}
    </nav>
  );
}

// ── Individual tab item ─────────────────────────────────────────────
function NavTabItem({ tab, isActive, onClick }: {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <NavLink
      to={tab.path}
      aria-label={tab.ariaLabel}
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        flex: 1,
        minHeight: 64,
        paddingTop: 6,
        paddingBottom: 4,
        paddingLeft: 6,
        paddingRight: 6,
        borderRadius: 12,
        textDecoration: 'none',
        position: 'relative',
        WebkitTapHighlightColor: 'transparent',
        background: isActive ? 'var(--bg-hover)' : 'transparent',
        transition: 'background 150ms ease',
        color: isActive ? 'var(--saffron)' : 'var(--text-secondary)',
      }}
    >
      {/* Active indicator dot — slides with layoutId */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            layoutId="nav-active-dot"
            style={{
              position: 'absolute',
              top: 2,
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'var(--saffron)',
              boxShadow: '0 0 6px rgba(255,153,51,0.8)',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <span style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {tab.icon}
      </span>

      {/* Label — always visible */}
      <span style={{
        fontFamily: 'var(--font-body)',
        fontWeight: isActive ? 600 : 500,
        fontSize: 11,
        lineHeight: 1,
        color: isActive ? 'var(--saffron)' : 'var(--text-secondary)',
        transition: 'color 150ms ease',
      }}>
        {tab.label}
      </span>
    </NavLink>
  );
}

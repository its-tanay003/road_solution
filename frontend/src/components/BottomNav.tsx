import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
      className="fixed bottom-0 left-0 right-0 flex items-start justify-around px-2 pt-1.5 pb-(--safe-bottom) h-[calc(72px+var(--safe-bottom))] bg-secondary/95 backdrop-blur-xl border-t border-white/5 z-200"
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
        className="min-w-(--touch-md) flex-1"
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
      className={`flex flex-col items-center gap-0.5 flex-1 min-h-[64px] pt-1.5 pb-1 px-1.5 rounded-xl no-underline relative transition-colors duration-150 ${
        isActive ? 'bg-white/5 text-saffron' : 'bg-transparent text-slate-400 hover:text-slate-200'
      }`}
    >
      {/* Active indicator dot — slides with layoutId */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            layoutId="nav-active-dot"
            className="absolute top-0.5 w-1 h-1 rounded-full bg-saffron shadow-[0_0_6px_rgba(255,153,51,0.8)]"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <span className="w-7 h-7 flex items-center justify-center">
        {tab.icon}
      </span>

      {/* Label — always visible */}
      <span className={`font-sans text-[11px] leading-none transition-colors duration-150 ${
        isActive ? 'font-semibold' : 'font-medium'
      }`}>
        {tab.label}
      </span>
    </NavLink>
  );
}

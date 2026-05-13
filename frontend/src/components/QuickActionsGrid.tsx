import React from 'react';
import { motion } from 'framer-motion';
import { ActionCard, type ActionCardData } from './ActionCard';
import { useNavigate } from 'react-router-dom';
import { hapticLight } from '../lib/accessibilityHelpers';
import { staggerContainer } from '../lib/pageTransition';

// ── Icons ────────────────────────────────────────────────────────
const MapIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      stroke="currentColor" strokeWidth="1.8" fill="none"/>
    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
  </svg>
);

const BrainIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9.5 2A2.5 2.5 0 007 4.5v.5H6A3 3 0 003 8v1a3 3 0 002 2.83V16a4 4 0 008 0v-4.17A3 3 0 0015 9V8a3 3 0 00-3-3h-1v-.5A2.5 2.5 0 009.5 2z"
      stroke="currentColor" strokeWidth="1.6" fill="none"/>
    <path d="M14.5 2A2.5 2.5 0 0117 4.5v.5h1a3 3 0 013 3v1a3 3 0 01-2 2.83V16a4 4 0 01-8 0"
      stroke="currentColor" strokeWidth="1.6" fill="none"/>
    <path d="M9 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const CrossIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
  </svg>
);

const PeopleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.6" fill="none"/>
    <circle cx="16" cy="7" r="3" stroke="currentColor" strokeWidth="1.6" fill="none"/>
    <path d="M2 21c0-3.31 2.69-6 6-6h4M14 21c0-3.31 2.69-6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
  </svg>
);

const ContactsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.6" fill="none"/>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" fill="none"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    <path d="M9 14.5l1 1 2-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MedicalIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V8l-6-6z"
      stroke="currentColor" strokeWidth="1.6" fill="none"/>
    <path d="M13 2v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M12 11v6M9 14h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

// ── Small badge components ────────────────────────────────────────
function CountBadge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      background: `${color}18`, color, border: `1px solid ${color}30`,
      borderRadius: 999, fontSize: 10, fontFamily: 'var(--font-mono)',
      fontWeight: 600, padding: '2px 7px', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

// ── Cards config ─────────────────────────────────────────────────
const CARDS: ActionCardData[] = [
  {
    id: 'map',
    title: 'Live Map',
    subtitle: 'Hospitals · Police · Ambulance',
    route: '/map',
    accent: '#2979FF',
    icon: <MapIcon />,
    badge: <CountBadge label="12 nearby" color="#2979FF" />,
  },
  {
    id: 'ai',
    title: 'AI Help',
    subtitle: 'Talk to emergency AI',
    route: '/assistant',
    accent: '#7C4DFF',
    icon: <BrainIcon />,
    badge: <CountBadge label="24/7" color="#00E676" />,
  },
  {
    id: 'firstaid',
    title: 'First Aid',
    subtitle: 'Step-by-step voice guide',
    route: '/first-aid',
    accent: '#FF1744',
    icon: <CrossIcon />,
    badge: <CountBadge label="Voice" color="#FF9933" />,
    pulse: true,
  },
  {
    id: 'bystander',
    title: "I'm a Bystander",
    subtitle: 'Help someone else',
    route: '/bystander',
    accent: '#FFB300',
    icon: <PeopleIcon />,
    badge: <CountBadge label="QR" color="#FFB300" />,
  },
  {
    id: 'contacts',
    title: 'Emergency Contacts',
    subtitle: 'Your trusted contacts',
    route: '/emergency-contacts',
    accent: '#00E676',
    icon: <ContactsIcon />,
    badge: <CountBadge label="Ready" color="#00E676" />,
  },
  {
    id: 'medical',
    title: 'My Medical Info',
    subtitle: 'Blood type · Conditions · Meds',
    route: '/medical',
    accent: '#2979FF',
    icon: <MedicalIcon />,
    badge: <CountBadge label="82%" color="#2979FF" />,
  },
];

// ── Secondary pill actions ────────────────────────────────────────
const SECONDARY = [
  { label: 'Road Safety Quiz', route: '/quiz' },
  { label: 'Incident History', route: '/analytics' },
  { label: 'Safety Score', route: '/impact' },
  { label: 'Report Hazard', route: '/report/new' },
  { label: 'Volunteer Network', route: '/volunteer' },
  { label: 'Our Roadmap', route: '/vision' },
];

export function QuickActionsGrid() {
  const navigate = useNavigate();

  return (
    <section aria-label="Quick Actions" style={{ padding: '0 var(--sp-4)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--sp-5)' }}>
        <h2 style={{
          margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: 20, color: 'var(--text-primary)',
        }}>
          Quick Actions
        </h2>
        <div style={{ height: 3, width: 32, background: 'var(--saffron)', borderRadius: 2 }} />
      </div>

      {/* 2×3 Grid */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}
      >
        {CARDS.map((card, i) => (
          <ActionCard key={card.id} {...card} index={i} />
        ))}
      </motion.div>

      {/* Secondary pills — horizontal scroll */}
      <div
        style={{
          display: 'flex', gap: 8, marginTop: 16,
          overflowX: 'auto', paddingBottom: 4,
          scrollbarWidth: 'none',
        }}
        aria-label="More options"
      >
        {SECONDARY.map(item => (
          <button
            key={item.label}
            onClick={() => { hapticLight(); navigate(item.route); }}
            style={{
              flexShrink: 0,
              background: 'var(--bg-hover)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)', padding: '7px 14px',
              fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
              color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}

import { motion } from 'framer-motion';
import { ActionCard, type ActionCardData } from './ActionCard';
import { useNavigate } from 'react-router-dom';
import { hapticLight } from '../lib/accessibilityHelpers';
import { staggerContainer } from '../lib/pageTransition';
import { Zap } from 'lucide-react';

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
    <span 
      className="rounded-full px-2 py-0.5 font-mono font-bold text-[10px] whitespace-nowrap border bg-[color-mix(in_srgb,var(--accent-badge),transparent_85%)] text-(--accent-badge) border-[color-mix(in_srgb,var(--accent-badge),transparent_70%)]"
      style={{ '--accent-badge': color } as React.CSSProperties}
    >
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
    accent: 'var(--blue)',
    icon: <MapIcon />,
    badge: <CountBadge label="12 nearby" color="var(--blue)" />,
  },
  {
    id: 'ai',
    title: 'AI Help',
    subtitle: 'Talk to emergency AI',
    route: '/assistant',
    accent: 'var(--purple)',
    icon: <BrainIcon />,
    badge: <CountBadge label="24/7" color="var(--green)" />,
  },
  {
    id: 'firstaid',
    title: 'First Aid',
    subtitle: 'Step-by-step voice guide',
    route: '/first-aid',
    accent: 'var(--red)',
    icon: <CrossIcon />,
    badge: <CountBadge label="Voice" color="var(--saffron)" />,
    pulse: true,
  },
  {
    id: 'bystander',
    title: "I'm a Bystander",
    subtitle: 'Help someone else',
    route: '/bystander',
    accent: 'var(--amber)',
    icon: <PeopleIcon />,
    badge: <CountBadge label="QR" color="var(--amber)" />,
  },
  {
    id: 'contacts',
    title: 'Emergency Contacts',
    subtitle: 'Your trusted contacts',
    route: '/emergency-contacts',
    accent: 'var(--green)',
    icon: <ContactsIcon />,
    badge: <CountBadge label="Ready" color="var(--green)" />,
  },
  {
    id: 'medical',
    title: 'My Medical Info',
    subtitle: 'Blood type · Conditions · Meds',
    route: '/medical',
    accent: 'var(--blue)',
    icon: <MedicalIcon />,
    badge: <CountBadge label="82%" color="var(--blue)" />,
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
    <section className="px-(--sp-4) py-6">
      <div className="flex items-center justify-between mb-(--sp-5)">
        <h2 className="text-xl font-display font-semibold text-(--text-primary) tracking-tight">
          Quick Actions
        </h2>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-(--saffron) text-black font-bold text-[10px] uppercase tracking-wider">
          <Zap size={10} fill="currentColor" /> Priority
        </div>
      </div>

      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-(--sp-4) mb-8"
      >
        {CARDS.map((card, i) => (
          <ActionCard key={card.id} {...card} index={i} />
        ))}
      </motion.div>

      {/* Secondary pills — horizontal scroll */}
      <div
        className="flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar"
        aria-label="More options"
      >
        {SECONDARY.map(item => (
          <button
            key={item.label}
            onClick={() => { hapticLight(); navigate(item.route); }}
            className="shrink-0 bg-hover border border-border rounded-full px-3.5 py-[7px] font-(--font-body) text-[12px] text-text-secondary cursor-pointer whitespace-nowrap transition-all duration-150 active:scale-95 touch-none"
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}

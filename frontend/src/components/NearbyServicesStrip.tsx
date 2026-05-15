import { useRef } from 'react';
import { motion } from 'framer-motion';
import { hapticLight } from '../lib/accessibilityHelpers';

interface Hospital {
  id:       string;
  name:     string;
  distance: number;  // km
  eta:      number;  // minutes
  phone:    string;
  type:     'hospital' | 'clinic' | 'trauma';
}

// Simulated nearby hospitals (will be replaced by live geolocation query)
const HOSPITALS: Hospital[] = [
  { id: 'h1', name: 'Apollo Hospitals', distance: 1.2, eta: 4,  phone: '044-28293333', type: 'hospital' },
  { id: 'h2', name: 'MIOT International', distance: 2.8, eta: 7,  phone: '044-22490000', type: 'trauma' },
  { id: 'h3', name: 'Fortis Malar',       distance: 3.5, eta: 9,  phone: '044-42892222', type: 'hospital' },
  { id: 'h4', name: 'Dr Mehta Hospital',  distance: 4.1, eta: 11, phone: '044-28260000', type: 'clinic' },
];

const TYPE_LABEL: Record<Hospital['type'], string> = {
  hospital: '🏥 Hospital',
  clinic:   '🏨 Clinic',
  trauma:   '🚨 Trauma',
};

export function NearbyServicesStrip() {
  const rowRef = useRef<HTMLDivElement>(null);

  return (
    <section aria-label="Nearest Help" style={{ padding: '0 var(--sp-4)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--sp-4)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            fill="var(--saffron)" />
          <circle cx="12" cy="9" r="2.5" fill="white" />
        </svg>
        <h2 style={{
          margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: 18, color: 'var(--text-primary)',
        }}>
          Nearest Help
        </h2>
      </div>

      {/* Horizontal scroll row */}
      <div
        ref={rowRef}
        style={{
          display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8,
          scrollbarWidth: 'none', scrollSnapType: 'x mandatory',
        }}
        role="list"
      >
        {HOSPITALS.map((h, i) => (
          <motion.div
            key={h.id}
            role="listitem"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            style={{
              flexShrink: 0, scrollSnapAlign: 'start',
              width: 220,
              background: 'var(--bg-raised)',
              border: `1px solid ${i === 0 ? 'var(--saffron)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: 10,
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* NEAREST badge */}
            {i === 0 && (
              <div style={{
                position: 'absolute', top: 0, right: 0,
                background: 'var(--saffron)', color: '#000',
                fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700,
                padding: '3px 8px', borderRadius: '0 12px 0 8px',
                letterSpacing: '0.06em',
              }}>
                NEAREST
              </div>
            )}

            {/* Name + type */}
            <div>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {h.name}
              </p>
              <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-hint)' }}>
                {TYPE_LABEL[h.type]}
              </p>
            </div>

            {/* Distance + ETA */}
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
                  {h.distance.toFixed(1)}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-hint)' }}>km away</span>
              </div>
              <div style={{ width: 1, background: 'var(--border)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, color: h.eta <= 5 ? 'var(--green)' : h.eta <= 10 ? 'var(--amber)' : 'var(--text-primary)' }}>
                  {h.eta} min
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-hint)' }}>ETA</span>
              </div>
            </div>

            {/* Call button */}
            <a
              href={`tel:${h.phone}`}
              onClick={() => hapticLight()}
              aria-label={`Call ${h.name}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: 'rgba(0,230,118,0.10)',
                border: '1px solid rgba(0,230,118,0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '7px 12px',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
                color: 'var(--green)', textDecoration: 'none',
                transition: 'background 0.15s ease',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.09 5.17 2 2 0 015.09 3h3a2 2 0 012 1.72c.127.96.36 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 11a16 16 0 006.9 6.9l1.27-1.27a2 2 0 012.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0122 16.92z"
                  stroke="currentColor" strokeWidth="1.8" fill="none"/>
              </svg>
              Call Now
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

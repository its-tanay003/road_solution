import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { hapticLight } from '../lib/accessibilityHelpers';
import { staggerItem } from '../lib/pageTransition';

// ── Card data type ───────────────────────────────────────────────
export interface ActionCardData {
  id:       string;
  title:    string;
  subtitle: string;
  route:    string;
  accent:   string;             // CSS color value
  icon:     React.ReactNode;
  badge?:   React.ReactNode;
  pulse?:   boolean;            // gentle pulse animation
}

interface ActionCardProps extends ActionCardData {
  index: number;
}

export function ActionCard({ id, title, subtitle, route, accent, icon, badge, pulse, index }: ActionCardProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      variants={staggerItem}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
      onClick={() => { hapticLight(); navigate(route); }}
      animate={pulse ? { boxShadow: ['0 0 0 0 rgba(255,23,68,0)', '0 0 0 6px rgba(255,23,68,0.12)', '0 0 0 0 rgba(255,23,68,0)'] } : {}}
      transition={pulse ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.15 }}
      aria-label={`${title} — ${subtitle}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: 20,
        minHeight: 108,
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        WebkitTapHighlightColor: 'transparent',
        transition: 'border-color 0.15s ease, background 0.15s ease',
      }}
    >
      {/* Accent glow strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: accent, opacity: 0.6, borderRadius: '16px 16px 0 0',
      }} />

      {/* Top row: icon + badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${accent}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent, flexShrink: 0,
        }}>
          {icon}
        </div>
        {badge && (
          <div style={{ marginTop: 2 }}>
            {badge}
          </div>
        )}
      </div>

      {/* Bottom: text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 12 }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.2,
        }}>
          {title}
        </span>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 12,
          color: 'var(--text-secondary)', lineHeight: 1.4,
        }}>
          {subtitle}
        </span>
      </div>
    </motion.button>
  );
}

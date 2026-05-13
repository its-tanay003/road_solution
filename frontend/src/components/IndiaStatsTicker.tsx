import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';

// ── Animated counter ─────────────────────────────────────────────
function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const prev    = useRef(value);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const ctrl = animate(prev.current, value, {
      duration: 0.8,
      ease: 'easeOut',
      onUpdate(v) { node.textContent = v.toFixed(decimals); },
    });
    prev.current = value;
    return () => ctrl.stop();
  }, [value, decimals]);

  return <span ref={nodeRef}>{value.toFixed(decimals)}</span>;
}

// ── Stat card ─────────────────────────────────────────────────────
interface StatItem {
  emoji:    string;
  label:    string;
  value:    number;
  decimals?: number;
  suffix?:  string;
  color:    string;
}

function StatCard({ emoji, label, value, decimals, suffix, color }: StatItem) {
  return (
    <div style={{
      background: 'var(--bg-raised)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0,
    }}>
      <span style={{ fontSize: 18, lineHeight: 1 }}>{emoji}</span>
      <p style={{
        margin: 0, fontFamily: 'var(--font-mono)', fontWeight: 700,
        fontSize: 22, color, lineHeight: 1,
        letterSpacing: '-0.02em',
      }}>
        <AnimatedNumber value={value} decimals={decimals ?? 0} />
        {suffix && <span style={{ fontSize: 14, marginLeft: 2 }}>{suffix}</span>}
      </p>
      <p style={{
        margin: 0, fontFamily: 'var(--font-body)', fontSize: 11,
        color: 'var(--text-secondary)', lineHeight: 1.3,
      }}>
        {label}
      </p>
    </div>
  );
}

// ── Death toll real-time simulation ──────────────────────────────
// India average: ~421 deaths/day → 1 death every ~3.4 min = 204 sec
function useDeathTicker(base: number) {
  const [count, setCount] = useState(base);
  useEffect(() => {
    const interval = setInterval(() => setCount(c => c + 1), 204_000);
    return () => clearInterval(interval);
  }, []);
  return count;
}

export function IndiaStatsTicker() {
  const deaths = useDeathTicker(421);

  const stats: StatItem[] = [
    { emoji: '💀', label: 'Deaths today (India)',      value: deaths,  color: 'var(--red)' },
    { emoji: '🚑', label: 'Avg ambulance response',   value: 9.2,  decimals: 1, suffix: ' min', color: 'var(--amber)' },
    { emoji: '⚡', label: 'ROADSoS response target',  value: 87,   suffix: ' sec', color: 'var(--green)' },
    { emoji: '📊', label: 'Incidents in your area',   value: 3,    color: 'var(--blue)' },
  ];

  return (
    <section aria-label="India Road Safety Statistics" style={{ padding: '0 var(--sp-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--sp-4)' }}>
        <h2 style={{
          margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: 18, color: 'var(--text-primary)',
        }}>
          Live Statistics
        </h2>
        <span style={{
          background: 'rgba(0,230,118,0.12)', color: 'var(--green)',
          border: '1px solid rgba(0,230,118,0.30)',
          borderRadius: 999, fontSize: 10, fontFamily: 'var(--font-mono)',
          fontWeight: 700, padding: '2px 8px', letterSpacing: '0.06em',
        }}>
          ● LIVE
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>
    </section>
  );
}

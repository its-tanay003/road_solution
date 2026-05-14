import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

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

const COLOR_CLASS_MAP: Record<string, string> = {
  'var(--red)':   'stat-value--red',
  'var(--amber)': 'stat-value--amber',
  'var(--green)': 'stat-value--green',
  'var(--blue)':  'stat-value--blue',
};

function StatCard({ emoji, label, value, decimals, suffix, color }: StatItem) {
  const valueClass = `stat-value ${COLOR_CLASS_MAP[color] || ''}`;
  
  return (
    <div className="stat-card">
      <span className="stat-emoji">{emoji}</span>
      <p className={valueClass}>
        <AnimatedNumber value={value} decimals={decimals ?? 0} />
        {suffix && <span className="stat-suffix">{suffix}</span>}
      </p>
      <p className="stat-label">
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
    <section aria-label="India Road Safety Statistics" className="stats-ticker-container">
      <div className="stats-ticker-header">
        <h2 className="stats-ticker-title">
          Live Statistics
        </h2>
        <span className="live-badge">
          ● LIVE
        </span>
      </div>
      <div className="stats-ticker-grid">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>
    </section>
  );
}

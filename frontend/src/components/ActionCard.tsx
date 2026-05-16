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

export function ActionCard({ title, subtitle, route, accent, icon, badge, pulse }: ActionCardProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      variants={staggerItem}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => { hapticLight(); navigate(route); }}
      animate={pulse ? { boxShadow: [`0 0 0 0 ${accent}00`, `0 0 0 6px ${accent}20`, `0 0 0 0 ${accent}00`] } : {}}
      transition={pulse ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.15 }}
      aria-label={`${title} — ${subtitle}`}
      style={{ '--accent': accent } as React.CSSProperties}
      className="relative group w-full text-left p-5 rounded-xl bg-(--bg-raised) border border-(--border) overflow-hidden transition-all duration-300 shadow-xl shadow-black/20"
    >
      {/* Accent glow strip */}
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-60 rounded-t-[16px] bg-(--accent)" />

      {/* Icon & Badge Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-(--accent)/10 text-(--accent)">
          {icon}
        </div>
        {badge && (
          <div className="mt-0.5">
            {badge}
          </div>
        )}
      </div>

      {/* Bottom: text */}
      <div className="flex flex-col gap-[3px] mt-3">
        <h3 className="text-lg font-(--font-display) text-(--text-primary) tracking-tight mb-1">
          {title}
        </h3>
        <p className="text-sm font-(--font-body) text-(--text-secondary) leading-relaxed">
          {subtitle}
        </p>
      </div>
    </motion.button>
  );
}

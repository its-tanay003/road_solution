import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ShieldCheck, Activity } from 'lucide-react';
import type { TriageOutput } from '../logic/offlineTriageEngine';

interface Props {
  result: TriageOutput;
}

export const OfflineTriageBadge: React.FC<Props> = ({ result }) => {
  const severityColors = {
    CRITICAL: 'text-(--clr-red) border-(--clr-red) bg-(--clr-red)/10',
    SERIOUS: 'text-(--clr-amber) border-(--clr-amber) bg-(--clr-amber)/10',
    MODERATE: 'text-(--clr-blue) border-(--clr-blue) bg-(--clr-blue)/10',
    MINOR: 'text-(--clr-green) border-(--clr-green) bg-(--clr-green)/10',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full p-4 rounded-2xl border-2 ${severityColors[result.severity]} relative overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle size={16} className="text-(--clr-amber) animate-pulse" />
          <span className="text-[10px] font-mono text-(--clr-amber) uppercase tracking-widest font-bold">
            OFFLINE MODE — Rule-based triage
          </span>
        </div>
        <div className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-mono font-bold uppercase">
          {result.unitType} REQUIRED
        </div>
      </div>

      <div className="flex items-start gap-4 mb-6">
        <div className="text-center">
          <p className="text-[10px] font-mono opacity-60 uppercase mb-1">Severity</p>
          <p className="text-xl font-bold">{result.severity}</p>
        </div>
        <div className="w-px h-10 bg-white/10" />
        <div className="text-center">
          <p className="text-[10px] font-mono opacity-60 uppercase mb-1">Response</p>
          <p className="text-xl font-bold">~{result.responseTimeTarget}m</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-mono opacity-60 uppercase mb-2 flex items-center gap-1.5">
            <Activity size={12} /> Diagnostic Reasoning
          </p>
          <div className="space-y-1">
            {result.reasoning.map((r, i) => (
              <p key={i} className="text-[11px] leading-relaxed">• {r}</p>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-black/20 border border-white/5">
          <p className="text-[10px] font-mono text-(--clr-green) uppercase mb-2 flex items-center gap-1.5">
            <ShieldCheck size={12} /> Immediate Actions
          </p>
          <ul className="space-y-1">
            {result.immediateActions.map((a, i) => (
              <li key={i} className="text-[11px] font-bold text-white/80">{i+1}. {a}</li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

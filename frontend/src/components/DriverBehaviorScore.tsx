import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, TrendingDown, CheckCircle2, AlertTriangle, FileText, Download } from 'lucide-react';
import { useSosStore } from '../store';

const MOCK_LATEST_INCIDENT = {
  id: 'DEMO-823',
  timestamp: Date.now() - 3600000,
  behaviorScore: 78,
  telemetry: []
};

export const DriverBehaviorScore: React.FC = () => {
  const { closedIncidents } = useSosStore();
  
  // Use the latest incident or mock one if empty
  const rawLatest = closedIncidents[0] || MOCK_LATEST_INCIDENT;
  const latestIncident = {
    ...rawLatest,
    behaviorScore: rawLatest.behaviorScore ?? MOCK_LATEST_INCIDENT.behaviorScore
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'var(--clr-green)';
    if (score >= 70) return 'var(--clr-amber)';
    return 'var(--clr-red)';
  };

  const insights = [
    { icon: <Shield size={14} />, text: "Cornering stability within 95th percentile", type: 'positive' },
    { icon: <Zap size={14} />, text: "Sudden deceleration detected (1.4g)", type: 'neutral' },
    { icon: <TrendingDown size={14} />, text: "Fatigue patterns detected in last 2 hours", type: 'negative' }
  ];

  return (
    <div className="space-y-6">
      {/* Cinematic Score Header */}
      <div className="relative p-8 rounded-3xl bg-white/5 border border-(--clr-border) overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-50" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="80" cy="80" r="70"
                fill="none"
                stroke="white"
                strokeOpacity="0.05"
                strokeWidth="8"
              />
              <motion.circle
                cx="80" cy="80" r="70"
                fill="none"
                stroke={getScoreColor(latestIncident.behaviorScore)}
                strokeWidth="8"
                strokeDasharray={440}
                initial={{ strokeDashoffset: 440 }}
                animate={{ strokeDashoffset: 440 - (440 * latestIncident.behaviorScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_currentColor]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-5xl font-black tracking-tighter"
                style={{ color: getScoreColor(latestIncident.behaviorScore) }}
              >
                {Math.round(latestIncident.behaviorScore)}
              </motion.span>
              <span className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-widest">Safety Index</span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold">Driver Behavior Analysis</h3>
            <p className="text-[10px] font-mono text-(--clr-text-2) uppercase">Post-Incident Report #{latestIncident.id}</p>
          </div>
        </div>
      </div>

      {/* AI Insights HUD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white/5 border border-(--clr-border) space-y-4">
          <h4 className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 size={12} /> AI Safety Insights
          </h4>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                <div className={`mt-0.5 ${insight.type === 'positive' ? 'text-(--clr-green)' : insight.type === 'negative' ? 'text-(--clr-red)' : 'text-(--clr-amber)'}`}>
                  {insight.icon}
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/5 border border-(--clr-border) space-y-4">
          <h4 className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle size={12} /> Legal & Insurance
          </h4>
          <div className="space-y-3">
            <button className="w-full p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all group">
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-(--clr-blue)" />
                <div className="text-left">
                  <p className="text-[10px] font-bold">Insurer-Ready PDF</p>
                  <p className="text-[8px] font-mono text-(--clr-text-2) uppercase">Verified Evidence</p>
                </div>
              </div>
              <Download size={14} className="text-white/20 group-hover:text-white transition-colors" />
            </button>
            <div className="p-3 rounded-xl bg-(--clr-blue)/5 border border-(--clr-blue)/20">
              <p className="text-[10px] text-(--clr-text-2) leading-relaxed italic">
                "Verified blackbox data from this incident is eligible for Good Samaritan insurance premium discounts."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Shield, Database, Globe, Map as MapIcon, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCachedServicesCount, hasEmergencyNumbers } from '../lib/offlineDB';

export const OfflineReadinessScore: React.FC = () => {
  const [score, setScore] = useState(0);
  const [breakdown, setBreakdown] = useState({
    emergency: 0,
    services: 0,
    maps: 0,
    triage: 20 // Triage protocol is static and bundled
  });

  useEffect(() => {
    const calculateScore = async () => {
      const b = { ...breakdown };
      
      // Emergency Numbers (+30)
      const hasNumbers = await hasEmergencyNumbers();
      b.emergency = hasNumbers ? 30 : 0;
      
      // Services (+30)
      const serviceCount = await getCachedServicesCount();
      b.services = Math.min(30, Math.floor(serviceCount / 10)); // 30 points if > 300 services
      
      // Maps (+20)
      // For demo purposes, we assume maps are 50% cached
      b.maps = 10;
      
      setBreakdown(b);
      setScore(b.emergency + b.services + b.maps + b.triage);
    };

    calculateScore();
    const interval = setInterval(calculateScore, 10000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusColor = () => {
    if (score > 80) return 'text-emerald-500';
    if (score > 50) return 'text-amber-500';
    return 'text-nx-red-primary';
  };

  const getProgressColor = () => {
    if (score > 80) return 'bg-emerald-500';
    if (score > 50) return 'bg-amber-500';
    return 'bg-nx-red-primary';
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-nx-text-dim">Offline Integrity</h3>
          <p className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <Shield className={getStatusColor()} size={24} />
            {score}% <span className="text-sm font-bold opacity-50 uppercase tracking-tight">READY</span>
          </p>
        </div>
        <div className="relative w-16 h-16">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-white/10"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={175.9}
              initial={{ strokeDashoffset: 175.9 }}
              animate={{ strokeDashoffset: 175.9 - (175.9 * score) / 100 }}
              className={getStatusColor()}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {score > 80 ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-amber-500" />}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <ScoreItem label="Emergency Contacts" value={breakdown.emergency} max={30} icon={Globe} />
        <ScoreItem label="Service Cache" value={breakdown.services} max={30} icon={Database} />
        <ScoreItem label="Tactical Mapping" value={breakdown.maps} max={20} icon={MapIcon} />
        <ScoreItem label="Triage Protocol" value={breakdown.triage} max={20} icon={Shield} />
      </div>

      <div className="pt-2">
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            className={`h-full ${getProgressColor()} shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
          />
        </div>
      </div>
    </div>
  );
};

const ScoreItem = ({ label, value, max, icon: Icon }: { label: string, value: number, max: number, icon: React.ElementType }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-(--radius-lg) bg-white/5 group-hover:bg-white/10 transition-all ${value === max ? 'text-emerald-500' : 'text-nx-text-dim'}`}>
        {/* @ts-ignore */}
        <Icon size={14} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-nx-text-dim group-hover:text-white transition-all">{label}</span>
    </div>
    <span className="text-[10px] font-mono font-bold text-white/50">{value}/{max}</span>
  </div>
);

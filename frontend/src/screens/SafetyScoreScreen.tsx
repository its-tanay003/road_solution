import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, AlertTriangle, ArrowLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSafetyScoreStore } from '../store/safetyScoreStore';

export const SafetyScoreScreen: React.FC = () => {
  const navigate = useNavigate();
  const { score, events } = useSafetyScoreStore();

  const getRank = (s: number) => {
    if (s > 900) return { label: 'Elite Savior', color: 'text-green-400', bg: 'bg-green-500/10' };
    if (s > 750) return { label: 'Safe Driver', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    return { label: 'Caution Required', color: 'text-orange-400', bg: 'bg-orange-500/10' };
  };

  const rank = getRank(score);

  return (
    <div className="min-h-screen bg-[#080C14] pb-12">
      {/* Header */}
      <div className="px-6 pt-12 pb-8 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/5 text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-white">Safety Score</h1>
      </div>

      {/* Main Gauge */}
      <div className="px-6 mb-12">
        <div className="relative aspect-square w-full max-w-[280px] mx-auto flex flex-col items-center justify-center">
          {/* Circular SVG Progress */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="140" cy="140" r="120" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
            <motion.circle cx="140" cy="140" r="120" stroke="currentColor" strokeWidth="12" fill="transparent"
              strokeDasharray={2 * Math.PI * 120}
              initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - score / 1000) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-amber-400" strokeLinecap="round" />
          </svg>
          
          <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-7xl font-black text-white">{score}</motion.span>
          <span className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] mt-2">Score / 1000</span>
          
          <div className={`mt-6 px-4 py-1.5 rounded-full ${rank.bg} ${rank.color} font-black text-[11px] uppercase tracking-widest`}>
            {rank.label}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 px-6 mb-12">
        <div className="p-5 rounded-[24px] bg-white/5 border border-white/10">
          <TrendingUp className="text-green-400 mb-3" size={20} />
          <p className="text-2xl font-black text-white">+24</p>
          <p className="text-[11px] text-white/30 uppercase font-bold tracking-wider">This Month</p>
        </div>
        <div className="p-5 rounded-[24px] bg-white/5 border border-white/10">
          <ShieldCheck className="text-blue-400 mb-3" size={20} />
          <p className="text-2xl font-black text-white">92%</p>
          <p className="text-[11px] text-white/30 uppercase font-bold tracking-wider">Percentile</p>
        </div>
      </div>

      {/* History */}
      <div className="px-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-[11px] text-white/30 uppercase tracking-widest font-black">Recent Behavior</p>
          <Info size={14} className="text-white/20" />
        </div>
        
        <div className="space-y-3">
          {events.map(event => (
            <div key={event.id} className="flex gap-4 p-4 rounded-2xl bg-white/4 border border-white/5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${event.scoreImpact > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {event.scoreImpact > 0 ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-white text-[14px]">{event.description}</p>
                  <span className={`font-black text-[12px] ${event.scoreImpact > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {event.scoreImpact > 0 ? '+' : ''}{event.scoreImpact}
                  </span>
                </div>
                <p className="text-white/20 text-[11px] mt-1">
                  {new Date(event.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 mt-12">
        <button className="w-full py-5 rounded-3xl bg-amber-400 text-black font-black text-lg flex items-center justify-center gap-3">
          Download Safety Report
        </button>
      </div>
    </div>
  );
};

export default SafetyScoreScreen;

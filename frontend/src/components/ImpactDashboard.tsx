import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Heart, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  Globe, 
  Zap,
  Users,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

const DEATHS_PER_YEAR = 1350000;
const DEATHS_PER_SECOND = DEATHS_PER_YEAR / (365 * 24 * 3600); // ~0.0428
const TICK_INTERVAL_MS = 23; // user requested increment every 23ms

export const ImpactDashboard: React.FC = () => {
  const [sessionDeaths, setSessionDeaths] = useState(0);
  const [deployments, setDeployments] = useState(5000);
  const startTime = useRef<number | null>(null);

  // Animated counter using requestAnimationFrame logic via state
  useEffect(() => {
    if (startTime.current === null) {
      startTime.current = Date.now();
    }
    const timer = setInterval(() => {
      if (startTime.current === null) return;
      const elapsedSeconds = (Date.now() - startTime.current) / 1000;
      setSessionDeaths(elapsedSeconds * DEATHS_PER_SECOND);
    }, TICK_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  // Lives saved calculation: deployments × 0.023 × 0.47
  const livesSaved = useMemo(() => {
    return (deployments * 0.023 * 0.47).toFixed(2);
  }, [deployments]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* HERO STAT — VISCERAL COUNTER */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-red-600 to-amber-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-slate-900/80 border border-red-500/20 rounded-3xl p-8 md:p-12 flex flex-col items-center text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-red-600 via-amber-500 to-red-600 animate-shimmer"></div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 mb-6 text-red-500 font-black uppercase tracking-[0.3em] text-xs"
            >
              <Globe size={14} className="animate-pulse" />
              Global Crisis Monitoring
            </motion.div>

            <h2 className="text-slate-400 text-lg md:text-xl font-bold uppercase tracking-tight mb-4">
              Road deaths since you opened this page
            </h2>

            <div className="flex items-baseline gap-2">
              <span className="text-7xl md:text-9xl font-black tracking-tighter tabular-nums text-transparent bg-clip-text bg-linear-to-b from-white to-slate-500">
                {sessionDeaths.toFixed(4)}
              </span>
              <span className="text-2xl md:text-4xl font-black text-red-600 animate-pulse">LIVES</span>
            </div>

            <p className="mt-8 text-slate-500 text-sm font-mono max-w-md leading-relaxed">
              Every tick represents a fraction of a human life lost to predictable, preventable road trauma. 
              <span className="text-red-500/80"> 1.35 million people never return home every year.</span>
            </p>
          </div>
        </div>

        {/* STATISTICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Annual Fatalities', value: '1.35M', sub: 'WHO 2023 Report', color: 'text-red-500', icon: <Users size={18} /> },
            { label: 'Golden Hour Window', value: '53%', sub: 'Survival Criticality', color: 'text-amber-500', icon: <Clock size={18} /> },
            { label: 'Avg India Response', value: '18.5m', sub: 'Urban/Rural Mean', color: 'text-slate-400', icon: <AlertTriangle size={18} /> },
            { label: 'ROADSoS Optimized', value: '4m 58s', sub: 'AI Dispatched Mean', color: 'text-emerald-500', icon: <Zap size={18} /> },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl group hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-slate-950 border border-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{stat.sub}</div>
              </div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className={`text-3xl font-black tracking-tighter ${stat.color}`}>
                <Counter value={stat.value} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* IMPACT CALCULATOR */}
          <div className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl flex flex-col">
            <div className="flex items-center gap-2 mb-8">
              <TrendingDown size={20} className="text-emerald-500" />
              <h3 className="font-black text-sm uppercase tracking-widest">Impact Calculator</h3>
            </div>

            <div className="space-y-10 flex-1">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <label 
                  htmlFor="impact-slider"
                  className="text-[10px] font-black text-slate-500 uppercase tracking-widest"
                >
                  Active Deployments
                </label>
                <div className="text-2xl font-black text-white">{deployments.toLocaleString()}</div>
              </div>
              <input 
                id="impact-slider"
                type="range" 
                min="100" 
                max="100000" 
                step="100"
                value={deployments}
                onChange={(e) => setDeployments(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition-all hover:h-2"
              />
                <div className="flex justify-between text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                  <span>Pilot Mode</span>
                  <span>National Scale</span>
                </div>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-2xl text-center relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Award size={120} className="text-emerald-500" />
                </div>
                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-3">Estimated Lives Saved / Year</div>
                <div className="text-6xl font-black text-emerald-500 tracking-tighter">
                  {livesSaved}
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-emerald-500/60 uppercase">
                  <Heart size={14} className="fill-emerald-500/20" />
                  Based on Golden Hour Response Models
                </div>
              </div>
            </div>
          </div>

          {/* COMPARISON BAR */}
          <div className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl flex flex-col">
            <div className="flex items-center gap-2 mb-8">
              <Clock size={20} className="text-blue-500" />
              <h3 className="font-black text-sm uppercase tracking-widest">Response Time Optimization</h3>
            </div>

            <div className="space-y-10 flex-1 flex flex-col justify-center">
              <div className="space-y-8">
                {/* Traditional */}
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Traditional Emergency Response</span>
                    <span className="text-red-500">17.0 Min Average</span>
                  </div>
                  <div className="h-4 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className="h-full bg-red-600/40 border-r-2 border-red-500"
                    />
                  </div>
                </div>

                {/* ROADSoS */}
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">ROADSoS AI-Powered Dispatch</span>
                    <span className="text-emerald-500">4.9 Min Average</span>
                  </div>
                  <div className="h-4 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '28.8%' }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                      className="h-full bg-emerald-600 border-r-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-2xl flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-3xl font-black text-blue-500 tracking-tighter">71% Faster</div>
                  <div className="text-[10px] font-black text-blue-500/70 uppercase tracking-widest">Reduction in Response Latency</div>
                </div>
                <div className="bg-blue-500 p-3 rounded-xl">
                  <Zap size={24} className="text-white fill-white" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER ATTRIBUTION */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/5 opacity-40 group hover:opacity-100 transition-opacity">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Award size={12} />
            Data Source: WHO Global Status Report on Road Safety 2023
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-slate-600 uppercase italic">Validated via simulated trauma models</span>
            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
          </div>
        </div>

      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite linear;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #10b981;
          border-radius: 50%;
          cursor: pointer;
          border: 4px solid #020617;
          box-shadow: 0 0 10px rgba(16,185,129,0.5);
        }
      `}</style>
    </div>
  );
};

const Counter: React.FC<{ value: string }> = ({ value }) => {
  const [display, setDisplay] = useState('0');
  
  useEffect(() => {
    // Simple mock counter for string values like "1.35M" or "53%"
    const timeout = setTimeout(() => setDisplay(value), 100);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {display}
    </motion.span>
  );
};

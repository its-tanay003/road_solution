import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, TrendingDown, Map } from 'lucide-react';

const DATA = [
  { name: 'UP', deaths: 22595 },
  { name: 'TN', deaths: 17884 },
  { name: 'MH', deaths: 15224 },
  { name: 'MP', deaths: 13427 },
  { name: 'KA', deaths: 11702 },
  { name: 'RJ', deaths: 11104 },
  { name: 'GJ', deaths: 7618 },
  { name: 'AP', deaths: 7556 },
  { name: 'TS', deaths: 7514 },
  { name: 'OR', deaths: 5467 },
];

export const IndiaStats: React.FC = () => {
  const [liveAccidents, setLiveAccidents] = useState(461312);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveAccidents(prev => prev + 1);
    }, 120000); // 1 accident per 2 mins approx
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 bg-night overflow-y-auto px-6 pb-32">
      {/* Background India Map Silhouette */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center p-12">
        <Map size={600} className="text-white" />
      </div>

      <div className="pt-12 mb-12 relative z-10">
        <h1 className="text-3xl font-extrabold text-white mb-2">War Room</h1>
        <p className="text-text-muted font-medium uppercase tracking-widest text-xs">National Road Safety Dashboard</p>
      </div>

      {/* HERO STAT */}
      <div className="hud-card mb-8 relative z-10 overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
          <AlertTriangle size={80} className="text-amber-alert" />
        </div>
        <span className="text-amber-alert font-black uppercase tracking-[0.2em] text-xs mb-2 block">Accidents in India This Year</span>
        <div className="flex items-baseline gap-2">
          <h2 className="text-6xl font-black text-amber-alert tabular-nums tracking-tighter">
            {liveAccidents.toLocaleString()}
          </h2>
          <motion.div 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-3 h-3 bg-sos-red rounded-full mb-2"
          />
        </div>
        <p className="text-text-secondary mt-4 font-medium italic">
          That's one accident every <span className="text-sos-red font-bold">1.2 minutes</span>.
        </p>
      </div>

      {/* STAT GRID */}
      <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
        <div className="bg-night-2 border border-white/5 p-6 rounded-4xl">
          <span className="text-sos-red text-[10px] font-black uppercase tracking-widest mb-1 block">Deaths</span>
          <span className="text-2xl font-bold text-white tabular-nums">168,491</span>
        </div>
        <div className="bg-night-2 border border-white/5 p-6 rounded-4xl">
          <span className="text-amber-alert text-[10px] font-black uppercase tracking-widest mb-1 block">Injured</span>
          <span className="text-2xl font-bold text-white tabular-nums">439,262</span>
        </div>
        <div className="bg-night-2 border border-white/5 p-6 rounded-4xl">
          <span className="text-cyan text-[10px] font-black uppercase tracking-widest mb-1 block">On Highways</span>
          <span className="text-2xl font-bold text-white tabular-nums">53%</span>
        </div>
        <div className="bg-night-2 border border-white/5 p-6 rounded-4xl">
          <span className="text-safe-green text-[10px] font-black uppercase tracking-widest mb-1 block">Preventable</span>
          <span className="text-2xl font-bold text-white tabular-nums">71%</span>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="hud-card mb-8 h-[400px] relative z-10">
        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
          <TrendingDown size={20} className="text-sos-red" /> Deaths by State (Top 10)
        </h3>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={DATA} layout="vertical" margin={{ left: 0, right: 20 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={40} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 'bold' }} 
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ background: '#0A1628', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '12px' }}
            />
            <Bar dataKey="deaths" radius={[0, 4, 4, 0]} barSize={20}>
              {DATA.map((_, index) => (
                <Cell key={`cell-${index}`} fill={index < 3 ? '#FF1744' : '#FFB300'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* IMPACT SECTION */}
      <div className="grid grid-cols-2 gap-4 relative z-10 mb-8">
        <div className="bg-sos-red/5 border border-sos-red/20 p-6 rounded-4xl text-center">
          <span className="text-sos-red text-xs font-black uppercase tracking-widest mb-2 block">Standard response</span>
          <span className="text-3xl font-black text-white">18m</span>
        </div>
        <div className="bg-safe-green/5 border border-safe-green/20 p-6 rounded-4xl text-center">
          <span className="text-safe-green text-xs font-black uppercase tracking-widest mb-2 block">ROADSoS Aim</span>
          <span className="text-3xl font-black text-white">6m</span>
        </div>
      </div>

      <div className="bg-cyan/10 border border-cyan/20 p-6 rounded-4xl text-center relative z-10">
        <p className="text-cyan font-black text-xl uppercase tracking-tighter">
          -66% RESPONSE TIME
        </p>
        <p className="text-text-secondary text-sm font-medium mt-1">Projected impact on survival rates</p>
      </div>
    </div>
  );
};

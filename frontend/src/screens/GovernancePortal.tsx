import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Map as MapIcon, 
  ShieldAlert, 
  Zap, 
  BarChart3, 
  Search,
  Download,
  Lightbulb,
} from 'lucide-react';
const RoadIntelligenceReport = React.lazy(() => import('../components/RoadIntelligenceReport').then(m => ({ default: m.RoadIntelligenceReport })));
import PageLoadingFallback from '../components/PageLoadingFallback';

const STATS = [
  { label: 'Lives Saved (Q2)', value: '1,242', trend: '+14%', color: 'text-green-400' },
  { label: 'Economic Offset', value: '₹142.5 Cr', trend: '+22%', color: 'text-blue-400' },
  { label: 'Dispatch Efficiency', value: '88.4%', trend: '+8%', color: 'text-orange-400' },
  { label: 'Citizen Trust Score', value: '4.8/5', trend: '+0.2', color: 'text-purple-400' },
];

const HOTZONES = [
  { road: 'NH-45 (GST Road)', incidents: 124, risk: 'EXTREME', patrol: 'HEAVY' },
  { road: 'OMR (IT Corridor)', incidents: 89, risk: 'HIGH', patrol: 'MODERATE' },
  { road: 'Anna Salai', incidents: 42, risk: 'MEDIUM', patrol: 'LIGHT' },
  { road: 'Mount Road', incidents: 31, risk: 'LOW', patrol: 'LIGHT' },
];

export const GovernancePortal: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#080C14] text-[#E8EDF5] p-6 lg:p-12 font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#2979FF] to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#2979FF] to-transparent" />
        <div className="scanline-overlay" />
      </div>

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 relative">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-[#2979FF]/10 flex items-center justify-center border border-[#2979FF]/20 shadow-[0_0_30px_rgba(41,121,255,0.1)]">
            <Building2 size={32} className="text-[#2979FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-orange-500/20 text-orange-500 text-[9px] font-black uppercase tracking-widest rounded-md border border-orange-500/30">Enterprise Portal</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2">ROAD GOVERNANCE</h1>
            <p className="text-[#8892A4] font-mono text-xs tracking-widest uppercase">Division: Chennai Metro | Regional Intelligence Dashboard</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold flex items-center gap-3 hover:bg-white/10 transition-all group">
            <Search size={18} className="text-[#8892A4] group-hover:text-white" /> SEARCH SECTOR
          </button>
          <button className="px-6 py-3 bg-[#2979FF] text-white rounded-xl font-bold flex items-center gap-3 shadow-[0_10px_20px_rgba(41,121,255,0.2)] hover:scale-105 active:scale-95 transition-all">
            <Download size={18} /> EXPORT QUARTERLY
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 xl:grid-cols-4 gap-8 relative">
        {/* Left Column: Macro Stats */}
        <div className="xl:col-span-1 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-4 w-1 bg-[#2979FF] rounded-full" />
            <h2 className="text-xs font-black tracking-[0.2em] uppercase text-[#8892A4]">Macro Intelligence</h2>
          </div>
          
          {STATS.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group hover:border-[#2979FF]/30 transition-all"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                <BarChart3 size={40} />
              </div>
              <p className="text-[10px] font-mono text-[#8892A4] mb-2 uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                <span className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded-md text-[#8892A4]">{stat.trend}</span>
              </div>
            </motion.div>
          ))}

          <div className="p-6 bg-linear-to-br from-[#2979FF]/20 to-transparent border border-[#2979FF]/30 rounded-2xl">
            <div className="flex items-center gap-3 mb-4 text-[#2979FF]">
              <Lightbulb size={20} />
              <h3 className="font-bold">Policy Recommendation</h3>
            </div>
            <p className="text-xs text-[#E8EDF5]/70 leading-relaxed mb-6">
              Proposed 20% increase in highway lighting budget for Sector-7 based on high frequency of nocturnal low-visibility collisions.
            </p>
            <button className="w-full py-3 bg-[#2979FF]/20 border border-[#2979FF]/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2979FF]/30 transition-all">
              Initiate Budget Case
            </button>
          </div>
        </div>

        {/* Center Column: Heatmap & Predictive Patrol */}
        <div className="xl:col-span-2 space-y-8">
          <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                  <MapIcon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Predictive Patrol Grid</h3>
                  <p className="text-[10px] font-mono text-[#8892A4] uppercase tracking-widest">Real-time Risk Heatmap Integration</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold">LIVE FEED</span>
                <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-bold text-red-500 tracking-tighter">4 HOTZONES</span>
              </div>
            </div>

            {/* Simulated Map / Heatmap Area */}
            <div className="flex-1 bg-[#05080F] rounded-3xl border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/80.2707,13.0827,11,0/800x600?access_token=pk.live_deployment_node_alpha_882')] bg-cover opacity-40 mix-blend-luminosity" />
              
              {/* Fake Pulse Points */}
              <div className="absolute top-1/4 left-1/3 w-24 h-24 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <p className="text-[10px] font-mono text-[#8892A4] uppercase mb-1">Sector Analysis</p>
                    <p className="text-sm font-bold">North Chennai High Risk</p>
                  </div>
                  <div className="p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <p className="text-[10px] font-mono text-[#8892A4] uppercase mb-1">Patrol Load</p>
                    <p className="text-sm font-bold text-orange-400">84% Capacity</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {HOTZONES.map(zone => (
                <div 
                  key={zone.road}
                  onClick={() => setSelectedZone(zone.road)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedZone === zone.road ? 'bg-[#2979FF]/10 border-[#2979FF]/40' : 'bg-white/2 border-white/5 hover:bg-white/5'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-bold">{zone.road}</p>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded ${zone.risk === 'EXTREME' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>
                      {zone.risk}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8892A4]">
                    <span>{zone.incidents} INCIDENTS</span>
                    <span className="flex items-center gap-1"><ShieldAlert size={10} /> {zone.patrol} PATROL</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Weekly Intelligence Report (Existing) */}
        <div className="xl:col-span-1 space-y-8">
           <div className="flex items-center gap-3 mb-4">
            <div className="h-4 w-1 bg-red-500 rounded-full" />
            <h2 className="text-xs font-black tracking-[0.2em] uppercase text-[#8892A4]">AI Weekly Intel</h2>
          </div>
          <React.Suspense fallback={<PageLoadingFallback />}>
            <RoadIntelligenceReport />
          </React.Suspense>
        </div>
      </main>

      {/* Corporate Strategy / ROI Footer */}
      <footer className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 p-12 bg-white/2 border border-white/10 rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Zap size={120} />
        </div>
        
        <div className="space-y-4">
          <h4 className="text-xl font-black">Strategic Governance</h4>
          <p className="text-sm text-[#8892A4] leading-relaxed">
            Transforming reactive emergency services into predictive urban safety infrastructure.
          </p>
          <div className="flex gap-2">
            {['GOV-TECH', 'SAAS', 'IOT-GRID'].map(t => (
              <span key={t} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[8px] font-bold text-[#8892A4]">{t}</span>
            ))}
          </div>
        </div>

        <div className="space-y-4 border-l border-white/5 pl-8">
          <h4 className="text-xl font-black">Economic Cost of Crashes</h4>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-black text-red-400">₹842 Cr</p>
            <span className="text-[10px] text-red-400/50 font-mono mb-2">/ YEAR (EST)</span>
          </div>
          <p className="text-xs text-[#8892A4]">
            Without ROADSoS optimization, the state loses an estimated ₹2.3 Cr daily in direct medical costs and productivity loss.
          </p>
        </div>

        <div className="flex flex-col justify-center items-end">
          <div className="text-right mb-4">
            <p className="text-[10px] font-mono text-[#8892A4] uppercase mb-1">Contract Status</p>
            <p className="text-xl font-bold text-green-500">ACTIVE - TIER 1</p>
          </div>
          <button className="px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
            Manage Subscription
          </button>
        </div>
      </footer>
    </div>
  );
};

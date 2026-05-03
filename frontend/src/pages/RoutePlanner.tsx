import { Map as MapIcon, Download, Navigation, Search, Flag, Shield, Activity, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const RoutePlanner = () => {
  return (
    <div className="min-h-screen bg-[var(--nx-bg-base)] text-[var(--nx-text-primary)] flex flex-col lg:flex-row">
      {/* Left: Tactical Route Inputs & Timeline */}
      <div className="w-full lg:w-[400px] bg-[var(--nx-bg-surface)] border-r border-[var(--nx-border)] flex flex-col z-20">
        <div className="p-6 border-b border-[var(--nx-border)] bg-[var(--nx-bg-elevated)]/50 backdrop-blur-md">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[var(--nx-blue-primary)]/10 border border-[var(--nx-blue-primary)]/30 rounded-sm flex items-center justify-center text-[var(--nx-blue-primary)]">
                 <MapIcon size={18} />
              </div>
              <h1 className="text-lg font-black tracking-tighter text-white uppercase">ROUTE PROTOCOL</h1>
           </div>
           
           <div className="space-y-4 relative">
              <div className="absolute left-4 top-5 bottom-5 w-[1px] bg-[var(--nx-border)] border-l border-dashed" />
              <div className="relative pl-10">
                 <div className="absolute left-[13px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--nx-blue-primary)] shadow-[0_0_8px_var(--nx-blue-primary)]" />
                 <input 
                   type="text" 
                   placeholder="DEPARTURE POINT" 
                   className="nexus-input w-full bg-[var(--nx-bg-base)]/50 border-[var(--nx-border)] pl-4"
                   defaultValue="CURRENT LOCATION"
                 />
              </div>
              <div className="relative pl-10">
                 <div className="absolute left-[13px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--nx-red-primary)] shadow-[0_0_8px_var(--nx-red-primary)]" />
                 <input 
                   type="text" 
                   placeholder="DESTINATION VECTOR" 
                   className="nexus-input w-full bg-[var(--nx-bg-base)]/50 border-[var(--nx-border)] pl-4"
                 />
              </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
           <div>
              <div className="flex items-center justify-between mb-4">
                 <h3 className="nexus-label">EMERGENCY CORRIDOR ASSETS</h3>
                 <Badge variant="active">NOMINAL</Badge>
              </div>
              
              <div className="space-y-6">
                <TimelineItem 
                  dist="2.1 KM" 
                  title="CITY TRAUMA CENTER" 
                  desc="PRIMARY MEDICAL HUB • LEVEL 1" 
                  type="hospital" 
                />
                <TimelineItem 
                  dist="8.5 KM" 
                  title="RAPID RESPONSE POST" 
                  desc="HW PATROL • 2 UNITS ACTIVE" 
                  type="police" 
                />
                <TimelineItem 
                  dist="12.0 KM" 
                  title="EVAC EXTRACTION ZONE" 
                  desc="SECURE HELIPAD ACCESS" 
                  type="active" 
                />
              </div>
           </div>

           <div className="p-4 nexus-card bg-[var(--nx-amber-dim)] border-[var(--nx-amber-primary)]/20">
              <div className="flex items-center gap-2 text-[var(--nx-amber-primary)] mb-2">
                 <Flag size={14} />
                 <span className="text-[10px] font-bold uppercase tracking-widest">TACTICAL ADVISORY</span>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed uppercase">High risk sector detected at 14.5KM due to environmental congestion.</p>
           </div>
        </div>

        <div className="p-6 bg-[var(--nx-bg-elevated)] border-t border-[var(--nx-border)]">
           <Button variant="primary" className="w-full h-14 tracking-[0.2em]">
              <Download size={18} className="mr-2" /> SECURE OFFLINE RELAY
           </Button>
        </div>
      </div>

      {/* Right: Full Bleed Tactical Map */}
      <div className="flex-1 relative overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-40 grayscale contrast-150">
           <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000" alt="Map View" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-r from-[var(--nx-bg-base)] via-transparent to-transparent opacity-50" />
        </div>

        {/* Tactical Overlay Elements */}
        <div className="absolute top-8 left-8 z-30">
           <div className="nexus-card bg-[var(--nx-bg-surface)]/80 backdrop-blur-md p-4 flex items-center gap-6">
              <div className="flex flex-col">
                 <span className="nexus-label">Transit Time</span>
                 <span className="text-xl font-black text-white font-mono uppercase">28 MINS</span>
              </div>
              <div className="w-[1px] h-10 bg-[var(--nx-border)]" />
              <div className="flex flex-col">
                 <span className="nexus-label">Operational Radius</span>
                 <span className="text-xl font-black text-[var(--nx-blue-primary)] font-mono uppercase">14.2 KM</span>
              </div>
           </div>
        </div>

        {/* Animated Route Path Simulation */}
        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" preserveAspectRatio="none">
           <defs>
              <filter id="glow">
                 <feGaussianBlur stdDeviation="3" result="blur" />
                 <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
           </defs>
           <motion.path 
             d="M100,100 L250,300 L500,200 L800,450" 
             fill="transparent" 
             stroke="var(--nx-blue-primary)" 
             strokeWidth="4" 
             strokeDasharray="10 10"
             filter="url(#glow)"
             animate={{ strokeDashoffset: [0, -100] }}
             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
           />
           <circle cx="100" cy="100" r="6" fill="var(--nx-blue-primary)" />
           <circle cx="800" cy="450" r="6" fill="var(--nx-red-primary)" />
        </svg>

        {/* Bottom Map Info Panels */}
        <div className="absolute bottom-8 right-8 z-30 flex flex-col gap-4 items-end">
           <div className="flex gap-4">
              <button className="nexus-card p-3 bg-black/60 backdrop-blur-md text-[var(--nx-text-tertiary)] hover:text-white transition-colors">
                 <Shield size={18} />
              </button>
              <button className="nexus-card p-3 bg-black/60 backdrop-blur-md text-[var(--nx-text-tertiary)] hover:text-white transition-colors">
                 <Activity size={18} />
              </button>
              <button className="nexus-card p-3 bg-black/60 backdrop-blur-md text-[var(--nx-text-tertiary)] hover:text-white transition-colors">
                 <Info size={18} />
              </button>
           </div>
           <div className="nexus-card bg-black/60 backdrop-blur-md px-4 py-2 text-[9px] font-mono text-[var(--nx-text-dim)] uppercase tracking-widest border border-white/5">
              Sector: Delhi-NC-09 • Mesh Fidelity: 98%
           </div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>
    </div>
  );
};

const TimelineItem = ({ dist, title, desc, type }: any) => (
  <div className="flex items-start gap-4 group">
    <div className="flex flex-col items-end w-14 shrink-0 pt-1">
       <span className="text-[10px] font-mono font-bold text-white tracking-tighter">{dist}</span>
    </div>
    <div className="relative pt-1 flex flex-col items-center shrink-0">
       <div className={`w-2.5 h-2.5 rounded-full z-10 transition-transform group-hover:scale-125 ${
         type === 'hospital' ? 'bg-[var(--nx-red-primary)] shadow-[0_0_8px_var(--nx-red-primary)]' : 
         type === 'police' ? 'bg-[var(--nx-blue-primary)] shadow-[0_0_8px_var(--nx-blue-primary)]' : 
         'bg-[var(--nx-green-primary)] shadow-[0_0_8px_var(--nx-green-primary)]'
       }`} />
    </div>
    <div className="nexus-card p-3 bg-white/[0.02] flex-1 group-hover:border-[var(--nx-border-active)] transition-all">
       <div className="text-[10px] font-black text-white uppercase tracking-tight mb-1">{title}</div>
       <div className="text-[9px] text-[var(--nx-text-dim)] uppercase font-mono">{desc}</div>
    </div>
  </div>
);

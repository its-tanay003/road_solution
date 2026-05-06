import React from 'react';
import { motion } from 'framer-motion';
import { 
  Milestone, 
  MapPin, 
  TrendingUp, 
  ShieldCheck, 
  Globe, 
  Activity,
  ChevronRight,
  IndianRupee,
  Users,
  Target
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';

const roadmapData = [
  {
    phase: "PHASE 1: PILOT",
    timeline: "Months 0-6",
    status: "Ready for Deployment",
    cities: ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Hyderabad"],
    budget: "₹4.2 Crore",
    targets: "10,000 incidents/mo, 95% accuracy",
    color: "var(--color-emergency)",
    integrations: ["108 GVK EMRI", "AIIMS Level 1", "iRAD MoRTH"]
  },
  {
    phase: "PHASE 2: STATE ROLLOUT",
    timeline: "Months 6-18",
    status: "Strategic Planning",
    cities: ["50 Tier-1 & Tier-2 Cities", "10 States"],
    budget: "₹28 Crore",
    targets: "2 Lakh incidents/mo, <8 min response",
    color: "var(--color-amber)",
    integrations: ["NHAI Patrol", "Ayushman Bharat", "State 108 Control"]
  },
  {
    phase: "PHASE 3: NATIONAL",
    timeline: "Months 18-36",
    status: "Scale & Optimize",
    cities: ["All 730 Districts", "National Highways"],
    budget: "₹112 Crore",
    targets: "National Coverage, 100% Digital Audit",
    color: "var(--color-safe)",
    integrations: ["DigiLocker V-Sign", "Unified Health ID", "NDHM"]
  }
];

const projections = [
  { year: '2026', lives: 450, cost: 4.2 },
  { year: '2027', lives: 12000, cost: 28 },
  { year: '2028', lives: 85000, cost: 112 },
  { year: '2029', lives: 150000, cost: 145 }
];

export const Roadmap = () => {
  return (
    <div className="min-h-screen bg-night text-white font-ui pb-20">
      <div className="max-w-7xl mx-auto p-6 lg:p-10">
        {/* Header Section */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emergency/20 rounded-2xl flex items-center justify-center text-emergency border border-emergency/30">
              <TrendingUp size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic italic-shadow">Deployment Roadmap</h1>
              <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.3em]">SIH 2026 National Strategic Vision</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="glass-card p-6 border-l-4 border-emergency">
              <p className="text-[10px] font-bold opacity-50 uppercase mb-1">Total Lives Impacted</p>
              <h3 className="text-3xl font-black">1.5 Lakh+</h3>
              <p className="text-[10px] text-emergency font-bold mt-2">PROJECTED BY 2029</p>
            </div>
            <div className="glass-card p-6 border-l-4 border-safe">
              <p className="text-[10px] font-bold opacity-50 uppercase mb-1">Avg Response Goal</p>
              <h3 className="text-3xl font-black">8.2 Min</h3>
              <p className="text-[10px] text-safe font-bold mt-2">NATIONWIDE TARGET</p>
            </div>
            <div className="glass-card p-6 border-l-4 border-cyan">
              <p className="text-[10px] font-bold opacity-50 uppercase mb-1">Infrastructure Load</p>
              <h3 className="text-3xl font-black">Distributed</h3>
              <p className="text-[10px] text-cyan font-bold mt-2">EDGE-FIRST ARCHITECTURE</p>
            </div>
          </div>
        </header>

        {/* Timeline Section */}
        <section className="relative mb-20">
          <div className="absolute left-[31px] md:left-1/2 top-0 bottom-0 w-px bg-white/10 hidden md:block" />
          
          <div className="space-y-12">
            {roadmapData.map((phase, idx) => (
              <motion.div 
                key={phase.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row gap-8 items-start ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="flex-1 w-full">
                  <div 
                    className="glass-card p-8 relative overflow-hidden group hover:border-white/20 transition-all"
                    style={{ borderTop: `4px solid ${phase.color}` }}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Milestone size={120} />
                    </div>
                    
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-[10px] font-black px-2 py-1 bg-white/5 rounded-full mb-2 inline-block border border-white/10 uppercase tracking-widest opacity-60">
                          {phase.timeline}
                        </span>
                        <h2 className="text-2xl font-black italic">{phase.phase}</h2>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono text-slate-500 uppercase">Estimated Budget</p>
                        <p className="text-xl font-black text-white">{phase.budget}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <MapPin size={12} /> Target Coverage
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {phase.cities.map(city => (
                              <span key={city} className="text-xs bg-white/5 px-2 py-1 rounded border border-white/5">{city}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Globe size={12} /> Key Integrations
                          </h4>
                          <div className="space-y-1">
                            {phase.integrations.map(int => (
                              <div key={int} className="flex items-center gap-2 text-xs text-slate-300">
                                <ChevronRight size={10} className="text-cyan" /> {int}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Success Metrics</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <span className="text-xs text-slate-400">Response Accuracy</span>
                            <span className="text-sm font-black text-safe">95%+</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-safe" style={{ width: '95%' }} />
                          </div>
                          
                          <div className="flex justify-between items-end">
                            <span className="text-xs text-slate-400">Deployment Stability</span>
                            <span className="text-sm font-black text-cyan">99.9%</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan" style={{ width: '99%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex flex-col items-center justify-center pt-10">
                  <div className="w-12 h-12 rounded-full border-4 border-night bg-slate-800 flex items-center justify-center z-10">
                    <div className={`w-3 h-3 rounded-full animate-pulse`} style={{ backgroundColor: phase.color }} />
                  </div>
                </div>

                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Financial & Impact Projection Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <div className="glass-card p-8">
            <h3 className="text-xl font-black mb-6 uppercase italic">Impact Projection (Lives Saved)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projections}>
                  <defs>
                    <linearGradient id="colorLives" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-emergency)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-emergency)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="year" stroke="#ffffff40" fontSize={10} tickLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="lives" stroke="var(--color-emergency)" strokeWidth={3} fillOpacity={1} fill="url(#colorLives)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-xl font-black mb-6 uppercase italic">Scale Cost Optimization</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="year" stroke="#ffffff40" fontSize={10} tickLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    cursor={{ fill: '#ffffff05' }}
                  />
                  <Bar dataKey="cost" fill="var(--color-cyan)" radius={[4, 4, 0, 0]} name="Budget (Cr)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Footer Info */}
        <div className="text-center p-10 border border-white/5 rounded-[3rem] bg-white/2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4">Evaluation Verification</p>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-safe" size={16} />
              <span className="text-xs font-bold uppercase">PPP Model Hardened</span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee className="text-safe" size={16} />
              <span className="text-xs font-bold uppercase">Optimized Cloud OpEx</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="text-safe" size={16} />
              <span className="text-xs font-bold uppercase">National Scalability Audit Pass</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

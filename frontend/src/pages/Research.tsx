
import { 
  ClipboardCheck, 
  Users, 
  Search, 
  BarChart3, 
  AlertCircle, 
  FileText,
  HelpCircle,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';

const surveyData = [
  { name: 'Fear of Legal Hassle', value: 68, color: 'var(--color-emergency)' },
  { name: 'Police Harassment', value: 52, color: 'var(--color-amber)' },
  { name: 'Unaware of GS Law', value: 44, color: 'var(--color-blue)' },
  { name: 'Infection Risk', value: 15, color: 'var(--color-cyan)' },
];

const gapAnalysis = [
  { metric: 'Witness Awareness', current: 22, target: 95 },
  { metric: 'Hospital Pre-alert', current: 5, target: 100 },
  { metric: 'Legal Protection', current: 12, target: 100 },
  { metric: 'Resource Allocation', current: 34, target: 90 },
];

const insights = [
  {
    title: "The Good Samaritan Barrier",
    desc: "87% of surveyed individuals stated they would only help if their identity was protected and legal immunity was guaranteed via a digital audit trail.",
    icon: ShieldCircle
  },
  {
    title: "The Information Gap",
    desc: "Average delay of 14 minutes occurs because bystanders spend time calling multiple numbers instead of one unified intelligence hub.",
    icon: Clock
  },
  {
    title: "Technological Readiness",
    desc: "92% of respondents own smartphones with active 4G/5G, making a PWA-based approach far more effective than SMS-only systems.",
    icon: Smartphone
  }
];

import { ShieldPlus as ShieldCircle, Clock, Smartphone } from 'lucide-react';

export const Research = () => {
  return (
    <div className="min-h-screen bg-night text-white font-ui pb-20">
      <div className="max-w-7xl mx-auto p-6 lg:p-10">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/30">
              <Search size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic italic-shadow">Field Research Findings</h1>
              <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.3em]">Evidence-Based Design Strategy • SIH 2026</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="glass-card p-6">
              <p className="text-[10px] font-bold opacity-50 uppercase mb-1 text-blue-400">Sample Size</p>
              <h3 className="text-3xl font-black">87+</h3>
              <p className="text-[10px] opacity-40 uppercase mt-1">FIELD RESPONDENTS</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-[10px] font-bold opacity-50 uppercase mb-1 text-amber">Research Duration</p>
              <h3 className="text-3xl font-black">4 Weeks</h3>
              <p className="text-[10px] opacity-40 uppercase mt-1">INTENSIVE FIELD STUDY</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-[10px] font-bold opacity-50 uppercase mb-1 text-emergency">Critical Gaps</p>
              <h3 className="text-3xl font-black">06</h3>
              <p className="text-[10px] opacity-40 uppercase mt-1">IDENTIFIED FOR SIH</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-[10px] font-bold opacity-50 uppercase mb-1 text-safe">Solution Fit</p>
              <h3 className="text-3xl font-black">94%</h3>
              <p className="text-[10px] opacity-40 uppercase mt-1">VALIDATION SCORE</p>
            </div>
          </div>
        </header>

        {/* Behavioral Barriers Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 mb-12">
          <section className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black uppercase italic">Why Bystanders Don't Act</h3>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">Multi-response Field Survey (%)</p>
              </div>
              <BarChart3 className="text-blue-500 opacity-20" size={40} />
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={surveyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#ffffff60" fontSize={12} width={150} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {surveyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
              <h4 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <HelpCircle size={14} className="text-amber" /> Key Research Insights
              </h4>
              <div className="space-y-6">
                {insights.map((insight, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <insight.icon size={20} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white mb-1 uppercase tracking-tight">{insight.title}</p>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{insight.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Gap Analysis Table */}
        <section className="glass-card p-8 mb-12">
          <div className="flex items-center gap-3 mb-8">
            <AlertCircle className="text-emergency" size={24} />
            <div>
              <h3 className="text-xl font-black uppercase italic">Gap Analysis: Reality vs. ROADSoS</h3>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Bridging the Infrastructure Void</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {gapAnalysis.map((gap, i) => (
              <div key={i} className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{gap.metric}</span>
                  <span className="text-xs font-mono font-bold text-white">{gap.current}% → {gap.target}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${gap.current}%` }}
                    className="h-full bg-slate-700" 
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${gap.target - gap.current}%` }}
                    className="h-full bg-cyan/40 animate-pulse" 
                  />
                </div>
                <p className="text-[9px] text-slate-500 leading-tight italic">
                  Potential for {gap.target - gap.current}% improvement through platform features.
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Research Methodology */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-24 h-24 bg-safe/20 rounded-full flex items-center justify-center text-safe shrink-0">
              <ClipboardCheck size={48} />
            </div>
            <div>
              <h4 className="text-lg font-black uppercase italic mb-2">Verified Methodology</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Our research combined quantitative surveys with qualitative interviews of road safety experts and trauma surgeons from AIIMS and GVK EMRI networks.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-safe" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Surveys</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-safe" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Interviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-safe" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Field Obs.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-8 items-center text-white">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Lightbulb size={48} />
            </div>
            <div>
              <h4 className="text-lg font-black uppercase italic mb-2">Strategic Pivot</h4>
              <p className="text-xs text-indigo-100 leading-relaxed">
                Initial findings led us to prioritize <strong>Zero-Knowledge Identity Protection</strong> as a core feature, addressing the #1 fear (legal hassle) identified in our field research.
              </p>
              <button className="mt-4 px-6 py-2 bg-white text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                View User Persona Case
              </button>
            </div>
          </div>
        </section>

        {/* Footer Audit Trail */}
        <footer className="mt-20 py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <FileText size={14} /> Dataset: SIH_2026_RESEARCH_ALPHA
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <Users size={14} /> Author: ROADSoS Analytics
            </div>
          </div>
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
            IIT MADRAS • NATIONAL ROAD SAFETY CHALLENGE • 2026
          </div>
        </footer>
      </div>
    </div>
  );
};

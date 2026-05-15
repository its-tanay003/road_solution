import { lazy, Suspense, type FC } from 'react';
import { motion } from 'framer-motion';
import { ImpactCalculator } from '../components/ImpactCalculator';
const RoadIntelligenceReport = lazy(() => import('../components/RoadIntelligenceReport').then(m => ({ default: m.RoadIntelligenceReport })));
import PageLoadingFallback from '../components/PageLoadingFallback';
import { PredictiveRiskEngine } from '../components/PredictiveRiskEngine';
import { Activity, Shield, Map as MapIcon, Zap, AlertCircle } from 'lucide-react';

export const Dashboard: FC = () => {
  return (
    <div className="min-h-screen bg-(--clr-bg) text-(--clr-text) p-6 lg:p-10 font-ui relative overflow-hidden">
      {/* Background HUD elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-(--clr-blue) to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-(--clr-blue) to-transparent" />
        <div className="scanline-overlay" />
      </div>

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 relative">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold hologram-text mb-2">MISSION DASHBOARD</h1>
          <div className="flex items-center gap-4 text-[10px] font-mono text-(--clr-text-2) tracking-[0.3em] uppercase">
            <span className="flex items-center gap-1.5 text-(--clr-green)"><Zap size={12} /> SYSTEM ONLINE</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>GRID: CHENNAI_METRO_04</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>SECURE_AUTH: RSA_4096</span>
          </div>
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <div className="flex-1 lg:flex-none px-6 py-3 bg-white/5 border border-(--clr-border) rounded-xl flex items-center gap-3">
            <Activity className="text-(--clr-red)" size={20} />
            <div>
              <p className="text-[10px] font-mono text-(--clr-text-2) uppercase">Active Incidents</p>
              <p className="font-bold">04</p>
            </div>
          </div>
          <div className="flex-1 lg:flex-none px-6 py-3 bg-white/5 border border-(--clr-border) rounded-xl flex items-center gap-3">
            <Shield className="text-(--clr-blue)" size={20} />
            <div>
              <p className="text-[10px] font-mono text-(--clr-text-2) uppercase">Units Ready</p>
              <p className="font-bold">142</p>
            </div>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative">
        {/* Left Column - Impact Calculator (ROI) */}
        <div className="xl:col-span-2 space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-4 w-1 bg-(--clr-blue) rounded-full" />
              <h2 className="text-sm font-mono tracking-widest uppercase text-(--clr-text-2)">Strategic Impact Analysis</h2>
            </div>
            <ImpactCalculator />
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-4 w-1 bg-[#2979FF] rounded-full" />
              <h2 className="text-sm font-mono tracking-widest uppercase text-white/50">Predictive Safety Forecasting</h2>
            </div>
            <PredictiveRiskEngine />
          </section>

          {/* Quick Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Avg Dispatch Time', value: '87s', color: 'text-(--clr-green)', sub: '-82% vs Natl Avg' },
              { label: 'Data Accuracy', value: '99.4%', color: 'text-(--clr-blue)', sub: 'Verified by AI' },
              { label: 'Golden Hour Success', value: '74%', color: 'text-(--clr-amber)', sub: '+18% this month' },
            ].map((m, i) => (
              <motion.div 
                key={m.label}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-(--clr-border) hover:bg-white/10 transition-all cursor-crosshair group"
              >
                <p className="text-[10px] font-mono text-(--clr-text-2) mb-2 uppercase">{m.label}</p>
                <p className={`text-3xl font-bold ${m.color} mb-1`}>{m.value}</p>
                <p className="text-[10px] font-mono text-white/40">{m.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column - Intelligence Report */}
        <div className="space-y-8">
          <section className="h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-4 w-1 bg-(--clr-red) rounded-full" />
              <h2 className="text-sm font-mono tracking-widest uppercase text-(--clr-text-2)">AI Intelligence</h2>
            </div>
            <Suspense fallback={<PageLoadingFallback />}>
              <RoadIntelligenceReport />
            </Suspense>
          </section>
        </div>
      </main>

      <footer className="mt-12 p-6 border border-(--clr-border) rounded-2xl bg-white/2 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-(--clr-text-2) uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><MapIcon size={14} /> GPS_LOCK: STABLE</span>
          <span className="flex items-center gap-2"><Zap size={14} /> POWER: GRID_STABLE</span>
          <div className="flex items-center gap-4 ml-6 pl-6 border-l border-white/10">
            <a href="/roadmap" className="hover:text-white transition-colors">Roadmap</a>
            <a href="/research" className="hover:text-white transition-colors">Research</a>
            <a href="/technical" className="hover:text-white transition-colors">Technical</a>
          </div>
        </div>
        <div className="flex items-center gap-2 text-(--clr-red) animate-pulse">
          <AlertCircle size={14} /> LIVE MONITORING ACTIVE
        </div>
      </footer>
    </div>
  );
};

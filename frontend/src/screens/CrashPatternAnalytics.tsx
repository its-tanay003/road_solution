import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShieldCheck, Download, Calendar, Share2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

// Lazy loaded chart components
const TimePatternHeatmap = lazy(() => import('../components/TimePatternHeatmap').then(m => ({ default: m.TimePatternHeatmap })));
const RoadTypeBreakdown = lazy(() => import('../components/RoadTypeBreakdown').then(m => ({ default: m.RoadTypeBreakdown })));
const CausationWordCloud = lazy(() => import('../components/CausationWordCloud').then(m => ({ default: m.CausationWordCloud })));
const PredictiveHotspotCard = lazy(() => import('../components/PredictiveHotspotCard').then(m => ({ default: m.PredictiveHotspotCard })));


const ChartSkeleton = ({ className }: { className?: string }) => (
  <div className={`w-full h-full rounded-[2.5rem] bg-white/5 border border-white/10 animate-pulse flex items-center justify-center ${className}`}>
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-2 border-[#2979FF]/20 border-t-[#2979FF] animate-spin" />
      <div className="absolute inset-0 blur-xl bg-[#2979FF]/20 rounded-full" />
    </div>
  </div>
);

const CrashPatternAnalytics: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#05080F] text-white p-6 pb-24 lg:p-10 font-sans selection:bg-[#2979FF] selection:text-white">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="px-3 py-1 rounded-full bg-[#2979FF]/10 border border-[#2979FF]/20 text-[10px] font-black text-[#2979FF] tracking-widest uppercase">
              Strategic Safety Intelligence
            </div>
            <div className="flex items-center gap-2 text-white/40 text-[10px] font-mono">
              <Calendar size={12} />
              Q2 2026 AUDIT
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tightest leading-none italic uppercase">
            CRASH PATTERN <span className="text-[#2979FF]">ANALYTICS</span>
          </h1>
          <p className="text-white/40 mt-3 max-w-xl text-sm leading-relaxed font-medium">
            Aggregated intelligence platform for predictive road hazard mitigation. Analyzing 1.2M+ data points across NHAI and State Highway networks.
          </p>
        </motion.div>

        <div className="flex gap-4">
          <Button variant="secondary" className="gap-2">
            <Share2 size={16} /> Share Audit
          </Button>
          <Button variant="primary" className="gap-2 shadow-[0_0_20px_rgba(41,121,255,0.3)]">
            <Download size={16} /> Export Report
          </Button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - 8/12 */}
        <div className="lg:col-span-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="h-[500px]"
          >
            <Suspense fallback={<ChartSkeleton />}>
              <TimePatternHeatmap />
            </Suspense>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="h-[450px]"
            >
              <Suspense fallback={<ChartSkeleton />}>
                <RoadTypeBreakdown />
              </Suspense>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="h-[450px]"
            >
              <Suspense fallback={<ChartSkeleton />}>
                <CausationWordCloud />
              </Suspense>
            </motion.div>
          </div>
        </div>

        {/* Right Column - 4/12 */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Suspense fallback={<ChartSkeleton className="h-[400px]" />}>
              <PredictiveHotspotCard />
            </Suspense>
          </motion.div>


          {/* AI Safety Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-8 rounded-[2.5rem] bg-linear-to-br from-[#101726] to-[#0A0F1A] border border-white/10 relative overflow-hidden"
          >
            <div className="relative z-10">
              <h3 className="text-sm font-black text-white/40 uppercase tracking-widest mb-6">Network Health Index</h3>
              <div className="flex items-end gap-2">
                <span className="text-6xl font-black text-[#2979FF]">84</span>
                <span className="text-xl font-bold text-white/20 mb-2">/100</span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '84%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-linear-to-r from-[#2979FF] to-[#00E5FF]" 
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono uppercase">
                  <span className="text-[#2979FF]">Risk Mitigation: Excellent</span>
                  <span className="text-white/40">+4.2% MoM</span>
                </div>
              </div>
              <p className="mt-8 text-xs text-white/50 leading-relaxed font-medium italic">
                "Systemic improvements in Golden Hour response times have contributed to a 12% reduction in overall network fatality rates."
              </p>
            </div>
            
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#2979FF]/10 blur-[100px] rounded-full" />
          </motion.div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group flex flex-col items-center text-center">
              <ShieldCheck className="text-[#2979FF] mb-3 group-hover:scale-110 transition-transform" size={24} />
              <span className="text-[10px] font-black uppercase text-white tracking-widest">Verify Safety</span>
            </button>
            <button className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group flex flex-col items-center text-center">
              <LayoutDashboard className="text-[#F50057] mb-3 group-hover:scale-110 transition-transform" size={24} />
              <span className="text-[10px] font-black uppercase text-white tracking-widest">Live View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashPatternAnalytics;

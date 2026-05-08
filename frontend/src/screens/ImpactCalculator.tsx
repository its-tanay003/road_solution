import React from 'react';
import { motion } from 'framer-motion';
import { ImpactCalculator as Calculator } from '../components/ImpactCalculator';
import { ChevronLeft, Share2, Download, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ImpactCalculator: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-(--clr-bg) text-(--clr-text) p-6 lg:p-12 font-ui relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-(--clr-blue)/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-(--clr-saffron)/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto relative z-10"
      >
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="p-3 rounded-full bg-white/5 border border-(--clr-border) hover:bg-white/10 transition-colors group"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold hologram-text mb-2 tracking-tighter">IMPACT CALCULATOR</h1>
              <div className="flex items-center gap-3 text-[10px] font-mono text-(--clr-text-2) tracking-[0.2em] uppercase">
                <span className="flex items-center gap-1.5 text-(--clr-green)"><ShieldCheck size={12} /> POLICY-GRADE ANALYSIS</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>DATA SOURCE: MoRTH 2023</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-6 py-3 rounded-xl bg-white/5 border border-(--clr-border) font-bold text-xs flex items-center gap-2 hover:bg-white/10 transition-all">
              <Download size={16} /> EXPORT PDF
            </button>
            <button className="px-6 py-3 rounded-xl bg-(--clr-blue) text-white font-bold text-xs flex items-center gap-2 hover:shadow-[0_0_20px_var(--clr-glow-blue)] transition-all">
              <Share2 size={16} /> SHARE REPORT
            </button>
          </div>
        </header>

        <main className="space-y-12">
          <section className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-linear-to-b from-(--clr-blue) via-(--clr-blue)/20 to-transparent rounded-full" />
            <Calculator />
          </section>

          {/* Policy Context Footer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/2 border border-(--clr-border) space-y-4">
              <h3 className="text-sm font-bold text-(--clr-blue) tracking-widest uppercase">The Golden Hour</h3>
              <p className="text-xs text-(--clr-text-2) leading-relaxed">
                Every 1 minute reduction in response time correlates to a 7% increase in survival probability for critical trauma victims. ROADSoS targets a 45% reduction via AI-mesh routing.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white/2 border border-(--clr-border) space-y-4">
              <h3 className="text-sm font-bold text-(--clr-saffron) tracking-widest uppercase">Economic Value</h3>
              <p className="text-xs text-(--clr-text-2) leading-relaxed">
                The socio-economic cost of road accidents in India is estimated at 3.14% of GDP. Preventing one fatality saves approximately ₹91.2 Lakhs in Value of Statistical Life (VSL).
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white/2 border border-(--clr-border) space-y-4">
              <h3 className="text-sm font-bold text-(--clr-green) tracking-widest uppercase">Scale Potential</h3>
              <p className="text-xs text-(--clr-text-2) leading-relaxed">
                By integrating existing bystander networks, we create a "First Responder Mesh" that doesn't just wait for ambulances but initiates life support within 120 seconds.
              </p>
            </div>
          </div>
        </main>
      </motion.div>

      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px] z-0" />
    </div>
  );
};

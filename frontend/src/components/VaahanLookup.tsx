import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, User, Shield, CheckCircle2, XCircle, Search, Database } from 'lucide-react';

export const VaahanLookup: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'searching' | 'results'>('idle');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('searching');
      setTimeout(() => setStatus('results'), 2500);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full bg-white/5 border border-(--clr-border) rounded-2xl overflow-hidden mt-4">
      <div className="p-3 border-b border-(--clr-border) bg-white/2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={14} className="text-(--clr-blue)" />
          <span className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-widest">VAAHAN VEHICLE REGISTRY</span>
        </div>
        {status === 'results' && (
          <span className="flex items-center gap-1 text-[8px] font-mono text-(--clr-green) uppercase">
            <CheckCircle2 size={10} /> Verified
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div 
            key="idle" exit={{ opacity: 0 }}
            className="p-6 flex flex-col items-center justify-center gap-2 text-(--clr-text-2)"
          >
            <Search size={20} className="opacity-20" />
            <p className="text-[10px] font-mono tracking-tighter">WAITING FOR PLATE RECOGNITION...</p>
          </motion.div>
        )}

        {status === 'searching' && (
          <motion.div 
            key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-8 relative overflow-hidden flex flex-col items-center justify-center gap-4"
          >
            <div className="scanline-sweep" />
            <Car size={32} className="text-(--clr-blue) animate-pulse" />
            <div className="space-y-1 text-center">
              <p className="text-xs font-bold text-white">TN 09 AZ 4521</p>
              <p className="text-[10px] font-mono text-(--clr-text-2) animate-pulse">QUERYING MORTH DATABASE...</p>
            </div>
          </motion.div>
        )}

        {status === 'results' && (
          <motion.div 
            key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Car size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold">Maruti Suzuki Swift VXI</p>
                <p className="text-[10px] font-mono text-(--clr-text-2)">TN 09 AZ 4521 • WHITE • 2019</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Insurance', val: 'Valid (Mar 2026)', ok: true, icon: Shield },
                { label: 'PUC', val: 'Valid (Nov 2025)', ok: true, icon: CheckCircle2 },
                { label: 'Fitness', val: 'Verified', ok: true, icon: CheckCircle2 },
                { label: 'Owner', val: 'NAME_WITHHELD', ok: true, icon: User },
              ].map(field => (
                <div key={field.label} className="p-2 rounded-lg bg-black/20 border border-white/5">
                  <p className="text-[8px] font-mono text-(--clr-text-2) uppercase mb-1">{field.label}</p>
                  <div className="flex items-center gap-1.5">
                    <field.icon size={10} className={field.ok ? "text-(--clr-green)" : "text-(--clr-red)"} />
                    <span className="text-[10px] font-bold text-white/90 truncate">{field.val}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center text-[8px] font-mono text-white/20 uppercase">
              <span>Source: VAAHAN National DB</span>
              <span>Sync: 0.4s</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React from 'react';
import { EvaluationSidebar } from './EvaluationSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { IndiaStatsTicker } from './IndiaStatsTicker';
import { HUDBar } from './HUDBar';

interface EvaluationLayoutProps {
  children: React.ReactNode;
}

export const EvaluationLayout: React.FC<EvaluationLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-night">
      <EvaluationSidebar />
      <IndiaStatsTicker />
      <HUDBar onSettingsClick={() => {}} />
      
      <main className="flex-1 flex flex-col mt-[80px] pb-[72px] lg:pl-64 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Mobile-only Evaluation Quick Links */}
      <div className="lg:hidden fixed bottom-[72px] left-0 right-0 h-12 glass-dark border-t border-white/5 flex items-center justify-around z-40">
        <a href="/roadmap" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white">Roadmap</a>
        <a href="/research" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white">Research</a>
        <a href="/technical" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white">Technical</a>
      </div>
    </div>
  );
};

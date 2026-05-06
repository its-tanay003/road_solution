import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronUp, CheckCircle2, Radio, Truck, Building2 } from 'lucide-react';
import { useEmergencyStore } from '../store';

export const NHAISmartHighwayPanel: React.FC = () => {
  const { crashTriggered } = useEmergencyStore();
  const [isVisible, setIsVisible] = useState(false);
  const [vmsText, setVmsText] = useState("");
  const [barrierStatus, setBarrierStatus] = useState("ACTIVATING");
  const [responseStep, setResponseStep] = useState(0);

  const fullVmsMessage = "ACCIDENT AHEAD / 500 METRES / REDUCE SPEED";

  useEffect(() => {
    if (crashTriggered) {
      const visibilityTimer = setTimeout(() => setIsVisible(true), 0);
      
      // Staggered responses logic
      const t1 = setTimeout(() => setResponseStep(1), 800);
      const t2 = setTimeout(() => setResponseStep(2), 1600);
      const t3 = setTimeout(() => setResponseStep(3), 2400);

      // VMS Typing effect
      let charIndex = 0;
      const typingInterval = setInterval(() => {
        if (charIndex < fullVmsMessage.length) {
          setVmsText(fullVmsMessage.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typingInterval);
        }
      }, 60);

      return () => {
        clearTimeout(visibilityTimer);
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearInterval(typingInterval);
      };
    } else {
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        setVmsText("");
        setResponseStep(0);
      }, 0);
      return () => clearTimeout(hideTimer);
    }
  }, [crashTriggered]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-9999 bg-[#0A0F1A]/95 backdrop-blur-2xl border-t border-white/10 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-linear-to-r from-[#2979FF]/10 to-transparent">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="13.33" fill="#FF9933"/>
                  <rect y="13.33" width="40" height="13.33" fill="#FFFFFF"/>
                  <rect y="26.66" width="40" height="13.33" fill="#138808"/>
                  <circle cx="20" cy="20" r="6" stroke="#000080" strokeWidth="1"/>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <line 
                      key={i} 
                      x1="20" y1="20" 
                      x2={20 + 6 * Math.cos((i * 15 * Math.PI) / 180)} 
                      y2={20 + 6 * Math.sin((i * 15 * Math.PI) / 180)} 
                      stroke="#000080" 
                      strokeWidth="0.5" 
                    />
                  ))}
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-3">
                  NHAI SMART HIGHWAY CONTROL
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[9px] font-black tracking-widest uppercase border border-amber-500/30">
                    INTEGRATED SYSTEM
                  </span>
                </h2>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-0.5">
                  Automated Infrastructure Response Mesh v2.4
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsVisible(false)}
              className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white"
              title="Close Panel"
            >
              <ChevronUp className="rotate-180" size={24} />
            </button>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Response 1: Traffic Barrier */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: responseStep >= 1 ? 1 : 0, x: responseStep >= 1 ? 0 : -20 }}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-[#2979FF]" />
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Traffic Barrier</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase">
                  <CheckCircle2 size={10} /> Confirmed
                </div>
              </div>

              {/* Barrier Animation */}
              <div className="h-24 bg-black/40 rounded-2xl flex items-center justify-center relative">
                <div className="absolute left-1/4 bottom-4 w-4 h-12 bg-gray-700 rounded-t-sm" />
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: -90 }}
                  transition={{ duration: 1.2, delay: 1, ease: "easeOut" }}
                  onAnimationComplete={() => setBarrierStatus("LOCKED")}
                  className="absolute left-[calc(25%+6px)] bottom-12 w-32 h-2 bg-orange-500 origin-left rounded-r-full shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                  style={{ border: '2px solid rgba(255,255,255,0.2)' }}
                >
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex-1 border-r border-white/20 h-full last:border-r-0" />
                    ))}
                  </div>
                </motion.div>
                <div className="absolute top-4 right-4 flex flex-col items-end">
                   <span className="text-[8px] font-mono text-white/30 uppercase">Status</span>
                   <span className="text-xs font-bold text-emerald-500">{barrierStatus}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Lane 2 BARRIER ACTIVATED</p>
                <p className="text-[11px] text-white/60">NH-48, KM 342 · Hazard Containment</p>
                <div className="flex items-center gap-2 mt-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-mono text-white/40">12 vehicles safely stopped</span>
                </div>
              </div>
            </motion.div>

            {/* Response 2: VMS Board */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: responseStep >= 2 ? 1 : 0, x: responseStep >= 2 ? 0 : -20 }}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4 group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Radio size={18} className="text-amber-500" />
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Variable Sign (VMS)</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase">
                  <CheckCircle2 size={10} /> Live
                </div>
              </div>

              <div className="h-24 bg-black rounded-xl p-4 flex flex-col justify-center border-4 border-gray-800 shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,191,0,0.1)_0%,transparent_70%)] pointer-events-none" />
                <p className="text-amber-500 font-mono text-xs text-center leading-relaxed font-bold uppercase tracking-wider h-full flex items-center justify-center">
                  {vmsText}
                  <motion.span 
                    animate={{ opacity: [1, 0] }} 
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="inline-block w-1.5 h-4 bg-amber-500 ml-1"
                  />
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-white">VMS UPDATED — TN NH-48</p>
                <p className="text-[11px] text-white/60">Marker 342 · Upstream Alerting</p>
                <div className="flex items-center gap-2 mt-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                   <span className="text-[10px] font-mono text-white/40">Propagation: 2km Coverage</span>
                </div>
              </div>
            </motion.div>

            {/* Response 3: Toll & Emergency */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: responseStep >= 3 ? 1 : 0, x: responseStep >= 3 ? 0 : -20 }}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4 group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-[#F50057]" />
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Toll & NDRF Mesh</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase">
                  <CheckCircle2 size={10} /> Alerted
                </div>
              </div>

              <div className="h-24 bg-black/40 rounded-2xl flex items-center justify-center gap-6 overflow-hidden relative">
                <div className="flex flex-col items-center gap-2">
                   <div className="relative">
                      <Building2 className="text-white/60" size={32} />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-ping" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full" />
                   </div>
                   <span className="text-[8px] font-mono text-white/40">TOOTH #7</span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex flex-col items-center gap-2">
                   <Truck className="text-[#2979FF]" size={32} />
                   <span className="text-[8px] font-mono text-white/40">NDRF UNIT</span>
                </div>
                <div className="absolute bottom-1 w-full text-center">
                   <span className="text-[7px] font-mono text-[#F50057] uppercase tracking-tighter">Emergency Lane Priority 1 Active</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-white">ORR TOLL — ALERTED</p>
                <p className="text-[11px] text-white/60">Emergency lane cleared · ETA 4 min</p>
                <div className="flex items-center gap-2 mt-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                   <span className="text-[10px] font-mono text-white/40">NDRF Unit #7 Notified</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Stats */}
          <div className="px-8 py-4 bg-white/2 border-t border-white/5 flex items-center justify-between">
             <div className="flex gap-6">
                <div className="flex flex-col">
                   <span className="text-[8px] font-mono text-white/30 uppercase">Protocol</span>
                   <span className="text-[10px] font-bold text-white/80">NHAI_AUTO_RESPONSE_G4</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[8px] font-mono text-white/30 uppercase">Latency</span>
                   <span className="text-[10px] font-bold text-emerald-500">42ms (Mesh Sync)</span>
                </div>
             </div>
             <div className="text-[9px] font-mono text-white/20 uppercase tracking-[0.2em]">
                Secure Link: NHAI_DC_CHENNAI_NORTH_042
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

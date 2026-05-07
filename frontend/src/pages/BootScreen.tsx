import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Cpu, Database, Wifi } from 'lucide-react';

interface BootScreenProps {
  onComplete: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const bootMessages = [
      "[ OK ] INITIALIZING NEXUS KERNEL",
      "[ OK ] ALLOCATING NEURAL BUFFER: 12GB",
      "[ OK ] MESH RELAY DAEMON STARTED (PORT 4432)",
      "[ OK ] GEOLOCATION ENCRYPTION ACTIVE",
      "[ OK ] CLAUDE-3.5 ANALYTICS HUB CONNECTED",
      "[ OK ] ANTHROPIC REASONING CORE: ONLINE (SONNET-V2)",
      "[ OK ] BLOCKCHAIN AUDIT PROXY READY",
      "[ OK ] ROADSoS v2.0 — NEXUS INTERFACE READY"
    ];

    let currentLog = 0;
    const logInterval = setInterval(() => {
      if (currentLog < bootMessages.length) {
        setLogs(prev => [...prev, bootMessages[currentLog]]);
        currentLog++;
      } else {
        clearInterval(logInterval);
      }
    }, 250);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(onComplete, 1000);
          return 100;
        }
        return prev + 1.2;
      });
    }, 30);

    return () => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#0A0C0F] z-10000 flex flex-col items-center justify-center font-sans overflow-hidden">
      {/* Cinematic Grid & Background Elements */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-size-[60px_60px]" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black" />
      
      {/* Central Tactical UI */}
      <div className="relative z-10 flex flex-col items-center">
         <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="relative mb-16"
         >
            {/* Visual Pulse */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-nx-red-primary rounded-full blur-[80px]"
            />
            
            <div className="relative w-32 h-32 flex items-center justify-center border border-nx-border rounded-sm bg-[#0F1218]">
               <ShieldAlert size={64} className="text-nx-red-primary drop-shadow-[0_0_20px_rgba(255,59,59,0.5)]" />
               
               {/* Orbital elements */}
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-[-20px] border border-dashed border-white/10 rounded-full"
               />
               <motion.div 
                 animate={{ rotate: -360 }}
                 transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-[-40px] border border-dotted border-white/5 rounded-full"
               />
            </div>
         </motion.div>

         <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              animate={{ opacity: 1, letterSpacing: "1em" }}
              className="text-4xl font-black text-white uppercase italic ml-[1em]"
            >
              ROADSoS
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              className="text-[10px] font-bold text-white uppercase tracking-[0.4em] mt-4 ml-[0.4em]"
            >
              Emergency Intelligence Protocol
            </motion.p>
         </div>

         {/* Loading Visualization */}
         <div className="mt-20 flex flex-col items-center">
            <div className="flex items-center gap-1 mb-4">
               {[...Array(20)].map((_, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: (progress / 5) > i ? 1 : 0.1 }}
                   className={`w-1.5 h-4 rounded-sm ${i > 15 ? 'bg-nx-red-primary shadow-[0_0_8px_var(--nx-red-primary)]' : 'bg-nx-blue-primary'}`}
                 />
               ))}
            </div>
            <div className="flex items-center gap-8 text-[9px] font-mono font-bold text-nx-text-dim uppercase tracking-widest">
               <div className="flex items-center gap-2"><Cpu size={12} /> CORE: ONLINE</div>
               <div className="flex items-center gap-2"><Database size={12} /> CACHE: SYNC</div>
               <div className="flex items-center gap-2"><Wifi size={12} /> MESH: READY</div>
            </div>
         </div>
      </div>

      {/* Terminal Output */}
      <div className="absolute bottom-16 left-16 max-w-lg">
         <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-1.5 bg-nx-green-primary rounded-full animate-pulse shadow-[0_0_4px_var(--nx-green-primary)]" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest font-mono">System Initialization Log</span>
         </div>
         <div className="space-y-1.5 h-32 overflow-hidden flex flex-col-reverse">
            {logs.slice().reverse().map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1 - (i * 0.15), x: 0 }}
                className="font-mono text-[10px] text-nx-text-tertiary uppercase flex items-center gap-3"
              >
                <span className="text-[8px] opacity-40">[{1000 + i}]</span>
                {log}
              </motion.div>
            ))}
         </div>
      </div>

      {/* Version & Build */}
      <div className="absolute bottom-16 right-16 text-right">
         <div className="text-[10px] font-black text-white uppercase tracking-widest mb-1">BUILD v2.0.0.X</div>
         <div className="text-[9px] font-mono text-nx-text-dim uppercase tracking-tighter">NEXUS TACTICAL INTERFACE • 2026 ROADSoS</div>
      </div>

      {/* Ambient Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,white_2px,white_3px)]" />
    </div>
  );
};

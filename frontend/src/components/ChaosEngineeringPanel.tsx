import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  WifiOff, 
  Database, 
  Clock, 
  MapPin, 
  Activity, 
  RotateCcw, 
  X,
  AlertTriangle,
  Terminal as TerminalIcon
} from 'lucide-react';
import { useChaosStore, useJudgeStore } from '../store';

export const ChaosEngineeringPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const chaos = useChaosStore();
  const { addIncident } = useJudgeStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOverload = () => {
    chaos.addLog("INITIATING SYSTEM OVERLOAD TEST: 10 SIMULTANEOUS EVENTS", "FAIL");
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        addIncident({
          id: `OVERLOAD-${Math.random().toString(36).slice(2, 7)}`,
          name: `Stress Agent ${i + 1}`,
          location: [28.6139 + (Math.random() - 0.5) * 0.1, 77.2090 + (Math.random() - 0.5) * 0.1],
          timestamp: new Date(),
          sessionId: 'STRESS_TEST'
        });
      }, i * 100);
    }
  };

  const calculateResilienceScore = () => {
    const failCount = chaos.logs.filter(l => l.type === 'FAIL').length;
    const recoveryCount = chaos.logs.filter(l => l.type === 'RECOVERY').length;
    if (failCount === 0) return 100;
    const base = 90 + (recoveryCount / failCount) * 10;
    return Math.min(Math.round(base - (chaos.latencyMs / 1000)), 100);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] bg-slate-950 border-t-2 border-red-500/30 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] p-8 font-sans"
          >
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-600 rounded-2xl animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                    <Zap className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Chaos Engineering Protocol</h2>
                    <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Resilience Testing & Failure Injection Engine</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resilience Score</div>
                    <div className="text-3xl font-black text-emerald-500 font-mono tracking-tighter">
                      {calculateResilienceScore()}/100
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
                
                {/* Control Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  
                  {/* Internet Kill */}
                  <button 
                    onClick={chaos.killInternet}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col gap-4 text-left group ${
                      chaos.internetKilled 
                      ? 'bg-red-600 border-red-400 text-white' 
                      : 'bg-slate-900 border-white/5 hover:border-red-500/50'
                    }`}
                  >
                    <WifiOff size={24} className={chaos.internetKilled ? 'text-white' : 'text-red-500'} />
                    <div className="space-y-1">
                      <div className="font-black uppercase tracking-tight text-sm">Kill Internet</div>
                      <div className={`text-[10px] font-medium leading-tight ${chaos.internetKilled ? 'text-red-100' : 'text-slate-500'}`}>
                        Sever infrastructure link to activate Mesh Fallback.
                      </div>
                    </div>
                  </button>

                  {/* Backend Kill */}
                  <button 
                    onClick={chaos.killBackend}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col gap-4 text-left group ${
                      chaos.backendKilled 
                      ? 'bg-red-600 border-red-400 text-white' 
                      : 'bg-slate-900 border-white/5 hover:border-red-500/50'
                    }`}
                  >
                    <Database size={24} className={chaos.backendKilled ? 'text-white' : 'text-red-500'} />
                    <div className="space-y-1">
                      <div className="font-black uppercase tracking-tight text-sm">Kill Backend</div>
                      <div className={`text-[10px] font-medium leading-tight ${chaos.backendKilled ? 'text-red-100' : 'text-slate-500'}`}>
                        Terminate socket link to test local-first data sync.
                      </div>
                    </div>
                  </button>

                  {/* GPS Corrupt */}
                  <button 
                    onClick={chaos.corruptGps}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col gap-4 text-left group ${
                      chaos.gpsCorrupted 
                      ? 'bg-orange-600 border-orange-400 text-white' 
                      : 'bg-slate-900 border-white/5 hover:border-orange-500/50'
                    }`}
                  >
                    <MapPin size={24} className={chaos.gpsCorrupted ? 'text-white' : 'text-orange-500'} />
                    <div className="space-y-1">
                      <div className="font-black uppercase tracking-tight text-sm">Corrupt GPS</div>
                      <div className={`text-[10px] font-medium leading-tight ${chaos.gpsCorrupted ? 'text-orange-100' : 'text-slate-500'}`}>
                        Inject multipath errors to trigger spatial AI correction.
                      </div>
                    </div>
                  </button>

                  {/* Overload Test */}
                  <button 
                    onClick={handleOverload}
                    className="p-6 rounded-3xl bg-slate-900 border-2 border-white/5 hover:border-blue-500/50 transition-all flex flex-col gap-4 text-left group"
                  >
                    <Activity size={24} className="text-blue-500" />
                    <div className="space-y-1">
                      <div className="font-black uppercase tracking-tight text-sm">Overload Test</div>
                      <div className="text-[10px] text-slate-500 font-medium leading-tight">
                        Fire 10 simultaneous SOS events to stress queue handling.
                      </div>
                    </div>
                  </button>

                  {/* Latency Slider */}
                  <div className="p-6 rounded-3xl bg-slate-900 border-2 border-white/5 flex flex-col gap-4 col-span-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock size={20} className="text-yellow-500" />
                        <div className="font-black uppercase tracking-tight text-sm">Artificial Latency</div>
                      </div>
                      <div className="text-xl font-black font-mono text-yellow-500">{chaos.latencyMs}ms</div>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      value={chaos.latencyMs}
                      onChange={(e) => chaos.setLatency(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-[var(--radius-lg)] appearance-none cursor-pointer accent-yellow-500"
                    />
                    <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
                      <span>Instant</span>
                      <span>5s Delay</span>
                    </div>
                  </div>

                  {/* Restore Button */}
                  <button 
                    onClick={chaos.restoreAll}
                    className="p-6 rounded-3xl bg-emerald-600/10 border-2 border-emerald-500/30 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all flex flex-col items-center justify-center gap-2 group shadow-xl shadow-emerald-950/20"
                  >
                    <RotateCcw size={32} className="group-hover:rotate-180 transition-transform duration-500" />
                    <div className="font-black uppercase tracking-tighter text-lg">System Restore</div>
                  </button>

                </div>

                {/* Recovery Log */}
                <div className="bg-slate-900/50 border border-white/5 rounded-4xl p-6 flex flex-col overflow-hidden h-[400px]">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <TerminalIcon size={18} className="text-emerald-500" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-white">Resilience Recovery Log</h3>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Monitoring Active</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                    {chaos.logs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-3">
                        <AlertTriangle size={32} />
                        <p className="text-[10px] font-mono uppercase tracking-[0.2em]">No failures injected yet.</p>
                      </div>
                    ) : (
                      chaos.logs.map((log) => (
                        <div key={log.id} className="flex gap-4 group">
                          <div className="text-[10px] font-mono text-slate-600 shrink-0 pt-0.5">
                            {log.timestamp.toLocaleTimeString([], { hour12: false })}
                          </div>
                          <div className="space-y-1">
                            <div className={`text-[11px] font-bold tracking-tight leading-snug ${
                              log.type === 'FAIL' ? 'text-red-400' : 
                              log.type === 'RECOVERY' ? 'text-emerald-400' : 'text-blue-400'
                            }`}>
                              {log.message}
                            </div>
                            <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">
                              {log.type === 'FAIL' ? 'CRITICAL_FAIL' : 'NOMINAL_STATE'} // TRACE: {log.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </>
  );
};

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WifiOff, 
  Zap, 
  AlertOctagon, 
  ChevronRight,
  BrainCircuit,
} from 'lucide-react';
import { useDemoStore, useSosStore, useNetworkStore, useUIStore } from '../../store';

export const DemoController = () => {
  const { 
    isDemoMode, 
    aiThinking, 
    decisionExplanations,
    livesSaved,
    avgResponseReduction,
    startScenario,
    addThinkingStep,
    clearThinking,
    setDecisionExplanation,
    incrementStats,
    setDemoMode
  } = useDemoStore();

  const { triggerSos, isActive, countdownActive, countdownTime, startCountdown, decrementCountdown } = useSosStore();
  const { isMeshMode, setMeshMode } = useNetworkStore();
  const { setStressed } = useUIStore();

  const [showPanel, setShowPanel] = useState(false);

  const handleAutoRescue = useCallback(async () => {
    addThinkingStep('G-FORCE TRIGGER DETECTED: 12.4G');
    addThinkingStep('USER UNRESPONSIVE AFTER 10s COUNTDOWN');
    addThinkingStep('INITIATING AUTONOMOUS RESCUE PROTOCOL...');
    
    await new Promise(r => setTimeout(r, 1000));
    triggerSos();
    
    addThinkingStep('ANALYZING CRASH DYNAMICS...');
    addThinkingStep('RETRIEVING ENCRYPTED MEDICAL PROFILE...');
    
    await new Promise(r => setTimeout(r, 800));
    addThinkingStep('LOCATING NEAREST VERIFIED RESPONDERS...');
    setDecisionExplanation('responder', { 
      id: 'R-882', 
      reason: 'Nearest Advanced Life Support (ALS) certified responder with 98% reputation.', 
      confidence: 0.99 
    });

    await new Promise(r => setTimeout(r, 1200));
    addThinkingStep('OPTIMIZING HOSPITAL ROUTING (TRAUMA LEVEL 1 REQUIRED)...');
    setDecisionExplanation('hospital', { 
      name: 'City General Trauma', 
      reason: 'Only nearby facility with available ICU bed and neurosurgery team.', 
      confidence: 0.96 
    });

    incrementStats();
  }, [addThinkingStep, incrementStats, setDecisionExplanation, triggerSos]);

  // Crash Simulation Logic
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (countdownActive && countdownTime > 0) {
      timer = setInterval(() => {
        decrementCountdown();
      }, 1000);
    } else if (countdownActive && countdownTime === 0) {
      handleAutoRescue();
    }
    return () => clearInterval(timer);
  }, [countdownActive, countdownTime, decrementCountdown, handleAutoRescue]);

  const runScenario = (type: 'CRASH' | 'RURAL' | 'MULTI') => {
    clearThinking();
    startScenario(type);
    
    if (type === 'CRASH') {
      startCountdown();
      setStressed(true);
    } else if (type === 'RURAL') {
      setMeshMode(true);
      addThinkingStep('INTERNET CONNECTIVITY LOST');
      addThinkingStep('SWITCHING TO P2P MESH RELAY...');
      addThinkingStep('LOCATING PEER NODES VIA BLUETOOTH/AD-HOC...');
      triggerSos();
    }
  };

  if (!isDemoMode) return (
    <button 
      onClick={() => setDemoMode(true)}
      aria-label="Activate Demo Mode"
      className="fixed bottom-24 right-6 bg-cyan-600/20 backdrop-blur-md border border-cyan-500/30 p-2 rounded-full text-cyan-400 hover:bg-cyan-500/40 transition-all z-50 group"
    >
      <Zap size={20} className="group-hover:animate-pulse" />
    </button>
  );

  return (
    <>
      {/* Floating Demo Panel */}
      <div className="fixed top-24 right-6 z-[60] flex flex-col items-end gap-4 pointer-events-none">
        <button 
          onClick={() => setShowPanel(!showPanel)}
          className="pointer-events-auto bg-slate-900/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl text-white shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
        >
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest">Demo Control Center</span>
          {showPanel ? <ChevronRight size={16} className="rotate-90" /> : <ChevronRight size={16} />}
        </button>

        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto w-80 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6"
            >
              {/* Stats Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lives Saved</div>
                  <div className="text-xl font-mono text-cyan-400 font-bold">{livesSaved.toLocaleString()}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Response Δ</div>
                  <div className="text-xl font-mono text-emerald-400 font-bold">-{avgResponseReduction}%</div>
                </div>
              </div>

              <div className="h-px bg-white/5" />

              {/* Scenarios */}
              <div className="space-y-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Run Scenario</div>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => runScenario('CRASH')}
                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-red-500/20 border border-white/5 rounded-xl transition-all group text-left"
                  >
                    <AlertOctagon size={18} className="text-red-500" />
                    <div>
                      <div className="text-xs font-bold text-white uppercase tracking-tight">Unconscious Victim</div>
                      <div className="text-[9px] text-slate-500 font-mono">G-Force Trigger + Auto-Rescue</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => runScenario('RURAL')}
                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-amber-500/20 border border-white/5 rounded-xl transition-all group text-left"
                  >
                    <WifiOff size={18} className="text-amber-500" />
                    <div>
                      <div className="text-xs font-bold text-white uppercase tracking-tight">Rural Failure</div>
                      <div className="text-[9px] text-slate-500 font-mono">Offline + P2P Mesh Relay</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* System Toggles */}
              <div className="space-y-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">System State</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setMeshMode(!isMeshMode)}
                    className={`flex-1 p-2 rounded-lg border text-[10px] font-bold transition-all ${isMeshMode ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-white/5 border-white/10 text-slate-500'}`}
                  >
                    Mesh Relay
                  </button>
                  <button 
                    onClick={() => setDemoMode(false)}
                    className="p-2 rounded-lg border border-white/10 text-slate-500 text-[10px] font-bold"
                  >
                    Exit Demo
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Thinking Overlay (Visible during Scenarios) */}
      <AnimatePresence>
        {(aiThinking.length > 0 || isActive) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-x-0 bottom-32 flex justify-center z-[55] pointer-events-none px-6"
          >
            <div className="max-w-2xl w-full bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <BrainCircuit className="text-cyan-400 animate-pulse" size={20} />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">AI Intelligence Core</span>
              </div>
              
              <div className="space-y-2 font-mono text-[10px] text-slate-300">
                {aiThinking.map((step, i) => (
                  <motion.div 
                    key={i}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-cyan-600">[{new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}]</span>
                    <span className={step.includes('DETECTION') || step.includes('INITIATING') ? 'text-red-400 font-bold' : ''}>{step}</span>
                  </motion.div>
                ))}
              </div>

              {/* Decision Explanations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {decisionExplanations.responder && (
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-3 bg-white/5 rounded-2xl border border-white/10"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-[9px] font-black uppercase text-slate-500">Responder Selected</div>
                      <div className="text-[9px] font-mono text-cyan-400 font-bold">{Math.round(decisionExplanations.responder.confidence * 100)}% Match</div>
                    </div>
                    <div className="text-[10px] text-white font-bold mb-1">ID: {decisionExplanations.responder.id}</div>
                    <div className="text-[9px] text-slate-400 leading-tight italic">"{decisionExplanations.responder.reason}"</div>
                  </motion.div>
                )}
                {decisionExplanations.hospital && (
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-3 bg-white/5 rounded-2xl border border-white/10"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-[9px] font-black uppercase text-slate-500">Optimal Facility</div>
                      <div className="text-[9px] font-mono text-emerald-400 font-bold">{Math.round(decisionExplanations.hospital.confidence * 100)}% Match</div>
                    </div>
                    <div className="text-[10px] text-white font-bold mb-1">{decisionExplanations.hospital.name}</div>
                    <div className="text-[9px] text-slate-400 leading-tight italic">"{decisionExplanations.hospital.reason}"</div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Overlays */}
      <AnimatePresence>
        {countdownActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-950/40 backdrop-blur-[2px] z-[100] flex flex-col items-center justify-center pointer-events-none"
          >
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-9xl font-black text-red-500 drop-shadow-[0_0_50px_rgba(239,68,68,0.5)]"
            >
              {countdownTime}
            </motion.div>
            <div className="text-2xl font-black text-white uppercase tracking-[0.5em] mt-8 animate-pulse">
              Crash Detection Triggered
            </div>
            <div className="text-sm text-red-400 font-mono mt-4">
              Awaiting consciousness verification...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

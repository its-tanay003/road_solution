import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WifiOff, 
  AlertOctagon, 
  ChevronRight,
  BrainCircuit,
  Settings,
  Shield,
  Activity,
  History
} from 'lucide-react';
import { useDemoStore, useSosStore, useNetworkStore, useUIStore } from '../../store';
import { Badge } from '../ui/Badge';

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

  const { triggerSos, isActive, isTriggering, countdownActive, countdownTime, startCountdown, decrementCountdown } = useSosStore();
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
    incrementStats();
    
    const currentStats = { 
      livesSaved: livesSaved + 1, 
      avgResponseReduction: avgResponseReduction + 0.1 
    };
    localStorage.setItem('roadsos_demo_stats', JSON.stringify(currentStats));
  }, [addThinkingStep, incrementStats, setDecisionExplanation, triggerSos, livesSaved, avgResponseReduction]);

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
    if (isActive || isTriggering) {
      return;
    }
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
      aria-label="Enter Demo Mode"
      title="Enter Demo Mode"
      className="fixed bottom-24 right-8 w-12 h-12 bg-(--nx-blue-primary)/10 border border-(--nx-blue-primary)/30 rounded-sm flex items-center justify-center text-(--nx-blue-primary) hover:bg-(--nx-blue-primary)/20 transition-all z-50 group shadow-[0_0_20px_rgba(10,132,255,0.2)]"
    >
      <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
    </button>
  );

  return (
    <>
      {/* Tactical Controller Panel */}
      <div className="fixed top-24 right-8 z-200 flex flex-col items-end gap-4 pointer-events-none">
        <button 
          onClick={() => setShowPanel(!showPanel)}
          className="pointer-events-auto nexus-card bg-(--nx-bg-elevated)/90 backdrop-blur-xl p-4 flex items-center gap-4 group transition-all"
        >
          <div className="w-2 h-2 rounded-full bg-(--nx-blue-primary) animate-pulse shadow-[0_0_8px_var(--nx-blue-primary)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">DEMO COMMAND CENTER</span>
          <ChevronRight size={16} className={`text-(--nx-text-dim) transition-transform ${showPanel ? 'rotate-90' : ''}`} />
        </button>

        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto w-80 bg-(--nx-bg-elevated)/95 backdrop-blur-xl border border-(--nx-border-active) rounded-sm p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-8"
            >
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="nexus-label">LIVES SECURED</div>
                  <div className="text-2xl font-black text-white font-mono">{livesSaved.toLocaleString()}</div>
                </div>
                <div className="space-y-1">
                  <div className="nexus-label">RESPONSE DELTA</div>
                  <div className="text-2xl font-black text-(--nx-green-primary) font-mono">-{avgResponseReduction}%</div>
                </div>
              </div>

              <div className="h-px bg-(--nx-border)" />

              {/* Mission Scenarios */}
              <div className="space-y-4">
                <h3 className="nexus-label flex items-center gap-2"><History size={12} /> MISSION SCENARIOS</h3>
                <div className="space-y-3">
                  <ScenarioButton 
                    onClick={() => runScenario('CRASH')}
                    icon={<AlertOctagon size={18} className="text-(--nx-red-primary)" />}
                    title="UNCONSCIOUS ASSET"
                    desc="G-FORCE TRIGGER + AUTO-RESURRECTION"
                  />
                  <ScenarioButton 
                    onClick={() => runScenario('RURAL')}
                    icon={<WifiOff size={18} className="text-(--nx-amber-primary)" />}
                    title="RURAL GRID FAILURE"
                    desc="ZERO CONNECTIVITY + P2P MESH RELAY"
                  />
                </div>
              </div>

              {/* Protocol Controls */}
              <div className="space-y-4">
                <h3 className="nexus-label flex items-center gap-2"><Shield size={12} /> PROTOCOL STATE</h3>
                <div className="flex gap-3">
                   <button 
                     onClick={() => setMeshMode(!isMeshMode)}
                     className={`flex-1 h-10 rounded-sm border text-[9px] font-black tracking-widest uppercase transition-all ${isMeshMode ? 'bg-(--nx-amber-dim) border-(--nx-amber-primary) text-(--nx-amber-primary)' : 'bg-white/2 border-(--nx-border) text-(--nx-text-tertiary) hover:border-(--nx-border-active)'}`}
                   >
                     MESH RELAY: {isMeshMode ? 'ON' : 'OFF'}
                   </button>
                   <button 
                     onClick={() => setDemoMode(false)}
                     className="px-4 h-10 rounded-sm border border-(--nx-border) text-(--nx-text-tertiary) hover:text-white hover:border-(--nx-red-primary) transition-all text-[9px] font-black tracking-widest uppercase"
                   >
                     EXIT
                   </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Reasoning Visualization Overlay */}
      <AnimatePresence>
        {(aiThinking.length > 0 || isActive) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-0 bottom-32 flex justify-center z-[50] pointer-events-none px-6"
          >
            <div className="max-w-2xl w-full bg-(--nx-bg-(--color-surface))/90 backdrop-blur-xl border border-(--nx-border-active) rounded-sm p-6 shadow-[0_20px_100px_rgba(0,0,0,0.8)]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="relative">
                      <BrainCircuit className="text-(--nx-blue-primary)" size={20} />
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-(--nx-blue-primary) rounded-full blur-md"
                      />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-(--nx-blue-primary)">NEURAL REASONING ENGINE</span>
                </div>
                <Badge variant="ai">ACTIVE ANALYSIS</Badge>
              </div>
              
              <div className="space-y-2 h-32 overflow-y-auto scrollbar-hide flex flex-col-reverse">
                {aiThinking.slice().reverse().map((step, i) => (
                  <motion.div 
                    key={i}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-start gap-4 font-mono text-[10px] text-(--nx-text-secondary)"
                  >
                    <span className="text-(--nx-text-dim)">[{new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}]</span>
                    <span className={step.includes('DETECTION') || step.includes('INITIATING') ? 'text-(--nx-red-primary) font-bold' : ''}>{step}</span>
                  </motion.div>
                ))}
              </div>

              {/* Tactical Explanations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-(--nx-border)">
                {decisionExplanations.responder && (
                  <DecisionCard label="RESPONDER PROTOCOL" icon={<Activity size={12} />} color="blue" data={decisionExplanations.responder} />
                )}
                {decisionExplanations.hospital && (
                  <DecisionCard label="FACILITY VECTOR" icon={<Shield size={12} />} color="green" data={decisionExplanations.hospital} />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Critical Countdown Overlay */}
      <AnimatePresence>
        {countdownActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-(--nx-red-dim)/60 backdrop-blur-sm z-500 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,59,59,0.1)_2px,rgba(255,59,59,0.1)_3px)] opacity-20" />
            
            <motion.div 
              className="text-[12rem] font-black text-(--nx-red-primary) drop-shadow-[0_0_80px_rgba(255,59,59,0.8)] tracking-tighter"
            >
              {countdownTime}
            </motion.div>
            
            <div className="flex flex-col items-center mt-12">
               <div className="px-6 py-2 bg-(--nx-red-primary) text-white text-2xl font-black uppercase tracking-[0.4em] italic shadow-[0_0_40px_rgba(255,59,59,0.5)]">
                 CRASH DETECTION ACTIVE
               </div>
               <p className="mt-6 text-(--nx-red-primary) font-mono font-bold uppercase tracking-widest animate-pulse">
                 Awaiting user consciousness confirmation...
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

interface ScenarioButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const ScenarioButton = ({ onClick, icon, title, desc }: ScenarioButtonProps) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 bg-white/2 hover:bg-white/5 border border-(--nx-border) rounded-sm group transition-all text-left"
  >
    <div className="w-10 h-10 border border-(--nx-border) flex items-center justify-center group-hover:border-(--nx-border-active) transition-colors">
       {icon}
    </div>
    <div>
      <div className="text-[10px] font-black text-white uppercase tracking-wider mb-1">{title}</div>
      <div className="text-[8px] text-(--nx-text-dim) font-mono uppercase tracking-tighter">{desc}</div>
    </div>
  </button>
);

interface DecisionCardProps {
  label: string;
  icon: React.ReactNode;
  color: string;
  data: {
    id?: string;
    name?: string;
    reason: string;
    confidence: number;
  };
}

const DecisionCard = ({ label, icon, color, data }: DecisionCardProps) => (
  <div className="p-4 bg-white/1 border border-(--nx-border) rounded-sm">
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center gap-2">
         <span className={`text-(--nx-${color}-primary)`}>{icon}</span>
         <span className="text-[9px] font-black text-(--nx-text-dim) uppercase tracking-widest">{label}</span>
      </div>
      <Badge variant={color === 'blue' ? 'info' : 'active'} className="text-[8px] py-0 px-2 h-4">
        {Math.round(data.confidence * 100)}% CONFIDENCE
      </Badge>
    </div>
    <div className="text-[11px] text-white font-bold mb-2 uppercase tracking-tight">{data.id || data.name}</div>
    <div className="text-[9px] text-(--nx-text-secondary) leading-relaxed italic uppercase font-mono tracking-tighter">"{data.reason}"</div>
  </div>
);

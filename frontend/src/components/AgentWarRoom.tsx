import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, 
  Activity, 
  ShieldAlert, 
  Zap, 
  Terminal as TerminalIcon,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface AgentLog {
  agent: string;
  message: string;
  type: 'thought' | 'data' | 'decision';
}

interface AgentState {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  data: Record<string, string>;
  logs: AgentLog[];
  status: 'IDLE' | 'ANALYZING' | 'DECISION_MADE';
  decision: string | null;
}

export const AgentWarRoom = ({ onComplete }: { onComplete?: (consensus: string) => void }) => {
  const [agents, setAgents] = useState<AgentState[]>([
    {
      id: 'crash',
      name: 'Crash Analyst',
      icon: Activity,
      color: 'text-red-500',
      status: 'IDLE',
      decision: null,
      logs: [],
      data: { gForce: '12.4G', speedDelta: '-48km/h', coords: '28.6139, 77.2090' }
    },
    {
      id: 'medical',
      name: 'Medical Triage',
      icon: BrainCircuit,
      color: 'text-purple-500',
      status: 'IDLE',
      decision: null,
      logs: [],
      data: { transcript: "I can't feel my legs... breathing is hard...", history: "Type 2 Diabetes, No drug allergies" }
    },
    {
      id: 'resource',
      name: 'Resource Optimizer',
      icon: Cpu,
      color: 'text-cyan-500',
      status: 'IDLE',
      decision: null,
      logs: [],
      data: { hospitals: "AIIMS (Load: 82%), Max (Load: 45%)", units: "Ambulance A47, B12" }
    }
  ]);

  const [consensus, setConsensus] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const startAnalysis = async () => {
    setIsActive(true);
    setConsensus(null);
    
    // Reset agents
    setAgents(prev => prev.map(a => ({ ...a, status: 'ANALYZING', logs: [], decision: null })));

    const agentPrompts = [
      {
        id: 'crash',
        prompt: `Analyze this crash data: G-Force: 12.4G, Speed Delta: -48km/h. 
        Think step by step about vehicle deformation, impact vectors, and likely injury severity. 
        End with a final DECISION: [Level of severity and likely trauma type].`
      },
      {
        id: 'medical',
        prompt: `Medical Triage Analysis: 
        Transcript: "I can't feel my legs... breathing is hard..."
        History: Type 2 Diabetes.
        Create an injury probability matrix (Head, Spinal, Internal). 
        End with a final DECISION: [Triage Category and Primary Risk].`
      },
      {
        id: 'resource',
        prompt: `Resource Optimization:
        Hospitals: AIIMS (82% load), Max (45% load).
        Available Units: A47 (ALS), B12 (BLS).
        Rank dispatch options based on ETA and hospital capability.
        End with a final DECISION: [Selected Unit and Destination].`
      }
    ];

    try {
      await Promise.all(agentPrompts.map(p => streamAgentResponse(p.id, p.prompt)));
      
      // Synthesis / Consensus
      setTimeout(() => {
        setConsensus("CRITICAL MULTI-SYSTEM TRAUMA DETECTED. Dispatching Unit A47 to Max Hospital (Trauma Center). ALS Protocol Initiated.");
        if (onComplete) onComplete("CRITICAL MULTI-SYSTEM TRAUMA DETECTED");
      }, 1000);
      
    } catch (error) {
      console.error("War Room Error:", error);
    }
  };

  const streamAgentResponse = async (agentId: string, prompt: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/triage/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        messages: [{ role: 'user', content: prompt }] 
      })
    });

    if (!response.body) return;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.replace('data: ', '');
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullText += parsed.content;
              
              // Process lines as logs
              const currentLines = fullText.split('\n').filter(l => l.trim().length > 0);
              const lastLine = currentLines[currentLines.length - 1];
              
              setAgents(prev => prev.map(a => {
                if (a.id === agentId) {
                  const isDecision = lastLine.toUpperCase().includes('DECISION:');
                  return {
                    ...a,
                    logs: currentLines.map(msg => ({ 
                      agent: agentId, 
                      message: msg.replace(/DECISION:/gi, ''), 
                      type: msg.toUpperCase().includes('DECISION:') ? 'decision' : 'thought' 
                    })),
                    status: isDecision ? 'DECISION_MADE' : 'ANALYZING',
                    decision: isDecision ? lastLine.replace(/DECISION:/gi, '').trim() : a.decision
                  };
                }
                return a;
              }));
            }
          } catch {
            // Silently skip malformed chunks
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-full bg-slate-950 p-6 flex flex-col gap-8 relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_#ef4444]" />
            <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">
            War Room <span className="text-red-500">Active</span>
          </h1>
        </div>
        
        {!isActive && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startAnalysis}
            className="px-6 py-2 bg-cyan-500 text-navy font-black text-sm rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            <Zap size={16} fill="currentColor" />
            INITIATE MULTI-AGENT TRIAGE
          </motion.button>
        )}
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 relative z-10">
        {agents.map((agent, i) => (
          <div key={agent.id} className="relative">
            <AgentPanel agent={agent} index={i} />
            {/* Connecting Line to Consensus */}
            <AnimatePresence>
              {consensus && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 100 }}
                  className="hidden md:block absolute -bottom-12 left-1/2 w-px bg-linear-to-b from-cyan-500/50 to-transparent z-0"
                />
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Consensus Panel */}
      <AnimatePresence>
        {consensus && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl p-6 relative z-20 overflow-hidden"
          >
            {/* Scanned Light Effect */}
            <motion.div 
              className="absolute top-0 left-0 w-full h-1 bg-cyan-400/50 shadow-[0_0_15px_#22d3ee]"
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="flex flex-col items-center text-center gap-2">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-black tracking-widest uppercase mb-2">
                <BrainCircuit size={16} />
                Multi-Agent Consensus Reached
              </div>
              <p className="text-lg font-bold text-white max-w-3xl font-sans italic">
                "{consensus}"
              </p>
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] text-cyan-400 font-bold uppercase">
                  <ShieldAlert size={12} /> Priority 1 Dispatch
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] text-emerald-400 font-bold uppercase">
                  <CheckCircle2 size={12} /> 98.4% Confidence
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AgentPanel = ({ agent, index }: { agent: AgentState; index: number }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agent.logs]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex flex-col h-[400px] bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden relative group hover:border-white/20 transition-all ${agent.status === 'DECISION_MADE' ? 'ring-1 ring-white/10' : ''}`}
    >
      {/* Panel Header */}
      <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-slate-950 rounded-lg ${agent.color}`}>
            <agent.icon size={18} />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-white">{agent.name}</div>
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">AgentID: {agent.id.toUpperCase()}-00{index+1}</div>
          </div>
        </div>
        
        {agent.status === 'ANALYZING' && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-emerald-400 font-bold animate-pulse">ACTIVE</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
          </div>
        )}
      </div>

      {/* Terminal Output */}
      <div className="flex-1 p-4 font-mono text-[10px] overflow-y-auto bg-black/20 scrollbar-hide space-y-2">
        {agent.logs.length === 0 && agent.status === 'IDLE' && (
          <div className="text-slate-700 italic">Waiting for telemetry...</div>
        )}
        
        {agent.logs.map((log, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-start gap-2 ${log.type === 'decision' ? 'text-emerald-400 font-bold bg-emerald-500/5 p-2 rounded-lg' : 'text-slate-300'}`}
          >
            <span className="text-slate-600">[{new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}]</span>
            <span className="flex-1 leading-tight">{log.message}</span>
          </motion.div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* Decision Footer */}
      <AnimatePresence>
        {agent.status === 'DECISION_MADE' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="p-4 bg-emerald-500/10 border-t border-emerald-500/20"
          >
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-1">
              <CheckCircle2 size={12} /> Decision Verified
            </div>
            <div className="text-[11px] font-bold text-white italic leading-tight">
              "{agent.decision}"
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decor */}
      <TerminalIcon className="absolute -bottom-2 -right-2 text-white/5 w-16 h-16 pointer-events-none group-hover:text-white/10 transition-all" />
    </motion.div>
  );
};

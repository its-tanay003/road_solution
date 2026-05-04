import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, Activity, ShieldAlert, Zap, Terminal as TerminalIcon, CheckCircle2, Cpu,
  Users, MessageSquare, AlertTriangle, Send, MousePointer2
} from 'lucide-react';
import { getSocket } from '../lib/socket';
import { PostIncidentDebrief } from './PostIncidentDebrief';
import { DebriefHistory } from './DebriefHistory';

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

interface RoomUser {
  id: string;
  userId: string;
  name: string;
  role: 'DISPATCHER' | 'DOCTOR' | 'FIELD_UNIT';
  color: string;
}

interface RoomNote {
  id: string;
  author: string;
  text: string;
  type: 'MEDICAL' | 'LOGISTICS' | 'AI_INSIGHT' | 'FIELD_OBSERVATION';
  timestamp: string;
}

interface RemoteCursor {
  userId: string;
  x: number;
  y: number;
}

export const AgentWarRoom = ({ onComplete }: { onComplete?: (consensus: string) => void }) => {
  const ROOM_ID = 'INC-2847';
  const socket = getSocket();
  const roomRef = useRef<HTMLDivElement>(null);

  // --- MOCK LOCAL USER FOR DEMO ---
  const [localUser] = useState<Omit<RoomUser, 'id'>>(() => ({
    userId: `user_${Math.floor(Math.random() * 1000)}`,
    name: ['Dr. Singh', 'Disp. Miller', 'Unit A47'][Math.floor(Math.random() * 3)],
    role: ['DISPATCHER', 'DOCTOR', 'FIELD_UNIT'][Math.floor(Math.random() * 3)] as 'DISPATCHER' | 'DOCTOR' | 'FIELD_UNIT',
    color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 4)]
  }));

  // --- MULTIPLAYER STATE ---
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [notes, setNotes] = useState<RoomNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [conflict, setConflict] = useState<any>(null);
  const [isResolved, setIsResolved] = useState(false);
  const [showDebrief, setShowDebrief] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // --- AGENT STATE ---
  const [agents, setAgents] = useState<AgentState[]>([
    { id: 'crash', name: 'Crash Analyst', icon: Activity, color: 'text-red-500', status: 'IDLE', decision: null, logs: [], data: { gForce: '12.4G', speedDelta: '-48km/h', coords: '28.6139, 77.2090' } },
    { id: 'medical', name: 'Medical Triage', icon: BrainCircuit, color: 'text-purple-500', status: 'IDLE', decision: null, logs: [], data: { transcript: "I can't feel my legs... breathing is hard...", history: "Type 2 Diabetes, No drug allergies" } },
    { id: 'resource', name: 'Resource Optimizer', icon: Cpu, color: 'text-cyan-500', status: 'IDLE', decision: null, logs: [], data: { hospitals: "AIIMS (Load: 82%), Max (Load: 45%)", units: "Ambulance A47, B12" } }
  ]);
  const [consensus, setConsensus] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  // --- SOCKET EFFECTS ---
  useEffect(() => {
    socket.emit('join_incident_room', { roomId: ROOM_ID, user: localUser });

    socket.on('incident_room_state', (state) => {
      setRoomUsers(state.users);
      setNotes(state.notes);
      if (state.aiConsensus && !consensus) {
        setConsensus(state.aiConsensus);
      }
    });

    socket.on('incident_user_joined', (user: RoomUser) => {
      setRoomUsers(prev => {
        if (!prev.find(u => u.id === user.id)) return [...prev, user];
        return prev;
      });
    });

    socket.on('incident_user_left', (socketId: string) => {
      setRoomUsers(prev => prev.filter(u => u.id !== socketId));
      setRemoteCursors(prev => prev.filter(c => c.userId !== socketId));
    });

    socket.on('cursor_moved', (data: RemoteCursor) => {
      setRemoteCursors(prev => {
        const filtered = prev.filter(c => c.userId !== data.userId);
        return [...filtered, data];
      });
    });

    socket.on('note_added', (note: RoomNote) => {
      setNotes(prev => [...prev, note]);
    });

    socket.on('ai_request_started', () => {
      if (!isActive) startAnalysisLocal();
    });

    socket.on('action_conflict', (data) => {
      setConflict(data);
    });

    return () => {
      socket.emit('leave_incident_room', ROOM_ID);
      socket.off('incident_room_state');
      socket.off('incident_user_joined');
      socket.off('incident_user_left');
      socket.off('cursor_moved');
      socket.off('note_added');
      socket.off('ai_request_started');
      socket.off('action_conflict');
    };
  }, [socket, localUser]);

  // --- MOUSE MOVEMENT FOR CURSOR TRACKING ---
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!roomRef.current) return;
    const rect = roomRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Throttle slightly
    if (Math.random() > 0.5) {
      socket.emit('cursor_moved', { roomId: ROOM_ID, x, y });
    }
  };

  const handleSendNote = () => {
    if (!newNote.trim()) return;
    const note: RoomNote = {
      id: Math.random().toString(36).substring(7),
      author: localUser.name,
      text: newNote,
      type: 'FIELD_OBSERVATION',
      timestamp: new Date().toISOString()
    };
    socket.emit('note_added', { roomId: ROOM_ID, note });
    setNewNote('');
  };

  const triggerAI = () => {
    socket.emit('ai_request', ROOM_ID);
    startAnalysisLocal(); // Start for self too
  };

  const startAnalysisLocal = async () => {
    setIsActive(true);
    setConsensus(null);
    setAgents(prev => prev.map(a => ({ ...a, status: 'ANALYZING', logs: [], decision: null })));

    const agentPrompts = [
      { id: 'crash', prompt: `Analyze this crash data: G-Force: 12.4G, Speed Delta: -48km/h. Think step by step about vehicle deformation, impact vectors, and likely injury severity. End with a final DECISION: [Level of severity and likely trauma type].` },
      { id: 'medical', prompt: `Medical Triage Analysis: Transcript: "I can't feel my legs... breathing is hard..." History: Type 2 Diabetes. Create an injury probability matrix (Head, Spinal, Internal). End with a final DECISION: [Triage Category and Primary Risk].` },
      { id: 'resource', prompt: `Resource Optimization: Hospitals: AIIMS (82% load), Max (45% load). Available Units: A47 (ALS), B12 (BLS). Rank dispatch options based on ETA and hospital capability. End with a final DECISION: [Selected Unit and Destination].` }
    ];

    try {
      await Promise.all(agentPrompts.map(p => streamAgentResponse(p.id, p.prompt)));
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
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
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
              const currentLines = fullText.split('\n').filter(l => l.trim().length > 0);
              const lastLine = currentLines[currentLines.length - 1];
              
              setAgents(prev => prev.map(a => {
                if (a.id === agentId) {
                  const isDecision = lastLine.toUpperCase().includes('DECISION:');
                  return {
                    ...a,
                    logs: currentLines.map(msg => ({ agent: agentId, message: msg.replace(/DECISION:/gi, ''), type: msg.toUpperCase().includes('DECISION:') ? 'decision' : 'thought' })),
                    status: isDecision ? 'DECISION_MADE' : 'ANALYZING',
                    decision: isDecision ? lastLine.replace(/DECISION:/gi, '').trim() : a.decision
                  };
                }
                return a;
              }));
            }
          } catch {}
        }
      }
    }
  };

  const simulateConflict = () => {
    socket.emit('action_conflict', {
      roomId: ROOM_ID,
      actionType: 'DISPATCH_UNIT',
      details: { unitA: 'A47', unitB: 'B12' }
    });
    setConflict({ userId: 'other_user', actionType: 'DISPATCH_UNIT', details: { unitA: 'A47', unitB: 'B12' } });
  };

  return (
    <div 
      ref={roomRef}
      onMouseMove={handleMouseMove}
      className="w-full h-full bg-slate-950 p-6 flex flex-col gap-6 relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
    >
      {/* Remote Cursors Overlay */}
      {remoteCursors.map(cursor => {
        const user = roomUsers.find(u => u.id === cursor.userId);
        if (!user) return null;
        return (
          <motion.div 
            key={cursor.userId}
            animate={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute z-50 pointer-events-none flex items-center gap-2"
          >
            <MousePointer2 className="w-5 h-5 drop-shadow-md" style={{ color: user.color, fill: user.color, transform: 'rotate(-15deg)' }} />
            <div className="bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold border" style={{ borderColor: user.color, color: user.color }}>
              {user.name}
            </div>
          </motion.div>
        );
      })}

      {/* Header & Presence */}
      <div className="flex justify-between items-center z-10 bg-slate-900/60 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-black italic tracking-tighter text-white uppercase flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]" />
              Shared Incident Room <span className="text-red-500 opacity-60 text-sm">{ROOM_ID}</span>
            </h1>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Logged in as: <span className="text-white font-bold" style={{ color: localUser.color }}>{localUser.name} ({localUser.role})</span>
            </div>
          </div>

          <div className="w-px h-8 bg-white/10" />

          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-400" />
            <span className="text-xs text-slate-300 font-bold mr-2">{roomUsers.length} in room</span>
            <div className="flex -space-x-2">
              {roomUsers.map((u, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-md relative group" style={{ backgroundColor: u.color }}>
                  {u.name.charAt(0)}
                  <div className="absolute top-full mt-1 hidden group-hover:block bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50">
                    {u.name} - {u.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={simulateConflict}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 border border-white/10"
          >
            <ShieldAlert size={14} /> Test Conflict
          </motion.button>

          {!isActive && !isResolved && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={triggerAI}
              className="px-6 py-2 bg-cyan-500 text-navy font-black text-sm rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              <Zap size={16} fill="currentColor" />
              INITIATE AI TRIAGE
            </motion.button>
          )}

          {isActive && !isResolved && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsResolved(true)}
              className="px-6 py-2 bg-emerald-500 text-slate-900 font-black text-sm rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              <CheckCircle2 size={16} fill="currentColor" className="text-emerald-900" />
              MARK RESOLVED
            </motion.button>
          )}

          {isResolved && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHistory(true)}
                className="px-6 py-2 bg-slate-800 text-white font-black text-sm rounded-xl flex items-center gap-2 border border-slate-600 hover:bg-slate-700 transition-colors"
              >
                <Clock size={16} />
                HISTORY
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDebrief(true)}
                className="px-6 py-2 bg-purple-500 text-white font-black text-sm rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              >
                <BrainCircuit size={16} />
                GENERATE DEBRIEF
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 gap-6 relative z-10 min-h-0">
        
        {/* Left: AI Agents Grid */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            {agents.map((agent, i) => (
              <AgentPanel key={agent.id} agent={agent} index={i} />
            ))}
          </div>

          <AnimatePresence>
            {consensus && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden"
              >
                <motion.div 
                  className="absolute top-0 left-0 w-full h-1 bg-cyan-400/50 shadow-[0_0_15px_#22d3ee]"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-black tracking-widest uppercase mb-2">
                    <BrainCircuit size={16} /> Multi-Agent Consensus Reached
                  </div>
                  <p className="text-lg font-bold text-white max-w-3xl font-sans italic">"{consensus}"</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Collaborative Notes Panel */}
        <div className="w-80 bg-slate-900/60 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-white/5">
            <MessageSquare size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Live Notes</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {notes.map((note) => (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={note.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold" style={{ color: localUser.name === note.author ? localUser.color : '#94a3b8' }}>
                    {note.author}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{note.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="p-3 bg-black/20 border-t border-white/5">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendNote()}
                placeholder="Add a note..." 
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
              <button 
                onClick={handleSendNote}
                className="bg-cyan-500/20 text-cyan-400 p-2 rounded-lg hover:bg-cyan-500/30 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Conflict Resolution Modal */}
      <AnimatePresence>
        {conflict && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-red-500/50 p-6 rounded-2xl max-w-md w-full shadow-[0_0_40px_rgba(239,68,68,0.2)]"
            >
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <AlertTriangle size={24} />
                <h2 className="text-lg font-black uppercase tracking-widest">Command Conflict</h2>
              </div>
              <p className="text-sm text-slate-300 mb-6">
                Unit assignment conflict detected. Another user attempted to assign 
                <span className="font-mono text-red-400 mx-1">A47</span> while you selected 
                <span className="font-mono text-cyan-400 mx-1">B12</span>.
              </p>
              
              <div className="bg-black/40 rounded-lg p-4 mb-6 border border-white/5">
                <div className="text-xs text-slate-400 mb-2">As <strong className="text-white">{localUser.role}</strong>, you have override authority.</div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setConflict(null)} className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg transition-colors">
                    FORCE OVERRIDE: Assign B12
                  </button>
                  <button onClick={() => setConflict(null)} className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-lg transition-colors">
                    YIELD: Allow A47
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDebrief && (
          <PostIncidentDebrief
            incident={{
              id: ROOM_ID,
              crashType: "Multi-system Trauma Collision",
              address: "28.6139, 77.2090 (Connaught Place)",
              timestamp: new Date().toISOString(),
              responseTime: "4 min 12 sec",
              units: "A47 (ALS), B12 (BLS)",
              triageScore: 9.4,
              outcome: "Patient stabilized, transported to Max Hospital",
              weather: "Clear, dry road",
              aiComplianceScore: 100
            }}
            onClose={() => setShowDebrief(false)}
          />
        )}
        
        {showHistory && (
          <DebriefHistory onClose={() => setShowHistory(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

// Extracted AgentPanel...
const AgentPanel = ({ agent, index }: { agent: AgentState; index: number }) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [agent.logs]);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex flex-col h-full bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden relative group hover:border-white/20 transition-all ${agent.status === 'DECISION_MADE' ? 'ring-1 ring-white/10' : ''}`}
    >
      <div className="p-3 bg-white/5 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 bg-slate-950 rounded-lg ${agent.color}`}><agent.icon size={16} /></div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white">{agent.name}</div>
            <div className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter">AgentID: {agent.id.toUpperCase()}-00{index+1}</div>
          </div>
        </div>
        {agent.status === 'ANALYZING' && (
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-emerald-400 font-bold animate-pulse">ACTIVE</span>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
          </div>
        )}
      </div>
      <div className="flex-1 p-3 font-mono text-[9px] overflow-y-auto bg-black/20 scrollbar-hide space-y-1.5">
        {agent.logs.length === 0 && agent.status === 'IDLE' && <div className="text-slate-700 italic">Waiting for telemetry...</div>}
        {agent.logs.map((log, i) => (
          <div key={i} className={`flex items-start gap-2 ${log.type === 'decision' ? 'text-emerald-400 font-bold bg-emerald-500/5 p-1.5 rounded-md' : 'text-slate-300'}`}>
            <span className="text-slate-600">[{new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}]</span>
            <span className="flex-1 leading-tight">{log.message}</span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
      <AnimatePresence>
        {agent.status === 'DECISION_MADE' && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="p-3 bg-emerald-500/10 border-t border-emerald-500/20">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-emerald-400 tracking-widest mb-1"><CheckCircle2 size={10} /> Verified</div>
            <div className="text-[10px] font-bold text-white italic leading-tight">"{agent.decision}"</div>
          </motion.div>
        )}
      </AnimatePresence>
      <TerminalIcon className="absolute -bottom-2 -right-2 text-white/5 w-12 h-12 pointer-events-none group-hover:text-white/10 transition-all" />
    </motion.div>
  );
};

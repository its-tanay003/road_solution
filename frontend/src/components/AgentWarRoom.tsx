import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, Activity, Zap, Cpu,
  Users, MessageSquare, AlertTriangle, Send, MousePointer2, Clock, Car
} from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useSosStore } from '../store';
import { toast } from 'react-hot-toast';

// Constants for simulation
const ROOM_ID = "HACK-2026-ALPHA";

interface CollaborativeNote {
  id: string;
  author: string;
  content: string;
  timestamp: number;
}

interface CursorPos {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  role: string;
}

export const AgentWarRoom = () => {
  const { connected, emit } = useSocket();
  const { location } = useSosStore();
  const [roomUsers] = useState<{name: string, role: string, color: string}[]>([
    { name: "Admin_Alpha", role: "Lead Orchestrator", color: "#2979FF" },
    { name: "Medic_Res", role: "Medical Specialist", color: "#FF1744" },
    { name: "Traffic_AI", role: "Route Optimizer", color: "#00E676" },
    { name: "Drone_CMD", role: "Aerial Support", color: "#FFEA00" }
  ]);
  const [notes, setNotes] = useState<CollaborativeNote[]>([]);
  const [cursors, setCursors] = useState<CursorPos[]>([]);
  const [inputNote, setInputNote] = useState('');
  const [isFallback, setIsFallback] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Local user profile
  const [localUser] = useState(() => ({
    id: Math.random().toString(36).substr(2, 9),
    name: "Admin_Alpha",
    role: "Lead Orchestrator",
    color: "#2979FF"
  }));

  useEffect(() => {
    // WebSocket simulation logic
    const timer = setInterval(() => {
      // Simulate remote user notes
      if (Math.random() > 0.8) {
        const remoteNotes = [
          "Ambulance 12.2km away from block spot",
          "Oxygen levels stable for Victim A",
          "Route NH-48 cleared for emergency transit",
          "AI predicting secondary congestion at 4.2km"
        ];
        const newNote: CollaborativeNote = {
          id: Date.now().toString(),
          author: ["Medic_Res", "Traffic_AI", "Drone_CMD"][Math.floor(Math.random() * 3)],
          content: remoteNotes[Math.floor(Math.random() * remoteNotes.length)],
          timestamp: Date.now()
        };
        setNotes(prev => [newNote, ...prev].slice(0, 50));
      }

      // Simulate cursors
      const newCursors = [
        { id: '1', name: 'Medic_Res', color: '#FF1744', x: 20 + Math.random() * 60, y: 30 + Math.random() * 40, role: 'Medical' },
        { id: '2', name: 'Traffic_AI', color: '#00E676', x: 40 + Math.random() * 40, y: 10 + Math.random() * 50, role: 'Route' }
      ];
      setCursors(newCursors);
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNote.trim()) return;

    const newNote: CollaborativeNote = {
      id: Date.now().toString(),
      author: localUser.name,
      content: inputNote,
      timestamp: Date.now()
    };

    setNotes(prev => [newNote, ...prev]);
    setInputNote('');
    
    if (connected) {
      emit('new_note', newNote);
    }
  };

  const simulateConflict = () => {
    toast.error("DATA CONFLICT: Medic_Res is editing Note #412", {
      style: { background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
    });
  };

  const toggleFallback = () => {
    setIsFallback(!isFallback);
    toast.success(isFallback ? "Connection Restored" : "Offline Rule Engine Active", {
      icon: isFallback ? '🌐' : '⚡'
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#020617] text-white p-6 relative overflow-hidden font-sans">
      {/* HUD Background Decorations */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-blue-500 to-transparent" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-blue-900/20" />
        <div className="absolute top-2/4 left-0 w-full h-px bg-blue-900/20" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-blue-900/20" />
        <div className="absolute top-0 left-1/4 w-px h-full bg-blue-900/20" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-blue-900/20" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-blue-900/20" />
      </div>

      <div className="relative z-10 flex flex-col h-full space-y-6">
        {/* Header & Presence */}
        <div className="flex justify-between items-center z-10 bg-slate-900/60 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl font-black italic tracking-tighter text-white uppercase flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]" />
                Shared Incident Room <span className="text-red-500 opacity-60 text-sm">{ROOM_ID}</span>
              </h1>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                Logged in as: <span className="font-bold text-(--user-color)" style={{ '--user-color': localUser.color } as React.CSSProperties}>{localUser.name} ({localUser.role})</span>
              </div>
            </div>

            {isFallback && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-red-500/20 border border-red-500 text-red-500 px-3 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 animate-pulse"
              >
                <Zap size={12} fill="currentColor" />
                OFFLINE RULE ENGINE ACTIVE
              </motion.div>
            )}

            <div className="w-px h-8 bg-white/10" />

            <div className="flex items-center gap-2">
              <Users size={14} className="text-slate-400" />
              <span className="text-xs text-slate-300 font-bold mr-2">{roomUsers.length} in room</span>
              <div className="flex -space-x-2">
                {roomUsers.map((u, i) => {
                  return (

                    <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-md relative group bg-(--u-color)" style={{ '--u-color': u.color } as React.CSSProperties}>
                      {u.name.charAt(0)}
                      <div className="absolute top-full mt-1 hidden group-hover:block bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50">
                        {u.name} - {u.role}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={simulateConflict}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 border border-white/10"
              title="Test Conflict Handling"
            >
              <AlertTriangle size={14} /> Simulate Conflict
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFallback}
              className={`px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-2 border ${
                isFallback ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 text-slate-300 border-white/10'
              }`}
              title="Toggle Offline Fallback"
            >
              <Activity size={14} /> {isFallback ? "Restore Sync" : "Test Fallback"}
            </motion.button>
          </div>
        </div>

        {/* Main Collaborative Area */}
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Left: Interactive Strategy Map */}
          <div 
            ref={containerRef}
            className="flex-1 bg-slate-950/40 rounded-3xl border border-white/5 relative overflow-hidden cursor-crosshair"
          >
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[24px_24px]" />
            
            {/* Map Placeholder Content */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="flex flex-col items-center">
                <BrainCircuit size={120} strokeWidth={1} />
                <span className="text-xl font-black italic tracking-[0.5em] mt-4">NEURAL NEXUS MAP</span>
              </div>
            </div>

            {/* Remote Cursors */}
            <AnimatePresence>
              {cursors.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, x: `${c.x}%`, y: `${c.y}%` }}
                  exit={{ opacity: 0 }}
                  className="absolute pointer-events-none"
                  style={{ left: 0, top: 0, color: c.color }}
                >
                  <MousePointer2 size={18} fill="currentColor" />
                  <div className="ml-4 mt-1">
                    <div className="bg-slate-900 border border-white/10 rounded-md px-2 py-0.5 shadow-xl">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white">{c.name}</span>
                      <p className="text-[7px] text-slate-400 font-bold uppercase leading-none">{c.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Real-time Interaction Area Overlay */}
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Low Latency</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <Clock size={10} /> 
                  {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "RESOLVING_COORD..."}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Car size={14} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">4 Units En Route</span>
              </div>
            </div>
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
                    <span className="text-[10px] font-bold text-(--n-color)" style={{ '--n-color': localUser.name === note.author ? localUser.color : '#94a3b8' } as React.CSSProperties}>
                      {note.author}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{note.content}</p>
                </motion.div>
              ))}
              {notes.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 opacity-40 py-20">
                  <Cpu size={32} />
                  <p className="text-[10px] font-bold uppercase mt-2">Awaiting Data...</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSendNote} className="p-4 bg-slate-950/40 border-t border-white/5">
              <div className="relative">
                <input 
                  type="text"
                  value={inputNote}
                  onChange={(e) => setInputNote(e.target.value)}
                  placeholder="Broadcast message..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs text-white focus:border-blue-500 transition-colors"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-400"
                  title="Send Broadcast"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

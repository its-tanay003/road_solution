import React, { useState } from 'react';
import { 
  Smartphone, 
  Cloud, 
  Server, 
  Brain, 
  Zap, 
  BarChart3, 
  Map as MapIcon,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Node {
  id: string;
  label: string;
  icon: React.ReactNode;
  x: number;
  y: number;
  type: 'client' | 'infra' | 'ai' | 'realtime' | 'metrics' | 'map';
}

interface Edge {
  from: string;
  to: string;
  label: string;
  latency: string;
}

const NODES: Node[] = [
  { id: 'user', label: 'User Device', icon: <Smartphone size={24} />, x: 100, y: 300, type: 'client' },
  { id: 'vercel', label: 'Vercel Edge', icon: <Cloud size={24} />, x: 300, y: 300, type: 'infra' },
  { id: 'express', label: 'Express Backend', icon: <Server size={24} />, x: 500, y: 300, type: 'infra' },
  { id: 'claude', label: 'Claude AI', icon: <Brain size={24} />, x: 750, y: 150, type: 'ai' },
  { id: 'socket', label: 'Socket.io Hub', icon: <Zap size={24} />, x: 750, y: 450, type: 'realtime' },
  { id: 'prometheus', label: 'Metrics (Prom)', icon: <BarChart3 size={24} />, x: 500, y: 100, type: 'metrics' },
  { id: 'leaflet', label: 'Map Tiles', icon: <MapIcon size={24} />, x: 500, y: 500, type: 'map' },
];

const EDGES: Edge[] = [
  { from: 'user', to: 'vercel', label: 'HTTPS + PWA', latency: '~45ms' },
  { from: 'vercel', to: 'express', label: 'Serverless Func', latency: '~12ms' },
  { from: 'express', to: 'claude', label: 'AI Triage Request', latency: '~800ms' },
  { from: 'express', to: 'socket', label: 'Real-time Events', latency: '~5ms' },
  { from: 'socket', to: 'user', label: 'Dispatch Update', latency: '~12ms' },
  { from: 'express', to: 'prometheus', label: 'Scrape Metrics', latency: '~1ms' },
  { from: 'leaflet', to: 'user', label: 'Static Tiles', latency: '~30ms' },
];

const TYPE_COLORS = {
  client: 'stroke-blue-500 fill-blue-500 text-blue-500 bg-blue-500/10 border-blue-500/20',
  infra: 'stroke-slate-500 fill-slate-500 text-slate-500 bg-slate-500/10 border-slate-500/20',
  ai: 'stroke-purple-500 fill-purple-500 text-purple-500 bg-purple-500/10 border-purple-500/20',
  realtime: 'stroke-amber-500 fill-amber-500 text-amber-500 bg-amber-500/10 border-amber-500/20',
  metrics: 'stroke-emerald-500 fill-emerald-500 text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  map: 'stroke-indigo-500 fill-indigo-500 text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
};

export const ArchitectureDiagram: React.FC = () => {
  const [activeFlow, setActiveFlow] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);

  const triggerSOS = () => {
    setIsTriggering(true);
    // Sequence the flow animation
    const flowSteps = ['user-vercel', 'vercel-express', 'express-claude', 'express-socket', 'socket-user'];
    
    flowSteps.forEach((step, index) => {
      setTimeout(() => {
        setActiveFlow(step);
        if (index === flowSteps.length - 1) {
          setTimeout(() => {
            setActiveFlow(null);
            setIsTriggering(false);
          }, 1500);
        }
      }, index * 800);
    });
  };

  const getNodePos = (id: string) => {
    const node = NODES.find(n => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center justify-center font-sans overflow-hidden">
      <div className="max-w-6xl w-full space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">System Architecture</h1>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-1">Living Distributed Infrastructure Map</p>
          </div>
          
          <button 
            onClick={triggerSOS}
            disabled={isTriggering}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-black rounded-xl flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-red-900/20"
          >
            <Activity size={18} className={isTriggering ? 'animate-pulse' : ''} />
            TRIGGER SOS FLOW
          </button>
        </div>

        {/* SVG Container */}
        <div className="relative bg-slate-900/30 border border-white/5 rounded-[2rem] p-8 overflow-hidden aspect-[16/9]">
          <svg viewBox="0 0 1000 600" className="w-full h-full overflow-visible">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Edges */}
            {EDGES.map((edge, i) => {
              const start = getNodePos(edge.from);
              const end = getNodePos(edge.to);
              const isActive = activeFlow === `${edge.from}-${edge.to}`;

              return (
                <g key={i}>
                  {/* Base Line */}
                  <path 
                    d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                    className={`stroke-2 fill-none transition-colors duration-500 ${isActive ? 'stroke-white' : 'stroke-slate-800'}`}
                    strokeDasharray="8 8"
                  />

                  {/* Active Animated Line */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.path 
                        d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="stroke-2 stroke-blue-400 fill-none"
                        style={{ filter: 'url(#glow)' }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Traveling Packet */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.circle
                        r="4"
                        fill="#fff"
                        initial={{ offsetDistance: "0%" }}
                        animate={{ offsetDistance: "100%" }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        style={{ offsetPath: `path("M ${start.x} ${start.y} L ${end.x} ${end.y}")` }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Label & Latency */}
                  <foreignObject 
                    x={(start.x + end.x) / 2 - 50} 
                    y={(start.y + end.y) / 2 - 40} 
                    width="100" 
                    height="40"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className={`text-[8px] font-black uppercase tracking-tighter transition-colors ${isActive ? 'text-white' : 'text-slate-600'}`}>
                        {edge.label}
                      </div>
                      <div className={`text-[7px] font-mono mt-0.5 px-1 rounded transition-colors ${isActive ? 'bg-blue-500 text-white' : 'text-slate-700'}`}>
                        {edge.latency}
                      </div>
                    </div>
                  </foreignObject>
                </g>
              );
            })}

            {/* Nodes */}
            {NODES.map((node) => (
              <g key={node.id} transform={`translate(${node.x - 60}, ${node.y - 40})`}>
                <motion.rect
                  width="120"
                  height="80"
                  rx="16"
                  className={`${TYPE_COLORS[node.type].split(' ')[1]} border-2 transition-all duration-500 ${
                    activeFlow?.includes(node.id) ? 'stroke-white scale-105' : 'stroke-white/5'
                  }`}
                  style={{ fill: '#0f172a' }}
                />
                
                <foreignObject width="120" height="80">
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                    <div className={`${TYPE_COLORS[node.type].split(' ')[2]} mb-1`}>
                      {node.icon}
                    </div>
                    <div className="text-[10px] font-black text-slate-200 uppercase tracking-tighter leading-tight">
                      {node.label}
                    </div>
                    <div className={`text-[7px] font-bold uppercase tracking-[0.2em] mt-1 opacity-40`}>
                      {node.type}
                    </div>
                  </div>
                </foreignObject>

                {/* Pulse for Active Node */}
                {activeFlow?.includes(node.id) && (
                  <motion.rect
                    width="120"
                    height="80"
                    rx="16"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.1, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className={`fill-none stroke-2 ${TYPE_COLORS[node.type].split(' ')[0]}`}
                  />
                )}
              </g>
            ))}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-8 left-8 flex gap-6 bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-white/5">
            {Object.entries(TYPE_COLORS).map(([type, colorClass]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${colorClass.split(' ')[4]}`} />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{type}</span>
              </div>
            ))}
          </div>

          {/* Active Banner */}
          <AnimatePresence>
            {isTriggering && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute top-8 right-8 bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-2xl shadow-red-900/50"
              >
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                SOS Event In-Progress
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Technical Stack Callout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50 hover:opacity-100 transition-opacity">
          {[
            { label: 'Edge Layer', tech: 'Vercel Runtime' },
            { label: 'Intelligence', tech: 'Claude 3.5 Sonnet' },
            { label: 'Pub/Sub', tech: 'Redis + Socket.io' },
            { label: 'Telemetry', tech: 'Prometheus OSS' },
          ].map((item, i) => (
            <div key={i} className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
              <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{item.label}</div>
              <div className="text-xs font-bold text-slate-300">{item.tech}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

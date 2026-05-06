import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Share2, 
  Activity, 
  Zap, 
  SignalHigh
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMeshMode } from '../hooks/useMeshMode';

export const MeshStatus: React.FC = () => {
  const { 
    connectionState, 
    latency, 
    hops, 
    receivedPackets, 
    startMeshHandshake, 
    broadcastSOS 
  } = useMeshMode();

  const [internetKilled, setInternetKilled] = useState(false);

  const simulateInternetKill = () => {
    setInternetKilled(true);
    // In a real demo, we'd start the handshake to find peers
    startMeshHandshake();
  };

  const handleTestBroadcast = () => {
    broadcastSOS({
      type: 'SOS',
      victimId: 'DEMO-USER-' + Math.floor(Math.random() * 1000),
      location: [28.6139, 77.2090],
      timestamp: new Date().toISOString(),
      triageData: { severity: 'CRITICAL', injury: 'Blunt Force Trauma' }
    });
  };

  return (
    <div className="p-6 bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-2xl space-y-6 max-w-xl mx-auto shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-[var(--radius-lg)] transition-colors ${internetKilled ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
            {internetKilled ? <WifiOff size={20} /> : <Wifi size={20} />}
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">Connection Engine</div>
            <div className="text-sm font-bold flex items-center gap-2">
              {internetKilled ? 'MESH MODE ACTIVE' : 'Connected via Internet'}
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${internetKilled ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            </div>
          </div>
        </div>

        {!internetKilled && (
          <button 
            onClick={simulateInternetKill}
            className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/30 rounded-[var(--radius-lg)] text-xs font-black tracking-tighter transition-all"
          >
            KILL INTERNET
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
            <Activity size={12} />
            P2P State
          </div>
          <div className="text-sm font-mono font-bold text-blue-400 uppercase tracking-tight">
            {connectionState}
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
            <Zap size={12} />
            Network Latency
          </div>
          <div className="text-sm font-mono font-bold text-emerald-400">
            {latency !== null ? `${latency}ms` : '--'}
          </div>
        </div>
      </div>

      {internetKilled && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500">
            <Share2 size={20} className="animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Mesh Relay Active</div>
            <div className="text-xs text-slate-400">Direct peer-to-peer relay (Hops: {hops})</div>
          </div>
          <button 
            onClick={handleTestBroadcast}
            className="px-3 py-1.5 bg-amber-500 text-slate-900 text-[10px] font-black rounded-[var(--radius-lg)] uppercase tracking-widest"
          >
            Test Relay
          </button>
        </motion.div>
      )}

      {/* Received Packets Log */}
      <div className="space-y-3">
        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
          <SignalHigh size={12} />
          Mesh Traffic Log
        </div>
        <div className="bg-black/40 rounded-xl overflow-hidden border border-white/5">
          <div className="max-h-40 overflow-y-auto p-2 custom-scrollbar">
            <AnimatePresence>
              {receivedPackets.length === 0 ? (
                <div className="text-[10px] text-slate-700 font-mono italic p-4 text-center">
                  Waiting for peer data...
                </div>
              ) : (
                receivedPackets.map((packet, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 border-b border-white/5 last:border-0 bg-white/5 rounded-[var(--radius-lg)] mb-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">MESH RELAY RECEIVED</span>
                      <span className="text-[9px] font-mono text-slate-500">{new Date(packet.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-300">
                      Via P2P, No Internet | ID: {packet.victimId}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

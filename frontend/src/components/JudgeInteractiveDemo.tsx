import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Users, 
  Zap, 
  MapPin, 
  ShieldAlert,
  Smartphone,
  Globe
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useJudgeStore } from '../store';
import { logger } from '../lib/logger';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const APP_URL = window.location.origin;
const SESSION_ID = `ALPHA-${Math.floor(Math.random() * 100)}`;

export const JudgeInteractiveDemo: React.FC = () => {
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const { activeIncidents, addIncident, clearIncidents } = useJudgeStore();

  useEffect(() => {
    const demoUrl = `${APP_URL}/judge-demo?session=${SESSION_ID}`;
    QRCode.toDataURL(demoUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#ffffff',
        light: '#0f172a' // slate-900
      }
    }).then(setQrCodeData);

    const s = io(SOCKET_URL);
    s.on('connect', () => {
      logger.log('Presentation socket connected');
    });

    s.on('judge:sos', (incident: { sessionId: string; name: string; location: [number, number]; timestamp: string; id: string }) => {
      if (incident.sessionId === SESSION_ID) {
        addIncident({
          ...incident,
          timestamp: new Date(incident.timestamp)
        });
      }
    });

    return () => {
      s.disconnect();
    };
  }, [addIncident]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-12 flex flex-col font-sans overflow-hidden">
      {/* Background Ambient Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full max-w-7xl mx-auto w-full gap-12">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-(--radius-lg)">
                <Users className="text-blue-400 w-6 h-6" />
              </div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic">Audience Participation</h1>
            </div>
            <p className="text-slate-400 text-lg font-medium">
              Real-time interactive deployment test for <span className="text-white italic">ROADSoS Alpha</span>
            </p>
          </div>
          
          <div className="bg-slate-900 border border-white/10 px-6 py-4 rounded-2xl flex flex-col items-center">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Active Session</div>
            <div className="text-3xl font-black text-blue-400 font-mono tracking-tighter">{SESSION_ID}</div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-12 items-start">
          
          {/* Left: QR Code Section */}
          <div className="space-y-8">
            <div className="bg-slate-900/50 border border-white/5 p-8 rounded-4xl flex flex-col items-center text-center space-y-6 shadow-2xl backdrop-blur-xl">
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-tr from-black/20 to-transparent pointer-events-none" />
                <div className="absolute -inset-4 bg-blue-500/20 rounded-3xl blur-xl group-hover:bg-blue-500/30 transition-all duration-500" />
                <div className="relative bg-white p-4 rounded-2xl shadow-2xl">
                  {qrCodeData ? (
                    <img src={qrCodeData} alt="Demo QR Code" className="w-[300px] h-[300px]" />
                  ) : (
                    <div className="w-[300px] h-[300px] flex items-center justify-center bg-slate-950 rounded-xl">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-2xl font-black tracking-tight">Scan to participate</div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-slate-400 text-sm justify-center">
                    <Smartphone size={16} />
                    <span>Open camera or QR scanner</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm justify-center">
                    <Globe size={16} />
                    <span className="font-mono text-[10px] opacity-50 underline">{APP_URL}/judge-demo</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={clearIncidents}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
              >
                Reset Queue
              </button>
            </div>

            <div className="bg-blue-600 p-6 rounded-3xl space-y-4 shadow-xl shadow-blue-900/20">
              <div className="flex items-center gap-3">
                <Zap size={20} className="text-white" />
                <h3 className="font-black uppercase tracking-tight">Demo Protocol</h3>
              </div>
              <p className="text-blue-100 text-sm font-medium leading-relaxed">
                Scanning this code binds your device as a <span className="text-white font-bold">Field Investigator</span>. Any SOS you trigger will propagate globally to all demo nodes.
              </p>
            </div>
          </div>

          {/* Right: Live Incidents Feed */}
          <div className="bg-slate-900/30 border border-white/5 rounded-4xl p-8 flex flex-col h-full shadow-inner min-h-[600px]">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <ShieldAlert className="text-red-500 w-8 h-8" />
                <h2 className="text-3xl font-black tracking-tighter uppercase italic">Live Incident Stream</h2>
              </div>
              <div className="bg-slate-950 px-4 py-2 rounded-full border border-white/5 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${activeIncidents.length > 0 ? 'bg-red-500 animate-ping' : 'bg-slate-700'}`} />
                <span className="text-xs font-black uppercase tracking-widest">
                  {activeIncidents.length} Active Incidents
                </span>
              </div>
            </div>

            <div className="flex-1 relative">
              <AnimatePresence mode="popLayout">
                {activeIncidents.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 space-y-4"
                  >
                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border-2 border-dashed border-white/5">
                      <QrCode size={40} />
                    </div>
                    <p className="font-mono text-sm uppercase tracking-widest animate-pulse">Waiting for participant triggers...</p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {activeIncidents.map((incident, index) => (
                      <motion.div
                        key={incident.id}
                        initial={{ x: 50, opacity: 0, scale: 0.95 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className={`p-6 rounded-3xl border-2 flex items-center justify-between gap-6 transition-all shadow-xl ${
                          index === 0 
                            ? 'bg-red-600 border-red-500 shadow-red-900/20' 
                            : 'bg-slate-900/80 border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${
                            index === 0 ? 'bg-white text-red-600' : 'bg-slate-950 text-slate-500'
                          }`}>
                            #{index + 1}
                          </div>
                          <div className="space-y-1">
                            <div className={`text-xs font-black uppercase tracking-widest ${
                              index === 0 ? 'text-red-200' : 'text-slate-500'
                            }`}>
                              SOS Signal Received
                            </div>
                            <div className="text-2xl font-black tracking-tight flex items-center gap-2">
                              {incident.name || 'Anonymous Judge'}
                              {index === 0 && (
                                <span className="text-[10px] bg-white text-red-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Latest</span>
                              )}
                            </div>
                            <div className={`flex items-center gap-2 text-xs font-mono ${
                              index === 0 ? 'text-red-100' : 'text-slate-400'
                            }`}>
                              <MapPin size={12} />
                              {incident.location[0].toFixed(4)}, {incident.location[1].toFixed(4)}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-[10px] font-black uppercase tracking-widest ${
                            index === 0 ? 'text-red-200' : 'text-slate-500'
                          }`}>
                            Telemetry Latency
                          </div>
                          <div className={`text-xl font-black ${
                            index === 0 ? 'text-white' : 'text-emerald-500'
                          }`}>
                            ~{12 + (index * 4)}ms
                          </div>
                          <div className={`text-[10px] font-mono mt-1 ${
                            index === 0 ? 'text-red-200/50' : 'text-slate-600'
                          }`}>
                            {incident.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Tech Stats */}
            <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Protocol</div>
                <div className="text-sm font-bold text-white">WebSocket (Engine.io)</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Geospatial Res.</div>
                <div className="text-sm font-bold text-white">L10 GPS Decimation</div>
              </div>
              <div className="space-y-1 text-right">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Session Uptime</div>
                <div className="text-sm font-bold text-white">04:12:33</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};

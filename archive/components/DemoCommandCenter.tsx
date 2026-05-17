import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  MapPin, 
  Activity, 
  Send, 
  CheckCircle2, 
  Clock, 
  Radio, 
  Terminal,
  Cpu,
  Link2,
  Play,
  RotateCcw,
  Search
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useJudgeStore, useChaosStore, useEmergencyStore } from '../store';
import 'leaflet/dist/leaflet.css';
import { GoldenHourTimer } from './GoldenHourTimer';
import { DownloadReportButton } from './DownloadReportButton';
import { VaahanLookup } from './VaahanLookup';

// Heavy Components — Lazy Loaded
const CrashReconstruction3D = lazy(() => import('./CrashReconstruction3D').then(m => ({ default: m.CrashReconstruction3D })));
const WearableBiometrics = lazy(() => import('./WearableBiometrics').then(m => ({ default: m.WearableBiometrics })));


// Fix leaflet icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Static locations to avoid re-renders
const VICTIM_LOC: [number, number] = [28.6139, 77.2090];
const INITIAL_UNIT_LOC: [number, number] = [28.6200, 77.2200];

// Mock Unit Icon
const unitIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1022/1022215.png',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const DemoCommandCenter = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [chatMessages, setChatMessages] = useState<{sender: string, text: string}[]>([]);
  const [dispatchEvents, setDispatchEvents] = useState<string[]>([]);
  const [unitStatus, setUnitStatus] = useState<'IDLE' | 'DISPATCHED' | 'EN ROUTE' | 'ON SCENE'>('IDLE');
  const [isSendingData, setIsSendingData] = useState(false);
  const [showVaahan, setShowVaahan] = useState(false);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const [victimLoc, setVictimLoc] = useState<[number, number]>(VICTIM_LOC);
  // Responder's simulated location
  const [unitLoc, setUnitLoc] = useState<[number, number]>(INITIAL_UNIT_LOC);
  const { activeIncidents, addIncident } = useJudgeStore();
  const { internetKilled, backendKilled } = useChaosStore();
  const { 
    setCrashDetectedAt, 
    setGoldenHourActive,
    setCrashTriggered,
    setGForceData
  } = useEmergencyStore();

  const handleDispatchActivation = useCallback((data: { location: [number, number] }) => {
    setDispatchEvents(prev => [...prev, `[${new Date().toLocaleTimeString()}] INCOMING SOS: TOKEN_ALPHA_9`]);
    setDispatchEvents(prev => [...prev, `[${new Date().toLocaleTimeString()}] Analyzing impact vectors...`]);
    setDispatchEvents(prev => [...prev, `[${new Date().toLocaleTimeString()}] GPS Locked: ${data.location[0].toFixed(4)}, ${data.location[1].toFixed(4)}`]);
    
    setTimeout(() => {
      setDispatchEvents(prev => [...prev, `[${new Date().toLocaleTimeString()}] Triage Result: CRITICAL - ALS REQ`]);
      setUnitStatus('DISPATCHED');
      setDispatchEvents(prev => [...prev, `[${new Date().toLocaleTimeString()}] Dispatching Unit A47 (ETA 4.2m)`]);
    }, 1000);

    setTimeout(() => {
      setUnitStatus('EN ROUTE');
      // Animate unit movement
      const interval = setInterval(() => {
        setUnitLoc(prev => [
          prev[0] - (prev[0] - victimLoc[0]) * 0.1,
          prev[1] - (prev[1] - victimLoc[1]) * 0.1
        ]);
      }, 500);
      setTimeout(() => clearInterval(interval), 10000);
    }, 3000);
  }, [victimLoc]);

  useEffect(() => {
    const s = io(SOCKET_URL);
    
    s.on('connect', () => {
      setIsConnected(true);
      setSocket(s);
    });
    
    s.on('disconnect', () => {
      setIsConnected(false);
      setSocket(null);
    });

    s.on('sos:triggered', (data: { location: [number, number] }) => {
      handleDispatchActivation(data);
    });

    s.on('judge:sos', (incident: { sessionId: string; name: string; location: [number, number]; timestamp: string; id: string }) => {
      // Add to global store so all components see it
      addIncident({
        ...incident,
        timestamp: new Date(incident.timestamp)
      });
      // Automatically initiate triage for the judge incident
      handleDispatchActivation(incident);
    });

    if (backendKilled) {
      s.disconnect();
    }

    return () => {
      s.disconnect();
    };
  }, [handleDispatchActivation, addIncident, backendKilled]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [dispatchEvents]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const triggerSOS = () => {
    setSosActive(true);
    let count = 5;
    setCountdown(count);
    const timer = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
        finalizeSOS();
      }
    }, 1000);
  };

  const resetDemo = () => {
    setUnitLoc(INITIAL_UNIT_LOC);
    setCrashDetectedAt(null);
    setGoldenHourActive(false);
    setCrashTriggered(false);
    setGForceData({ x: 0, y: 0, z: 0 });
  };

  const playScenario = (type: 'CRASH' | 'RURAL' | 'MULTI') => {
    resetDemo();
    const loc = type === 'CRASH' ? [28.6139, 77.2090] : type === 'RURAL' ? [28.8, 76.9] : [28.5, 77.3];
    setVictimLoc(loc as [number, number]);
    
    setTimeout(() => {
      triggerSOS();
    }, 500);
  };

  const finalizeSOS = () => {
    setIsSendingData(true);
    socket?.emit('sos:triggered', {
      type: 'CRASH_DEMO',
      location: victimLoc,
      severity: 'CRITICAL'
    });

    setTimeout(() => {
      setIsSendingData(false);
      setCrashDetectedAt(Date.now());
      setGoldenHourActive(true);
      setCrashTriggered(true);
      setGForceData({ x: 12.4, y: 2.1, z: -3.2 });
      setChatMessages([
        { sender: 'AI', text: 'Emergency detected. Analyzers active. Stay calm, help is being routed.' }
      ]);
      
      // Simulate follow up chat
      setTimeout(() => {
        setChatMessages(prev => [...prev, { sender: 'AI', text: 'Can you describe any visible injuries or hazards?' }]);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans overflow-hidden">
      {/* Top Demo Bar */}
      <div className="h-14 bg-slate-950 border-b border-white/10 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full flex items-center gap-2 text-xs font-bold tracking-widest border border-red-500/30 uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Emergency Response Network

          </div>

          {(internetKilled || backendKilled) && (
            <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full flex items-center gap-3 animate-pulse border border-red-400">
              <ShieldAlert size={14} />
              {internetKilled && "Internet Killed"}
              {internetKilled && backendKilled && " • "}
              {backendKilled && "Backend Link Severed"}
              <span className="opacity-50 italic ml-2">Failover Active</span>
            </div>
          )}

          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Radio size={14} className={isConnected ? 'text-emerald-500' : 'text-red-500'} />
            {isConnected ? 'Socket.io Connected' : 'Connecting to Server...'}
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-900 border border-white/5 px-3 py-1 rounded-lg">
          <div className="flex items-center gap-1 mr-2">
            <button onClick={() => playScenario('CRASH')} className="text-[10px] font-mono text-slate-400 hover:text-white uppercase tracking-widest px-2 py-1 rounded hover:bg-white/10 flex items-center gap-1"><Play size={10}/> Crash</button>
            <button onClick={() => playScenario('RURAL')} className="text-[10px] font-mono text-slate-400 hover:text-white uppercase tracking-widest px-2 py-1 rounded hover:bg-white/10 flex items-center gap-1"><Play size={10}/> Rural</button>
            <button onClick={() => playScenario('MULTI')} className="text-[10px] font-mono text-slate-400 hover:text-white uppercase tracking-widest px-2 py-1 rounded hover:bg-white/10 flex items-center gap-1"><Play size={10}/> Multi</button>
            <div className="w-px h-4 bg-white/20 mx-1"></div>
            <button onClick={resetDemo} className="text-[10px] font-mono text-slate-400 hover:text-red-400 uppercase tracking-widest px-2 py-1 rounded hover:bg-white/10 flex items-center gap-1"><RotateCcw size={10}/> Reset</button>
          </div>
          <div className="w-px h-4 bg-white/10 mr-2" />
          <Cpu size={14} className="text-blue-400" />
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Neural Link: ACTIVE</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[1fr_80px_1fr] relative h-[calc(100vh-3.5rem)]">
        
        {/* LEFT PANEL: Victim View */}
        <div className="flex items-center justify-center bg-slate-900/50 p-8">
          <div className="relative w-[340px] h-[640px] bg-slate-800 rounded-[3rem] p-4 shadow-2xl border-8 border-slate-950">
            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-950 rounded-b-3xl z-30" />
            
            {/* Phone Screen */}
            <div className="w-full h-full bg-white rounded-4xl overflow-hidden flex flex-col relative text-slate-900">
              <div className="h-14 bg-white border-b border-slate-100 flex items-center px-6 pt-4">
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Emergency OS</div>
                  <div className="text-xs font-black">ROADSoS Mobile</div>
                </div>
                <Activity size={18} className="text-red-500 animate-pulse" />
              </div>

              {!sosActive ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                  <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center">
                    <ShieldAlert size={64} className="text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Need Help?</h2>
                    <p className="text-slate-500 text-sm mt-2">Trigger AI Rescue Protocol instantly.</p>
                  </div>
                  <button 
                    onClick={triggerSOS}
                    className="w-full h-20 bg-red-600 text-white rounded-2xl font-black text-xl shadow-[0_15px_30px_rgba(220,38,38,0.3)] active:scale-95 transition-transform"
                  >
                    TRIGGER SOS
                  </button>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                    <MapPin size={10} />
                    GPS Standby
                  </div>
                </div>
              ) : countdown > 0 ? (
                <div className="flex-1 bg-red-600 flex flex-col items-center justify-center p-8 text-white text-center">
                  <motion.div 
                    key={countdown}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-9xl font-black"
                  >
                    {countdown}
                  </motion.div>
                  <div className="mt-8">
                    <div className="text-lg font-bold">Initiating AI Rescue</div>
                    <p className="opacity-70 text-sm">Cancel if accidental</p>
                  </div>
                  <button 
                    onClick={() => setSosActive(false)}
                    className="mt-12 px-8 py-3 bg-white/20 rounded-full font-bold text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col bg-slate-50">
                  {/* Chat Area */}
                  <div ref={chatRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
                    <AnimatePresence>
                      {chatMessages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`flex ${msg.sender === 'AI' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                            msg.sender === 'AI' 
                              ? 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm' 
                              : 'bg-blue-600 text-white rounded-br-none shadow-md'
                          }`}>
                            {msg.text}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  
                  {/* Location Banner */}
                  <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      GPS ACQUIRED: {victimLoc[0].toFixed(2)}, {victimLoc[1].toFixed(2)}
                    </div>
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  </div>

                  <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
                    <div className="flex-1 h-12 bg-slate-100 rounded-xl px-4 flex items-center text-slate-400 text-sm">
                      Type a message...
                    </div>
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                      <Send size={18} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER: Data Bridge */}
        <div className="flex items-center justify-center relative">
          <div className="absolute inset-y-0 w-px bg-white/5" />
          <svg className="w-full h-full absolute pointer-events-none overflow-visible">
            <defs>
              <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <path 
              d="M -40,320 L 120,320" 
              fill="transparent" 
              stroke="url(#flowGrad)" 
              strokeWidth="2" 
              strokeDasharray="4 4"
              className={isSendingData ? "animate-[dash_1s_linear_infinite]" : "opacity-0 transition-opacity duration-300"}
            />
          </svg>
          <div className="z-10 flex flex-col gap-8">
            <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-slate-950 transition-all duration-300 ${isSendingData ? 'text-blue-400 border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'text-slate-700'}`}>
              <Link2 size={14} />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Dispatch Center */}
        <div className="flex flex-col bg-slate-950 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black tracking-widest uppercase flex items-center gap-2">
                <Terminal size={18} className="text-emerald-500" />
                Incident Command Center
              </h2>
              <div className="text-[10px] text-slate-500 font-mono">NODE_CLUSTER: ASIA-SOUTH-1</div>
            </div>
            {unitStatus !== 'IDLE' && (
              <div className="bg-red-500 text-white px-3 py-1 rounded font-black text-[10px] tracking-widest animate-pulse uppercase">
                Critical Alert
              </div>
            )}
            <button 
              onClick={() => setShowVaahan(!showVaahan)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-blue-400 hover:bg-white/10 transition-all flex items-center gap-2 text-[10px] font-mono uppercase"
            >
              <Search size={14} /> Vaahan
            </button>
          </div>

          {/* Vaahan Lookup Integration */}
          <AnimatePresence>
            {showVaahan && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <VaahanLookup />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Golden Hour Timer Integration */}
          {sosActive && countdown === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2"
            >
              <GoldenHourTimer />
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-4 h-[220px]">
            {/* Live Queue */}
            <div className="bg-slate-900 border border-white/5 rounded-xl p-4 flex flex-col overflow-hidden">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center justify-between">
                Incident Queue
                <span className="text-emerald-500">Live</span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                {unitStatus === 'IDLE' ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-2 border-2 border-dashed border-white/5 rounded-lg">
                    <Clock size={24} />
                    <span className="text-[10px] font-mono uppercase">Scanning...</span>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-red-500">#ALPHA-9</span>
                      <span className="text-[9px] font-mono text-slate-500">JUST NOW</span>
                    </div>
                    <div className="text-xs font-bold text-slate-200">Vehicle Collision</div>
                    <div className="text-[10px] text-slate-500 mt-1">{victimLoc[0].toFixed(4)}, {victimLoc[1].toFixed(4)}</div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* AI Analysis Console */}
            <div className="bg-black border border-white/5 rounded-xl p-4 flex flex-col overflow-hidden font-mono">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                <Cpu size={12} className="text-blue-400" />
                AI Decision Log
              </div>
              <div ref={terminalRef} className="flex-1 text-[10px] space-y-1 overflow-y-auto text-emerald-500/80 custom-scrollbar leading-tight">
                {dispatchEvents.length === 0 ? (
                  <div className="text-slate-700 italic">Waiting for telemetry...</div>
                ) : (
                  dispatchEvents.map((ev, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {ev}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="flex-1 min-h-[300px] bg-slate-900 rounded-xl overflow-hidden relative border border-white/5">
            <div className="absolute top-4 left-4 z-1000 bg-slate-950/80 backdrop-blur border border-white/10 p-2 rounded-lg pointer-events-none">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-[9px] text-slate-500 uppercase font-black">AI Triage</div>
                  <div className={`text-xs font-black ${unitStatus !== 'IDLE' ? 'text-red-500' : 'text-slate-400'}`}>
                    {unitStatus !== 'IDLE' ? 'CRITICAL' : 'STANDBY'}
                  </div>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="text-center">
                  <div className="text-[9px] text-slate-500 uppercase font-black">Est. ETA</div>
                  <div className="text-xs font-black text-emerald-500">
                    {unitStatus !== 'IDLE' ? '4.2m' : '--'}
                  </div>
                </div>
              </div>
            </div>

            <MapContainer key={victimLoc.join(',')} center={victimLoc} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {unitStatus !== 'IDLE' && (
                <>
                  <Marker position={victimLoc}>
                    <Popup>Emergency Site</Popup>
                  </Marker>
                  <Marker position={unitLoc} icon={unitIcon}>
                    <Popup>Unit A47</Popup>
                  </Marker>
                  <Polyline positions={[unitLoc, victimLoc]} color="#ef4444" weight={2} dashArray="5, 10" />
                </>
              )}
              {activeIncidents.map((incident) => (
                <Marker key={incident.id} position={incident.location}>
                  <Popup>Judge Incident: {incident.name}</Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Bottom Status Bar */}
            <div className="absolute bottom-4 left-4 right-4 z-1000 flex gap-2">
              {['DISPATCHED', 'EN ROUTE', 'ON SCENE'].map((status) => (
                <div 
                  key={status}
                  className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all border ${
                    unitStatus === status 
                      ? 'bg-emerald-500 text-white font-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                      : 'bg-slate-950/80 text-slate-600 font-bold border-white/5'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${unitStatus === status ? 'bg-white animate-pulse' : 'bg-slate-800'}`} />
                  <span className="text-[10px] uppercase tracking-widest">{status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Report Generation Integration */}
          <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-4">
            {/* 3D Reconstruction and Biometrics */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Physics Reconstruction</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-[9px] text-emerald-500 font-mono">LIVE_FEED</span>
                  </div>
                </div>
                <Suspense fallback={<div className="h-[280px] w-full bg-white/5 animate-pulse rounded-2xl flex items-center justify-center text-[10px] font-mono text-white/20">Loading 3D View...</div>}>
                  <CrashReconstruction3D />
                </Suspense>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Telemetry Dashboard</h3>
                  <div className="text-[9px] text-slate-400 font-mono">ENCRYPTED_SSL</div>
                </div>
                <Suspense fallback={<div className="h-[280px] w-full bg-white/5 animate-pulse rounded-2xl flex items-center justify-center text-[10px] font-mono text-white/20">Loading Telemetry...</div>}>
                  <WearableBiometrics />
                </Suspense>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Post-Incident Operations</div>
              <div className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">V2.4.0-STABLE</div>
            </div>
            <DownloadReportButton />
          </div>
        </div>

      </div>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -8;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

import { useEffect, useState, useCallback } from 'react';
import { useSosStore, useServicesStore } from '../store';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useWakeWord } from '../hooks/useWakeWord';
import { useNetworkMode } from '../hooks/useNetworkMode';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveCore } from '../components/LiveCore';
import { TiltCard } from '../components/TiltCard';
import { LiveMap } from './LiveMap'; 
import { TriageChat } from './TriageChat'; 
import { 
  ShieldAlert, 
  AlertTriangle, 
  Hospital, 
  Shield, 
  Wrench, 
  Activity, 
  Mic, 
  MicOff, 
  ShieldCheck, 
  ActivitySquare, 
  Radio, 
  Maximize2, 
  Layout, 
  UserCircle, 
  MessageCircle 
} from 'lucide-react';

type UXMode = 'DEFAULT' | 'COMMAND' | 'EMERGENCY' | 'VOICE';

export const Home = () => {
  const navigate = useNavigate();
  const { setLocation, isActive, triggerSos } = useSosStore();
  const { setServices } = useServicesStore();
  const { isOffline, isLowBandwidth } = useNetworkMode();
  const [uxMode, setUxMode] = useState<UXMode>('DEFAULT');
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Auto-switch to Emergency mode if SOS is active
  useEffect(() => {
    if (isActive && uxMode === 'DEFAULT') {
      setUxMode('EMERGENCY');
    } else if (!isActive) {
      setUxMode('DEFAULT');
    }
  }, [isActive, uxMode]);

  // Wake word handler
  const handleWakeWord = useCallback((word: string) => {
    console.log("Wake word detected:", word);
    triggerSos();
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, [triggerSos]);

  const { isListening, error, startListening } = useWakeWord(
    ['emergency help', 'help me', 'sos'],
    handleWakeWord
  );

  useEffect(() => {
    if (voiceEnabled && !isListening && !error) {
      startListening();
    }
  }, [voiceEnabled, isListening, startListening, error]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords.latitude, position.coords.longitude);
          fetchNearbyServices(position.coords.latitude, position.coords.longitude);
        },
        (error) => console.error("Location error", error),
        { enableHighAccuracy: true }
      );
    } else {
      setLocation(28.6139, 77.2090);
      fetchNearbyServices(28.6139, 77.2090);
    }
  }, []);

  const fetchNearbyServices = async (lat: number, lng: number) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/api/services/nearby?lat=${lat}&lng=${lng}`);
      setServices(data);
    } catch (err) {
      console.warn("Could not fetch services, using fallback data");
      setServices([
        { name: 'AIIMS Delhi Trauma Centre', type: 'hospital', lat: 28.5672, lng: 77.2100, phone_primary: '011-26588500' },
        { name: 'Delhi Ambulance 102', type: 'ambulance', lat: 28.6139, lng: 77.2090, phone_primary: '102' }
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans relative overflow-hidden">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at center, rgba(6,182,212,0.4) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.3) 0%, transparent 30%)`,
            backgroundSize: "200% 200%"
          }}
        />
        {/* Cybersecurity Grid Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50 mix-blend-screen" />
      </div>

      <header className="p-4 bg-slate-950/50 backdrop-blur-xl flex justify-between items-center shadow-lg border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" size={32} />
          <h1 className="text-2xl font-condensed font-extrabold tracking-widest text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-500">
            ROAD<span className="text-white">SoS</span>
          </h1>
        </div>
        
        {/* Voice Trigger Toggle */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setVoiceEnabled(!voiceEnabled);
            if (!voiceEnabled) setUxMode('VOICE');
            else setUxMode('DEFAULT');
          }}
          title={voiceEnabled ? "Disable Voice Wake Word" : "Enable Voice Wake Word ('Emergency Help')"}
          className={`relative p-2 rounded-full border transition-all duration-300 ${
            voiceEnabled 
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]' 
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          {voiceEnabled ? (
            <>
              <Mic size={20} className="animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping"></span>
            </>
          ) : (
            <MicOff size={20} />
          )}
        </motion.button>
      </header>

      {/* Offline / Low Bandwidth Banner */}
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isOffline || isLowBandwidth ? 'auto' : 0, opacity: isOffline || isLowBandwidth ? 1 : 0 }}
        className="overflow-hidden bg-amber-500/20 border-b border-amber-500/50 backdrop-blur-md"
      >
        <div className="px-4 py-2 flex items-center justify-center text-amber-400 text-xs font-mono">
          <AlertTriangle size={14} className="mr-2" />
          {isOffline ? 'Working Offline - Using Cached Data' : 'Low Bandwidth Mode Active'}
        </div>
      </motion.div>

      {/* Voice Status Banner */}
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: voiceEnabled ? 'auto' : 0, opacity: voiceEnabled ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="bg-cyan-950/50 border-b border-cyan-500/20 px-4 py-2 flex items-center justify-center backdrop-blur-md">
          <p className="text-xs font-mono text-cyan-400 flex items-center">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2 animate-pulse shadow-[0_0_5px_#22d3ee]"></span>
            Listening for "Emergency Help"
          </p>
        </div>
      </motion.div>

      <main className="flex-1 flex flex-col p-6 gap-6 relative z-10 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {uxMode === 'DEFAULT' && (
            <motion.div 
              key="default-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col gap-6"
            >
              {/* Secondary CTA - Interactive Card */}
              <TiltCard 
                onClick={() => navigate('/chat')}
                className="mt-4 border border-white/5 bg-linear-to-r from-slate-900/80 to-slate-800/80"
              >
                <div className="flex items-center justify-center space-x-3 text-slate-200">
                  <AlertTriangle className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                  <span className="font-sans font-bold tracking-wide uppercase text-sm">I witnessed an accident</span>
                </div>
              </TiltCard>

              {/* Live 3D SOS Core */}
              <div className="flex-1 flex flex-col items-center justify-center py-4">
                <LiveCore />
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full flex flex-col gap-4 mt-auto"
              >
                <h2 className="text-xs font-mono text-cyan-500 tracking-[0.2em] uppercase text-center flex items-center justify-center">
                  <span className="h-px bg-linear-to-r from-transparent to-cyan-500/50 flex-1 mr-4"></span>
                  Emergency Dispatch
                  <span className="h-px bg-linear-to-l from-transparent to-cyan-500/50 flex-1 ml-4"></span>
                </h2>
                <div className="grid grid-cols-2 gap-4 pb-20 md:pb-0">
                  {[
                    { icon: Hospital, label: 'Hospital', color: 'text-emergency', gradient: 'from-red-500/10 to-red-900/10' },
                    { icon: Activity, label: 'Ambulance', color: 'text-safe', gradient: 'from-emerald-500/10 to-emerald-900/10' },
                    { icon: Shield, label: 'Police', color: 'text-blue-400', gradient: 'from-blue-500/10 to-blue-900/10' },
                    { icon: Wrench, label: 'Towing', color: 'text-amber-400', gradient: 'from-amber-500/10 to-amber-900/10' },
                  ].map((service, i) => (
                    <TiltCard key={i} onClick={() => navigate('/map')}>
                      <div className={`flex flex-col items-center justify-center py-4 bg-linear-to-b ${service.gradient} rounded-xl`}>
                        <service.icon className={`${service.color} mb-3 drop-shadow-[0_0_8px_currentColor]`} size={32} />
                        <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-widest">{service.label}</span>
                      </div>
                    </TiltCard>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {uxMode === 'VOICE' && (
            <motion.div 
              key="voice-mode"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative w-48 h-48 border-4 border-cyan-400 rounded-full flex items-center justify-center">
                  <Mic size={64} className="text-cyan-400 animate-bounce" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white uppercase tracking-tighter italic">Voice Command Active</h2>
                <p className="text-cyan-400 font-mono animate-pulse">Say "Emergency Help" or "Call Ambulance"</p>
              </div>
              <button 
                onClick={() => setUxMode('DEFAULT')}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-full font-bold text-xs tracking-widest uppercase"
              >
                Switch to Touch UI
              </button>
            </motion.div>
          )}

          {isActive && (uxMode === 'EMERGENCY' || uxMode === 'COMMAND') && (
            <motion.div 
              key="active-mode"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 top-[72px] bg-slate-950 z-40 flex flex-col p-4 gap-4 overflow-hidden"
            >
              {/* Mode Switcher Overlay */}
              <div className="absolute top-4 right-4 z-50 flex space-x-2">
                 <button 
                  onClick={() => setUxMode(uxMode === 'EMERGENCY' ? 'COMMAND' : 'EMERGENCY')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-bold flex items-center space-x-2"
                 >
                   {uxMode === 'EMERGENCY' ? <Layout size={14} /> : <Maximize2 size={14} />}
                   <span>{uxMode === 'EMERGENCY' ? 'COMMAND MODE' : 'FOCUS MODE'}</span>
                 </button>
              </div>

              {/* EMERGENCY MODE (High Contrast) */}
              {uxMode === 'EMERGENCY' && (
                <div className="flex-1 flex flex-col bg-red-600 rounded-3xl overflow-hidden border-4 border-white">
                  <div className="p-8 text-white flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-6xl font-black italic uppercase leading-none tracking-tighter">EMERGENCY ACTIVE</h2>
                      <p className="text-2xl font-bold opacity-80 mt-4">HELP IS EN ROUTE</p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-white text-red-600 p-6 rounded-2xl shadow-2xl">
                        <div className="text-sm font-mono font-bold uppercase tracking-widest mb-2">ETA: Time to Help</div>
                        <div className="text-7xl font-black">04:12</div>
                        <div className="w-full h-4 bg-red-100 rounded-full mt-4 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '60%' }}
                            className="h-full bg-red-600"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <button className="bg-white/20 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center">
                          <MessageCircle size={32} />
                          <span className="font-bold mt-2">TALK TO AI</span>
                        </button>
                        <button className="bg-white/20 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center">
                          <UserCircle size={32} />
                          <span className="font-bold mt-2">MED PROFILE</span>
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => useSosStore.getState().cancelSos()} 
                      className="w-full py-6 bg-white text-red-600 font-black text-2xl rounded-2xl mt-4"
                    >
                      I AM SAFE
                    </button>
                  </div>
                </div>
              )}

              {/* COMMAND MODE (High Density Dashboard) */}
              {uxMode === 'COMMAND' && (
                <div className="flex-1 flex flex-col md:flex-row gap-4 h-full">
                  {/* Pane 1: Live Telemetry & Map */}
                  <div className="flex-1 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md overflow-hidden relative shadow-[0_0_30px_rgba(34,211,238,0.1)] flex flex-col">
                    <div className="bg-slate-900/80 border-b border-white/10 px-4 py-3 flex items-center justify-between z-10">
                      <div className="flex items-center space-x-2 text-cyan-400 font-mono text-sm">
                        <Radio size={16} className="animate-pulse" />
                        <span>LIVE TELEMETRY & MAP</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs">
                        <span className="flex items-center text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2"></div> GPS ACTIVE</span>
                      </div>
                    </div>
                    <div className="flex-1 relative">
                      <LiveMap />
                      {/* Floating metrics over map */}
                      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2 pointer-events-none">
                        <div className="bg-slate-950/80 backdrop-blur border border-white/10 p-2 rounded-lg">
                          <div className="text-[10px] text-slate-400 font-mono">LATITUDE</div>
                          <div className="text-sm text-cyan-400 font-mono">{useSosStore.getState().location?.lat.toFixed(4) || '--'}</div>
                        </div>
                        <div className="bg-slate-950/80 backdrop-blur border border-white/10 p-2 rounded-lg">
                          <div className="text-[10px] text-slate-400 font-mono">LONGITUDE</div>
                          <div className="text-sm text-cyan-400 font-mono">{useSosStore.getState().location?.lng.toFixed(4) || '--'}</div>
                        </div>
                        <div className="bg-slate-950/80 backdrop-blur border border-white/10 p-2 rounded-lg">
                          <div className="text-[10px] text-slate-400 font-mono">NEAREST RESPONDER</div>
                          <div className="text-sm text-amber-400 font-mono">2.4 km</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pane 2: AI Triage Assistant */}
                  <div className="flex-1 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.1)] flex flex-col">
                    <div className="bg-slate-900/80 border-b border-white/10 px-4 py-3 flex items-center space-x-2 text-purple-400 font-mono text-sm">
                      <ActivitySquare size={16} />
                      <span>AI TRIAGE ASSISTANT</span>
                    </div>
                    <div className="flex-1 overflow-auto relative">
                      <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-transparent to-slate-950/50 z-10" />
                      <TriageChat />
                    </div>
                  </div>

                  {/* Pane 3: Status & Operations Panel */}
                  <div className="w-full md:w-80 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md overflow-hidden flex flex-col">
                    <div className="bg-slate-900/80 border-b border-white/10 px-4 py-3 flex items-center justify-between text-slate-200 font-mono text-sm">
                      <div className="flex items-center space-x-2">
                        <ShieldCheck size={16} className="text-emerald-400" />
                        <span>OPERATIONS</span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
                      {/* Active SOS Status */}
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <h3 className="text-red-400 font-mono text-xs mb-2">CRITICAL INCIDENT ACTIVE</h3>
                        <div className="text-3xl font-bold text-white tracking-wider animate-pulse">00:04:12</div>
                        <div className="text-xs text-slate-400 mt-1">Elapsed Time</div>
                      </div>

                      {/* Dispatch Queue & Timeline */}
                      <div className="flex-1 overflow-y-auto pr-2">
                        <h3 className="text-slate-400 font-mono text-xs mb-3 flex justify-between">
                          <span>INCIDENT TIMELINE</span>
                          <span className="text-cyan-400">LIVE</span>
                        </h3>
                        
                        <div className="relative border-l border-white/20 ml-3 pl-4 space-y-6 pb-4">
                          {/* Timeline Item 1 */}
                          <div className="relative">
                            <div className="absolute top-8 left-[-21px] w-10 h-10 bg-black border border-white/10 rounded-full flex items-center justify-center z-10 shadow-[0_0_15px_rgba(239,68,68,0.3)]"></div>
                            <div className="text-xs text-slate-400 font-mono mb-1">00:00:00 (T+0)</div>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                              <div className="text-sm font-bold text-white">SOS Triggered</div>
                              <div className="text-xs text-slate-300 mt-1">Medical Profile: Type 2 Diabetes attached.</div>
                              <div className="mt-2 flex items-center">
                                 <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 flex items-center">
                                   <ShieldCheck size={10} className="mr-1"/> VERIFIED DEVICE
                                 </span>
                              </div>
                            </div>
                          </div>

                          {/* Timeline Item 2 */}
                          <div className="relative">
                            <div className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#A855F7]"></div>
                            <div className="text-xs text-slate-400 font-mono mb-1">00:01:15 (T+1m)</div>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                              <div className="text-sm font-bold text-white flex justify-between">
                                <span>AI Triage Completed</span>
                                <span className="text-purple-400 text-xs">CRITICAL</span>
                              </div>
                              <div className="text-xs text-slate-300 mt-1">Classified as multi-vehicle collision. Automated dispatch requested.</div>
                            </div>
                          </div>

                          {/* Timeline Item 3 (Responder) */}
                          <div className="relative">
                            <div className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#FBBF24]"></div>
                            <div className="text-xs text-slate-400 font-mono mb-1">00:03:10 (T+3m)</div>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                              <div className="text-sm font-bold text-white">Witness Report Added</div>
                              <div className="text-xs text-slate-300 mt-1">"Severe impact, one person trapped."</div>
                              <div className="mt-2 flex items-center justify-between">
                                 <span className="text-[10px] font-mono bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 flex items-center">
                                   ★ 4.8 TRUST SCORE
                                 </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => useSosStore.getState().cancelSos()} 
                        className="mt-auto w-full py-3 rounded-lg border-2 border-red-500/50 text-red-400 font-bold tracking-widest hover:bg-red-500/20 transition-all uppercase text-sm"
                      >
                        Resolve Incident
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSosStore, useServicesStore, useUIStore, useEmergencyStore } from '../store';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useWakeWord } from '../hooks/useWakeWord';
import { useNetworkMode } from '../hooks/useNetworkMode';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveCore } from '../components/LiveCore';
import { LiveMap } from './LiveMap'; 
import { TriageChat } from './TriageChat'; 
import { AgentWarRoom } from '../components/AgentWarRoom';
import { CrashPhotoAnalyzer } from '../components/CrashPhotoAnalyzer';
import { VoiceStressAnalyzer } from '../components/VoiceStressAnalyzer';
import { GoldenHourCountdown } from '../components/GoldenHourCountdown';
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
  MessageCircle,
  Zap,
  Camera,
  Heart,
  Navigation,
  Lock,
  Wifi,
  Cloud
} from 'lucide-react';
import { WeatherWidget } from '../components/WeatherWidget';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Panel } from '../components/ui/Panel';

export const Home = () => {
  const navigate = useNavigate();
  const { setLocation, isActive, triggerSos, location: userLocation } = useSosStore();
  const { setServices } = useServicesStore();
  const { isOffline, isLowBandwidth } = useNetworkMode();
  const { uxMode, setUxMode } = useUIStore();
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isWarRoomActive, setIsWarRoomActive] = useState(false);
  const [isVisionAnalyzerActive, setIsVisionAnalyzerActive] = useState(false);
  const [isVoiceAnalyzerActive, setIsVoiceAnalyzerActive] = useState(false);
  const { setGoldenHourActive, confirmDispatch, goldenHourActive } = useEmergencyStore();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-switch to Emergency mode
  useEffect(() => {
    if (isActive && uxMode === 'DEFAULT') {
      setUxMode('EMERGENCY');
    } else if (!isActive && uxMode === 'EMERGENCY') {
      setUxMode('DEFAULT');
    }
  }, [isActive, uxMode, setUxMode]);

  const handleWakeWord = useCallback((word: string) => {
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

  const fetchNearbyServices = useCallback(async (lat: number, lng: number) => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/services/nearby?lat=${lat}&lng=${lng}`);
      setServices(data);
    } catch {
      setServices([
        { name: 'AIIMS Delhi Trauma Centre', type: 'hospital', lat: 28.5672, lng: 77.2100, phone_primary: '011-26588500' },
        { name: 'Delhi Ambulance 102', type: 'ambulance', lat: 28.6139, lng: 77.2090, phone_primary: '102' }
      ]);
    }
  }, [setServices]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords.latitude, position.coords.longitude);
          fetchNearbyServices(position.coords.latitude, position.coords.longitude);
        },
        (locError) => {
           setLocation(28.6139, 77.2090);
           fetchNearbyServices(28.6139, 77.2090);
        },
        { enableHighAccuracy: true }
      );
    }
  }, [setLocation, fetchNearbyServices]);

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base)] text-[var(--nx-text-primary)] font-sans selection:bg-[var(--nx-red-primary)] selection:text-white">
      {/* Tactical Header */}
      <header className="h-16 px-6 border-b border-[var(--nx-border)] flex items-center justify-between sticky top-0 z-50 bg-[var(--nx-bg-base)]/80 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--nx-red-primary)] rounded-sm flex items-center justify-center shadow-[0_0_12px_rgba(255,59,59,0.4)]">
              <ShieldAlert size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tighter text-white leading-none">ROADSoS</h1>
              <p className="text-[10px] text-[var(--nx-text-tertiary)] uppercase tracking-widest mt-1">Tactical Core</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 border-l border-[var(--nx-border)] pl-8">
            <div className="flex flex-col">
              <span className="nexus-label">Status</span>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 bg-[var(--nx-green-primary)] rounded-full animate-pulse shadow-[0_0_6px_var(--nx-green-primary)]" />
                <span className="text-xs font-medium text-[var(--nx-green-primary)] uppercase">Active Node</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="nexus-label">Network</span>
              <span className="text-xs font-mono text-[var(--nx-text-secondary)] mt-0.5 flex items-center gap-1.5">
                <Wifi size={12} className="text-[var(--nx-blue-primary)]" />
                {isOffline ? 'OFFLINE' : 'MSR-RELAY: 47ms'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-mono text-white leading-none">{currentTime.toLocaleTimeString([], { hour12: false })}</div>
            <div className="text-[10px] text-[var(--nx-text-tertiary)] uppercase mt-1">{currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</div>
          </div>

          <Button 
            variant={voiceEnabled ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="gap-2"
          >
            {voiceEnabled ? <Mic size={14} className="animate-pulse" /> : <MicOff size={14} />}
            <span className="hidden sm:inline">{voiceEnabled ? 'LISTENING' : 'VOICE OFF'}</span>
          </Button>

          <div className="w-10 h-10 rounded-full border border-[var(--nx-border)] bg-[var(--nx-bg-surface)] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[var(--nx-border-active)] transition-colors">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=dispatcher" alt="Profile" className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </header>

      <main className="p-6 grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">
        <AnimatePresence mode="wait">
          {uxMode === 'DEFAULT' && (
            <>
              {/* Left Column - Tactical Feed */}
              <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                <Panel title="Network Integrity" icon={Radio} subtitle="Mesh status nodes">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--nx-text-secondary)]">Uplink Gateway</span>
                      <Badge variant="active">Nominal</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--nx-text-secondary)]">P2P Mesh Nodes</span>
                      <span className="text-xs font-mono text-white">482 Active</span>
                    </div>
                    <div className="w-full h-1 bg-[var(--nx-bg-overlay)] rounded-full overflow-hidden mt-2">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '85%' }}
                        className="h-full bg-[var(--nx-blue-primary)]"
                      />
                    </div>
                  </div>
                </Panel>

                <Panel title="Incident Radar" icon={Activity} subtitle="Regional activity">
                   <div className="space-y-3">
                     {[
                       { id: '102-B', type: 'Collision', time: '2m ago', severity: 'critical' },
                       { id: '449-A', type: 'Mechanical', time: '14m ago', severity: 'info' },
                       { id: '882-C', type: 'Medical', time: '22m ago', severity: 'warning' },
                     ].map((item) => (
                       <div key={item.id} className="p-2.5 rounded-md border border-[var(--nx-border)] bg-white/[0.01] hover:bg-white/[0.03] transition-colors cursor-pointer group">
                         <div className="flex items-center justify-between mb-1.5">
                           <span className="text-[10px] font-mono text-[var(--nx-text-tertiary)] uppercase">INC#{item.id}</span>
                           <span className="text-[10px] text-[var(--nx-text-dim)]">{item.time}</span>
                         </div>
                         <div className="flex items-center justify-between">
                           <span className="text-xs font-medium text-[var(--nx-text-secondary)] group-hover:text-white transition-colors">{item.type}</span>
                           <Badge variant={item.severity as any}>{item.severity}</Badge>
                         </div>
                       </div>
                     ))}
                   </div>
                </Panel>

                <div className="mt-auto">
                   <Panel title="Medical Profile" icon={Lock} subtitle="Secure encrypted vault">
                      <p className="text-[11px] text-[var(--nx-text-tertiary)] mb-4 leading-relaxed">
                        Your medical data is locally encrypted and only decrypted during an active SOS trigger for responders.
                      </p>
                      <Button variant="secondary" size="sm" className="w-full text-[10px]" onClick={() => navigate('/vault')}>
                        VIEW SECURE PROFILE
                      </Button>
                   </Panel>
                </div>
              </div>

              {/* Center Column - SOS Core */}
              <div className="col-span-12 lg:col-span-6 flex flex-col items-center justify-center min-h-[60vh] relative">
                {/* Visual Radar Rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-[300px] h-[300px] border border-[var(--nx-border)] rounded-full" />
                  <div className="absolute w-[500px] h-[500px] border border-[var(--nx-border)] rounded-full" />
                  <div className="absolute w-[700px] h-[700px] border border-[var(--nx-border)] rounded-full" />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                   <div className="mb-12 text-center">
                     <motion.div
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="flex items-center justify-center gap-3 mb-2"
                     >
                        <Badge variant="critical" className="animate-pulse">Emergency Ready</Badge>
                        <Badge variant="mesh">P2P Mesh Active</Badge>
                     </motion.div>
                     <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Mission Control</h2>
                     <p className="text-[11px] text-[var(--nx-text-tertiary)] tracking-[0.4em] uppercase mt-2">Global Incident Command</p>
                   </div>

                   <LiveCore />

                   <div className="mt-16 flex flex-col items-center gap-6">
                      <p className="text-[11px] text-[var(--nx-text-dim)] uppercase tracking-widest font-medium">Secondary Response Actions</p>
                      <div className="flex gap-4">
                        <Button 
                          variant="danger-outline" 
                          size="lg" 
                          className="w-56 gap-3 rounded-sm border-2"
                          onClick={() => navigate('/chat')}
                        >
                          <AlertTriangle size={20} />
                          REPORT INCIDENT
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="lg" 
                          className="w-56 gap-3 rounded-sm border-2"
                          onClick={() => navigate('/map')}
                        >
                          <Navigation size={20} />
                          VIEW LIVE MAP
                        </Button>
                      </div>
                   </div>
                </div>
              </div>

              {/* Right Column - Env & Systems */}
              <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                <Panel title="Atmospheric Data" icon={Cloud} subtitle="Local conditions">
                   {userLocation && (
                     <WeatherWidget lat={userLocation.lat} lng={userLocation.lng} />
                   )}
                </Panel>

                <Panel title="Regional Assets" icon={Shield} subtitle="Available units nearby">
                   <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Hospital, label: 'Trauma', count: 4, color: 'nx-red' },
                        { icon: Activity, label: 'Ambulance', count: 12, color: 'nx-green' },
                        { icon: Shield, label: 'Police', count: 8, color: 'nx-blue' },
                        { icon: Wrench, label: 'Roadside', count: 15, color: 'nx-amber' },
                      ].map((asset, i) => (
                        <div key={i} className="nexus-card p-3 flex flex-col items-center justify-center text-center">
                          <asset.icon size={20} className={`text-[var(--nx-${asset.color}-primary)] mb-2`} />
                          <span className="text-lg font-bold text-white leading-none">{asset.count}</span>
                          <span className="text-[9px] uppercase font-semibold text-[var(--nx-text-tertiary)] mt-1">{asset.label}</span>
                        </div>
                      ))}
                   </div>
                </Panel>

                <Panel title="AI Reasoning Core" icon={Zap} subtitle="Gemma-4 @ OpenRouter">
                   <div className="p-3 bg-white/[0.02] border border-[var(--nx-border)] rounded-md">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="ai">Thinking Online</Badge>
                        <span className="text-[10px] font-mono text-[var(--nx-text-dim)]">LATENCY: 142ms</span>
                      </div>
                      <p className="text-[10px] text-[var(--nx-text-secondary)] leading-relaxed italic">
                        "Continuously monitoring regional telemetry. No immediate threats detected in your primary geofence."
                      </p>
                   </div>
                   <Button variant="ghost" size="sm" className="w-full mt-2 text-[10px]" onClick={() => navigate('/prediction')}>
                     CRASH PREDICTION ENGINE →
                   </Button>
                </Panel>
              </div>
            </>
          )}

          {isActive && (uxMode === 'EMERGENCY' || uxMode === 'COMMAND') && (
            <motion.div 
              key="active-emergency"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="col-span-12 fixed inset-0 top-16 bg-[var(--nx-bg-base)] z-[100] flex flex-col p-6"
            >
              {/* Tactical Overlay Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="nexus-label">Response Level</span>
                    <Badge variant="critical" className="mt-1 text-sm py-1 px-3">LEVEL 5 CRITICAL</Badge>
                  </div>
                  <div className="flex flex-col">
                    <span className="nexus-label">Asset Dispatch</span>
                    <span className="text-sm font-mono text-white mt-1">UNIT-A12 / UNIT-A15</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="secondary" 
                    onClick={() => setUxMode(uxMode === 'EMERGENCY' ? 'COMMAND' : 'EMERGENCY')}
                    className="gap-2"
                  >
                    {uxMode === 'EMERGENCY' ? <Layout size={16} /> : <Maximize2 size={16} />}
                    {uxMode === 'EMERGENCY' ? 'OPERATIONS VIEW' : 'FOCUS VIEW'}
                  </Button>
                  <Button 
                    variant="primary" 
                    className="bg-[var(--nx-green-primary)] shadow-[0_0_16px_rgba(48,209,88,0.2)]"
                    onClick={() => useSosStore.getState().cancelSos()}
                  >
                    MARK RESOLVED
                  </Button>
                </div>
              </div>

              {/* High Contrast Emergency Focus */}
              {uxMode === 'EMERGENCY' && (
                <div className="flex-1 grid grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    <div className="flex-1 nexus-card border-[var(--nx-red-primary)] bg-[var(--nx-red-dim)] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                       <motion.div 
                        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-radial-gradient from-[var(--nx-red-primary)]/20 to-transparent"
                       />
                       <ShieldAlert size={120} className="text-[var(--nx-red-primary)] mb-8" />
                       <h2 className="text-7xl font-black italic text-white uppercase tracking-tighter leading-none mb-4">SOS ACTIVE</h2>
                       <p className="text-xl font-medium text-[var(--nx-red-primary)] uppercase tracking-widest">Responders are navigating to your location</p>
                       
                       <div className="mt-16 grid grid-cols-2 gap-8 w-full max-w-2xl">
                          <div className="nexus-card bg-black/40 p-6">
                            <span className="nexus-label">Estimated ETA</span>
                            <div className="text-5xl font-mono font-bold text-white mt-2">03:42</div>
                          </div>
                          <div className="nexus-card bg-black/40 p-6">
                            <span className="nexus-label">Distance</span>
                            <div className="text-5xl font-mono font-bold text-white mt-2">1.8 KM</div>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                    <Panel title="Triage Assistant" icon={ActivitySquare} subtitle="Live AI Analysis">
                      <div className="h-[400px] overflow-hidden flex flex-col">
                        <TriageChat />
                      </div>
                    </Panel>
                    <div className="grid grid-cols-2 gap-4">
                       <Button variant="secondary" className="h-24 flex-col gap-2" onClick={() => setIsVisionAnalyzerActive(true)}>
                         <Camera size={24} />
                         <span>PHOTO ANALYZER</span>
                       </Button>
                       <Button variant="secondary" className="h-24 flex-col gap-2" onClick={() => setIsVoiceAnalyzerActive(true)}>
                         <Activity size={24} />
                         <span>VOICE STRESS</span>
                       </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Command Center View */}
              {uxMode === 'COMMAND' && (
                <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
                  <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
                    <div className="flex-[2] nexus-card overflow-hidden relative">
                      <LiveMap />
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-6">
                       <Panel title="Incident Timeline" icon={Radio}>
                          <div className="space-y-4 text-[10px] font-mono">
                            <div className="flex gap-3 border-l border-[var(--nx-border)] pl-4 relative">
                              <div className="absolute left-[-4.5px] top-1 w-2 h-2 rounded-full bg-[var(--nx-red-primary)]" />
                              <div className="text-[var(--nx-text-tertiary)]">T+0</div>
                              <div className="text-white">SOS Triggered</div>
                            </div>
                            <div className="flex gap-3 border-l border-[var(--nx-border)] pl-4 relative opacity-60">
                              <div className="absolute left-[-4.5px] top-1 w-2 h-2 rounded-full bg-[var(--nx-amber-primary)]" />
                              <div className="text-[var(--nx-text-tertiary)]">T+1m</div>
                              <div className="text-white">AI Triage Completed</div>
                            </div>
                          </div>
                       </Panel>
                       <Panel title="Responder Telemetry" icon={Heart}>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-[var(--nx-text-secondary)] uppercase">Vitals</span>
                              <Badge variant="active">Stable</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-[var(--nx-text-secondary)] uppercase">Heart Rate</span>
                              <span className="text-sm font-mono text-white">82 BPM</span>
                            </div>
                          </div>
                       </Panel>
                       <Panel title="AI Insights" icon={Zap}>
                          <p className="text-[10px] leading-relaxed text-[var(--nx-text-secondary)] italic">
                            "Pattern matching suggests high-velocity impact. Pre-alerting Trauma Level 1 center at AIIMS."
                          </p>
                       </Panel>
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 h-full">
                    <Panel title="Agent War Room" icon={Zap} className="flex-1">
                      <div className="h-full overflow-hidden flex flex-col">
                        <AgentWarRoom onComplete={() => {}} />
                      </div>
                    </Panel>
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="w-full h-16 text-sm tracking-[0.2em]"
                      onClick={() => setIsWarRoomActive(true)}
                    >
                      EXPAND WAR ROOM
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Modal Overlays (Same as before but wrapped in cinematic styles) */}
        <AnimatePresence>
          {isWarRoomActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-[var(--nx-bg-base)]/95 backdrop-blur-3xl flex items-center justify-center p-6"
            >
              <div className="w-full h-full max-w-7xl relative nexus-card border-[var(--nx-border-active)] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
                <div className="h-12 border-b border-[var(--nx-border)] px-6 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-[var(--nx-purple-primary)]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-white">Neural Consensus War Room</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsWarRoomActive(false)}>CLOSE [ESC]</Button>
                </div>
                <div className="flex-1 p-6 overflow-hidden">
                  <AgentWarRoom onComplete={() => {}} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <GoldenHourCountdown />
    </div>
  );
};

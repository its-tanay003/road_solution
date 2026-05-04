import { useEffect, useState, useCallback } from 'react';
import { useSosStore, useUIStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { useWakeWord } from '../hooks/useWakeWord';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveCore } from '../components/LiveCore';
import { LiveMap } from './LiveMap'; 
import { TriageChat } from './TriageChat'; 
import { AgentWarRoom } from '../components/AgentWarRoom';
import { CrashPhotoAnalyzer } from '../components/CrashPhotoAnalyzer';
import { VoiceStressAnalyzer } from '../components/VoiceStressAnalyzer';
import { GoldenHourCountdown } from '../components/GoldenHourCountdown';
import { HospitalCapacityDashboard } from '../components/HospitalCapacityDashboard';
import { NearbyServicesPanel } from '../components/NearbyServicesPanel';
import { OneTabEmergencyCall } from '../components/OneTabEmergencyCall';
import { AmbulanceTracker } from '../components/AmbulanceTracker';
import { GlobalServiceMode } from '../components/GlobalServiceMode';
import { BystanderMode } from '../components/BystanderMode';
import { DataAccuracyDashboard } from '../components/DataAccuracyDashboard';
import { EmergencyButton } from '../components/EmergencyButton';
import { PanicModeOverlay } from '../components/PanicModeOverlay';
import { 
  Eye,
  Radio, 
  Layout, 
  Zap,
  ActivitySquare,
  ShieldCheck,
  X,
  MessageCircle,
  Share2
} from 'lucide-react';
import { NotificationBell } from '../components/NotificationBell';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Panel } from '../components/ui/Panel';

export const Home = () => {
  const navigate = useNavigate();
  const { isActive, triggerSos } = useSosStore();
  const { uxMode, setUxMode } = useUIStore();
  const [voiceEnabled] = useState(false);
  const [isWarRoomActive, setIsWarRoomActive] = useState(false);
  const [showHospitalDashboard, setShowHospitalDashboard] = useState(false);
  const [showAccuracyDashboard, setShowAccuracyDashboard] = useState(false);

  // Auto-switch to Emergency mode
  useEffect(() => {
    if (isActive && uxMode === 'DEFAULT') {
      setUxMode('EMERGENCY');
    } else if (!isActive && uxMode === 'EMERGENCY') {
      setUxMode('DEFAULT');
    }
  }, [isActive, uxMode, setUxMode]);

  const handleWakeWord = useCallback(() => {
    triggerSos();
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, [triggerSos]);

  const { isListening, startListening } = useWakeWord(['Nexus', 'Help', 'SOS'], handleWakeWord);

  useEffect(() => {
    if (voiceEnabled && !isListening) {
      startListening();
    }
  }, [voiceEnabled, isListening, startListening]);

  return (
    <>
      <div className="relative h-full flex flex-col overflow-hidden">
        {/* Tactical Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-nx-border bg-nx-bg-surface/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Radio className="text-nx-red-primary animate-pulse" size={20} />
              <h1 className="text-lg font-black tracking-tighter text-white uppercase italic">Nexus Alpha</h1>
            </div>
            <div className="h-4 w-px bg-nx-border" />
            <div className="flex items-center gap-3">
              <Badge variant={isActive ? "critical" : "active"} className="animate-pulse">
                {isActive ? "LIVE EMERGENCY" : "SYSTEM ONLINE"}
              </Badge>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-white/5 border border-nx-border">
                <div className="w-1.5 h-1.5 rounded-full bg-nx-blue-primary animate-pulse" />
                <span className="text-[10px] font-bold text-nx-text-tertiary uppercase tracking-widest">Grid Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <GlobalServiceMode />
             <div className="flex gap-2">
                <button 
                  title="Share SOS via WhatsApp"
                  className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-all"
                >
                  <MessageCircle size={16} />
                </button>
                <button 
                  title="Share Emergency Contacts"
                  className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition-all"
                >
                  <Share2 size={16} />
                </button>
             </div>
             <NotificationBell />
             <button title="USER PROFILE" className="nexus-card p-2 bg-white/5 border-nx-border hover:bg-white/10 transition-all group" onClick={() => navigate('/profile')}>
                <div className="w-5 h-5 rounded-full bg-nx-blue-primary/20 flex items-center justify-center">
                  <span className="text-[10px] font-black text-nx-blue-primary">TT</span>
                </div>
             </button>
          </div>
        </header>

        <main className="p-6 grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            {isActive ? (
              <motion.div 
                key="emergency"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="col-span-12 grid grid-cols-12 gap-6"
              >
                {/* Emergency View: Central Hub */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                  <OneTabEmergencyCall />
                  <AmbulanceTracker />
                  <GoldenHourCountdown />
                  <TriageChat />
                </div>
                
                {/* Emergency Sidebars */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  <HospitalCapacityDashboard onClose={() => setShowHospitalDashboard(false)} />
                  <CrashPhotoAnalyzer />
                  <VoiceStressAnalyzer />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="default"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="col-span-12 grid grid-cols-12 gap-6"
              >
                {/* Default Tactical View */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                  {/* Emergency Launchpad */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Panel className="flex items-center justify-center min-h-[300px]">
                      <EmergencyButton />
                    </Panel>

                    <button 
                      onClick={() => setUxMode('BYSTANDER')}
                      title="Witness Protocol: I witnessed an accident"
                      className="group relative overflow-hidden bg-amber-500 hover:bg-amber-600 p-8 rounded-4xl border-2 border-amber-400/50 transition-all active:scale-95 shadow-2xl shadow-amber-500/20 h-full"
                    >
                      <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
                      <Eye size={48} className="text-white mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2">I witnessed an accident</h3>
                      <p className="text-amber-100/70 text-sm font-bold uppercase tracking-widest">Bystander Protocol</p>
                    </button>
                  </div>

                  <LiveMap />
                </div>
                
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  <LiveCore />
                  
                  {/* Quick Actions Panel */}
                  <Panel className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-black tracking-widest text-nx-text-tertiary uppercase">Tactical Overlays</h3>
                      <Layout size={14} className="text-nx-text-tertiary" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="secondary" size="sm" onClick={() => setIsWarRoomActive(!isWarRoomActive)} className={isWarRoomActive ? 'border-nx-blue-primary bg-nx-blue-dim' : ''}>
                        <Zap size={14} className="mr-2" />
                        War Room
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setShowHospitalDashboard(!showHospitalDashboard)} className={showHospitalDashboard ? 'border-nx-blue-primary bg-nx-blue-dim' : ''}>
                        <ActivitySquare size={14} className="mr-2" />
                        Hospitals
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setShowAccuracyDashboard(!showAccuracyDashboard)} className={showAccuracyDashboard ? 'border-nx-blue-primary bg-nx-blue-dim' : 'col-span-2'}>
                        <ShieldCheck size={14} className="mr-2" />
                        Data Reliability
                      </Button>
                    </div>
                  </Panel>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {uxMode === 'BYSTANDER' && <BystanderMode />}
        {uxMode === 'PANIC' && <PanicModeOverlay />}
      </AnimatePresence>

      {/* Persistent Modals */}
      <AnimatePresence>
        {isWarRoomActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-nx-bg-base/80 backdrop-blur-sm">
            <div className="w-full h-full max-w-6xl max-h-[800px] relative">
              <button onClick={() => setIsWarRoomActive(false)} className="absolute -top-12 right-0 text-white flex items-center gap-2 hover:text-nx-red-primary transition-colors font-bold uppercase tracking-widest text-xs">
                Close Tactical View <X size={16} />
              </button>
              <AgentWarRoom />
            </div>
          </motion.div>
        )}

        {showHospitalDashboard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-nx-bg-base/90 backdrop-blur-md">
            <div className="w-full h-full max-w-5xl max-h-[90vh] relative overflow-y-auto bg-slate-950 rounded-[2.5rem] border border-white/10 p-8 shadow-2xl nexus-scrollbar">
              <button 
                onClick={() => setShowHospitalDashboard(false)} 
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
                aria-label="Close Tactical Services Hub"
              >
                <X size={24} />
              </button>
              <div className="mb-8">
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Tactical Services Hub</h1>
                <p className="text-slate-500 text-sm">Real-time verification of local response infrastructure via Google Places API.</p>
              </div>
              <NearbyServicesPanel />
            </div>
          </motion.div>
        )}

        {showAccuracyDashboard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-nx-bg-base/90 backdrop-blur-md">
            <div className="w-full h-full max-w-5xl max-h-[90vh] relative overflow-y-auto bg-slate-950 rounded-[2.5rem] border border-white/10 p-8 shadow-2xl nexus-scrollbar">
              <button 
                onClick={() => setShowAccuracyDashboard(false)} 
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
                aria-label="Close Data Reliability Dashboard"
              >
                <X size={24} />
              </button>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="text-nx-blue-primary" size={32} />
                  <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Data Reliability Center</h1>
                </div>
                <p className="text-slate-500 text-sm">Real-time verification of ROADSoS data sources and accuracy audit trails.</p>
              </div>
              <DataAccuracyDashboard />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

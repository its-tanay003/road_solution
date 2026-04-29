import { useEffect, useState, useCallback } from 'react';
import { useSosStore, useServicesStore } from '../store';
import { ShieldAlert, AlertTriangle, Hospital, Shield, Wrench, Activity, Mic, MicOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useWakeWord } from '../hooks/useWakeWord';
import { motion } from 'framer-motion';
import { LiveCore } from '../components/LiveCore';
import { TiltCard } from '../components/TiltCard';

export const Home = () => {
  const navigate = useNavigate();
  const { setLocation, isActive, triggerSos } = useSosStore();
  const { setServices } = useServicesStore();
  const [voiceEnabled, setVoiceEnabled] = useState(false);

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
          onClick={() => setVoiceEnabled(!voiceEnabled)}
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
        
        {!isActive && (
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
            <div className="grid grid-cols-2 gap-4">
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
        )}
      </main>
    </div>
  );
};

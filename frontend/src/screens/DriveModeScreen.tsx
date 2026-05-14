import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Shield, Navigation, Phone, X, AlertCircle } from 'lucide-react';
import { useDriveModeStore } from '../store/driveModeStore';
import { useSensors } from '../hooks/useSensors';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

export const DriveModeScreen: React.FC = () => {
  const { limit, setActive, setSpeed } = useDriveModeStore();
  const [activeCommand, setActiveCommand] = useState<string | null>(null);

  // 1. Hook into real sensors
  const { speed, isImpactDetected } = useSensors(() => {
    // Handle impact detection (e.g., auto-trigger SOS)
    setActiveCommand("CRASH DETECTED! TRIGGERING SOS...");
  });

  // Sync store speed with sensor speed
  useEffect(() => {
    if (speed !== null) setSpeed(speed);
  }, [speed, setSpeed]);

  // 2. Hook into voice recognition
  const { isListening, start, stop, transcript } = useVoiceRecognition((command) => {
    if (command.includes('call home')) {
      setActiveCommand("Calling Home...");
      // window.location.href = "tel:YOUR_EMERGENCY_CONTACT";
    } else if (command.includes('find hospital') || command.includes('navigate hospital')) {
      setActiveCommand("Finding nearest hospital...");
      window.open(`https://www.google.com/maps/search/hospital+near+me`);
    } else if (command.includes('trigger sos') || command.includes('emergency')) {
      setActiveCommand("TRIGGERING EMERGENCY SOS!");
      // Logic to trigger SOS
    }
    
    // Clear command visual after 3 seconds
    setTimeout(() => setActiveCommand(null), 3000);
  });

  const overspeed = speed !== null && speed > limit;

  return (
    <div className={`fixed inset-0 z-300 transition-colors duration-700 flex flex-col ${overspeed ? 'bg-red-950' : 'bg-[#080C14]'}`}>
      {/* Top Header */}
      <div className="flex justify-between items-center px-8 pt-12">
        <div className="flex items-center gap-3">
          <Shield className={overspeed ? 'text-red-500' : 'text-amber-400'} size={24} />
          <span className="text-white/40 font-black tracking-widest uppercase text-xs">Drive Safely Mode</span>
        </div>
        <button onClick={() => setActive(false)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
          <X className="text-white/40" />
        </button>
      </div>

      {/* Speedometer */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="relative flex flex-col items-center">
          <span className={`text-[160px] font-black leading-none tracking-tighter transition-colors ${overspeed ? 'text-red-500' : 'text-white'}`}>
            {speed ?? 0}
          </span>
          <span className="text-white/20 font-bold text-xl uppercase tracking-widest mt-[-20px]">KM/H</span>
          
          <AnimatePresence>
            {overspeed && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                className="mt-8 flex items-center gap-2 px-6 py-3 bg-red-500 rounded-full text-white font-black animate-bounce shadow-lg shadow-red-500/20">
                <AlertCircle size={20} /> SLOW DOWN
              </motion.div>
            )}
            
            {activeCommand && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                className="mt-8 px-6 py-3 bg-amber-400 rounded-2xl text-black font-black uppercase tracking-wider shadow-xl">
                {activeCommand}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Voice Assistant Visualizer */}
      <div className="px-8 pb-12 flex flex-col items-center gap-8">
        <div className="flex gap-1 items-center h-12">
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} animate={{ height: isListening ? [10, 40, 10] : 8 }}
              transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
              className={`w-1.5 rounded-full ${overspeed ? 'bg-red-500/40' : 'bg-amber-400/40'}`} />
          ))}
        </div>

        <button onClick={() => isListening ? stop() : start()}
          className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all ${isListening ? 'bg-amber-400 scale-110 shadow-amber-400/20' : 'bg-white/10'}`}>
          <Mic size={40} className={isListening ? 'text-black' : 'text-white'} />
        </button>
        
        <p className="text-white/60 font-medium text-center h-12">
          {isListening ? (transcript || "Listening...") : "Tap to use Voice Command"}
        </p>

        {/* Quick Access Icons */}
        <div className="grid grid-cols-3 gap-6 w-full mt-4">
          <button onClick={() => window.open('https://www.google.com/maps')} className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
              <Navigation size={28} />
            </div>
            <span className="text-[10px] text-white/30 font-bold uppercase">Navigation</span>
          </button>
          <button className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
              <Phone size={28} />
            </div>
            <span className="text-[10px] text-white/30 font-bold uppercase">Contacts</span>
          </button>
          <button className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
              <Shield size={28} />
            </div>
            <span className="text-[10px] text-red-500/60 font-bold uppercase">SOS</span>
          </button>
        </div>
      </div>
    </div>
  );
};


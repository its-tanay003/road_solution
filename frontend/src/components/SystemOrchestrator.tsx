import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, Play, Pause, X, Camera, Info, 
  Command, Layout, Terminal, CloudOff, Keyboard
} from 'lucide-react';
import { useDemoStore } from '../store';

export const SystemOrchestrator = () => {
  const { 
    playbackSpeed, setSpeed, 
    isPaused, togglePause,
    showShortcuts, toggleShortcuts,
    isScreenshotMode, toggleScreenshot: toggleStoreScreenshot
  } = useDemoStore();

  const [internetKilled, setInternetKilled] = useState(false);

  const killInternet = useCallback(() => {
    setInternetKilled(true);
    setTimeout(() => setInternetKilled(false), 3000);
  }, []);

  const toggleScreenshot = useCallback(() => {
    toggleStoreScreenshot();
    document.body.classList.toggle('screenshot-mode');
  }, [toggleStoreScreenshot]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'p') togglePause();
      if (e.key.toLowerCase() === 's') toggleShortcuts();
      if (e.key.toLowerCase() === '0') killInternet();
      if (e.key === '\\') toggleScreenshot();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause, toggleShortcuts, killInternet, toggleScreenshot]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="relative group">
        <div className="absolute inset-0 bg-cyan/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#080C14]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-1 shadow-2xl"
        >
          <button 
            onClick={() => toggleShortcuts()} 
            className="p-2 rounded-xl hover:bg-white/5 text-[#FF9933] transition-all"
            title="Administrator Protocol (Shift+P)"
          >
            <Monitor size={18} />
          </button>
          
          <div className="w-px h-6 bg-white/10 mx-1" />

          <button 
            onClick={togglePause} 
            className="p-2 rounded-xl hover:bg-white/5 text-white transition-all"
            title={isPaused ? "Resume (P)" : "Pause (P)"}
          >
            {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
          </button>

          <div className="flex bg-white/5 rounded-xl p-1">
            {[0.5, 1, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => setSpeed(speed)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  playbackSpeed === speed ? 'bg-[#FF9933] text-[#080C14]' : 'text-white/40 hover:text-white'
                }`}
                title={`Set speed to ${speed}x`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <button 
            onClick={killInternet} 
            className={`p-2 rounded-xl transition-all ${internetKilled ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-white/5 text-white/40'}`}
            title="Kill Internet Connectivity (0)"
          >
            <CloudOff size={18} />
          </button>

          <button onClick={toggleScreenshot} className={`p-2 rounded-xl transition-all ${isScreenshotMode ? 'bg-cyan text-night' : 'hover:bg-white/5 text-white/40'}`} title="Screenshot Mode (\)">
            <Camera size={18} />
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showShortcuts && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#080C14]/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => toggleShortcuts()}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#080C14] border border-white/10 rounded-[2.5rem] p-10 max-w-lg w-full relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#FF9933]/50 to-transparent" />
              
              <button 
                onClick={() => toggleShortcuts()}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all"
                title="Close Protocol Menu"
                aria-label="Close Protocol Menu"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#FF9933]/20 flex items-center justify-center text-[#FF9933]">
                  <Monitor size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Operational Controls</h2>
                  <p className="text-[10px] font-mono text-[#FF9933] uppercase tracking-widest">Administrator Protocol v4.0</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'P', label: 'Pause/Resume', icon: Play },
                  { key: 'S', label: 'Shortcuts', icon: Keyboard },
                  { key: '0', label: 'Kill Net', icon: CloudOff },
                  { key: '\\', label: 'Screenshot', icon: Camera },
                  { key: 'I', label: 'System Info', icon: Info },
                  { key: 'C', label: 'Command', icon: Command },
                  { key: 'L', label: 'Layout', icon: Layout },
                  { key: 'T', label: 'Terminal', icon: Terminal },
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                      <item.icon size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                      <span className="text-sm font-black text-white">{item.key}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,153,51,0.05)_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />
              
              <p className="mt-8 text-[9px] text-center text-white/20 uppercase tracking-[0.2em]">
                Exclusively for National Road Safety Network
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemOrchestrator;

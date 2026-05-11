import React from 'react';
import { useAccessibilityStore } from '../store/accessibilityStore';
import { Eye, Smartphone, MessageSquare, VolumeX } from 'lucide-react';
import { buttonAria } from '../utils/aria-utils';

export const DeafModePanel: React.FC = () => {
  const { 
    deafMode, 
    setDeafMode, 
    hapticEnabled, 
    setHapticEnabled,
    setTtsEnabled,
    soundMonitorActive 
  } = useAccessibilityStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${deafMode ? 'bg-(--clr-blue)/20 text-(--clr-blue)' : 'bg-white/5 text-white/40'}`}>
            <VolumeX size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold">Deaf Mode</h3>
              {soundMonitorActive && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] bg-cyan-500/20 text-cyan-400 font-black uppercase tracking-tighter animate-pulse border border-cyan-500/30">
                  Live
                </span>
              )}
            </div>
            <p className="text-xs text-white/40">Visual-only mode (No audio/TTS)</p>
          </div>
        </div>
        <button 
          onClick={() => {
            setDeafMode(!deafMode);
            if (!deafMode) setTtsEnabled(false);
          }}
          className={`w-12 h-6 rounded-full relative transition-colors ${deafMode ? 'bg-(--clr-blue)' : 'bg-white/10'}`}
          {...buttonAria("Toggle Deaf Mode", deafMode)}
          title="Toggle Deaf Mode"
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${deafMode ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      {deafMode && (
        <div className="animate-in slide-in-from-top-4 duration-500 space-y-4 ml-4 pl-4 border-l-2 border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye size={18} className="text-white/40" />
              <span className="text-sm">Visual Alerts (Flashes)</span>
            </div>
            <span className="text-[10px] font-mono text-(--clr-blue) uppercase">Always On</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone size={18} className="text-white/40" />
              <span className="text-sm">Haptic Patterns</span>
            </div>
            <button 
              onClick={() => setHapticEnabled(!hapticEnabled)}
              className={`w-10 h-5 rounded-full relative transition-colors ${hapticEnabled ? 'bg-(--clr-blue)' : 'bg-white/10'}`}
              {...buttonAria("Toggle Haptic Vibration Patterns", hapticEnabled)}
              title="Toggle Haptic Feedback"
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${hapticEnabled ? 'left-5.5' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <MessageSquare size={16} className="text-blue-400" />
            <p className="text-[10px] text-blue-300 leading-relaxed">
              When Deaf Mode is active, all heartbeats, countdowns, and AI speech will be replaced by screen pulses and text overlays.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

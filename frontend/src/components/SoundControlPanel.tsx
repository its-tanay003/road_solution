import React, { useCallback } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Music, 
  Play, 
  Settings2, 
  Cpu,
  Waves
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSoundEffects, useSoundStore } from '../hooks/useSoundEffects';
import type { SoundType } from '../hooks/useSoundEffects';

const SOUND_PREVIEWS: { type: SoundType; label: string; desc: string; color: string }[] = [
  { type: 'SOS_TRIGGER', label: 'SOS Trigger', desc: 'Ascending Triple Beep', color: 'red' },
  { type: 'DISPATCH_CONFIRMED', label: 'Dispatch Order', desc: 'Warm Major Chord', color: 'emerald' },
  { type: 'MESH_MODE_ACTIVE', label: 'Mesh Relay', desc: 'Descending Warble', color: 'amber' },
  { type: 'AI_THINKING', label: 'AI Synthesis', desc: 'High-Freq 8Hz Clicks', color: 'purple' },
  { type: 'ALERT_CRITICAL', label: 'Critical Alert', desc: 'Sharp Warning Pulse', color: 'orange' },
  { type: 'COUNTDOWN_TICK', label: 'Consciousness Tick', desc: 'Soft Precision Click', color: 'blue' },
  { type: 'GOLDEN_HOUR_WARNING', label: 'Survival Warning', desc: 'Low-Freq Resonance', color: 'rose' },
];

export const SoundControlPanel: React.FC = () => {
  const { playSound, initAudio: triggerInit } = useSoundEffects();
  const { masterVolume, setMasterVolume, isMuted, setIsMuted } = useSoundStore();

  const handlePreview = useCallback((type: SoundType) => {
    triggerInit(); // Ensure context is active
    playSound(type);
  }, [triggerInit, playSound]);

  return (
    <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center font-sans">
      <div className="max-w-4xl w-full space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-[var(--radius-lg)]">
                <Music className="text-indigo-400 w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Sound Design</h1>
            </div>
            <p className="text-slate-500 text-sm font-medium mt-2">
              Synthesized Auditory Feedback System via <span className="text-white">Web Audio API</span>.
            </p>
          </div>
          
          <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-xl transition-all ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <div className="flex flex-col gap-1 w-32">
                <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
                  <label htmlFor="master-volume">Master Volume</label>
                  <span>{Math.round(masterVolume * 100)}%</span>
                </div>
                <input 
                  id="master-volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-[var(--radius-lg)] appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sound Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOUND_PREVIEWS.map((sound) => (
            <motion.div 
              key={sound.type}
              whileHover={{ scale: 1.01 }}
              className="group bg-slate-900/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-6 hover:border-white/10 transition-all shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-${sound.color}-500/10 flex items-center justify-center border border-${sound.color}-500/20`}>
                  <Waves className={`text-${sound.color}-400 w-6 h-6`} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">{sound.label}</h3>
                  <p className="text-[10px] text-slate-500 font-medium">{sound.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Static Waveform Representation */}
                <svg width="60" height="24" className="opacity-20 group-hover:opacity-100 transition-opacity">
                  <path 
                    d={`M 0 12 ${Array.from({ length: 6 }).map((_, i) => 
                      `Q ${i * 10 + 5} ${i % 2 === 0 ? 0 : 24} ${i * 10 + 10} 12`
                    ).join(' ')}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`text-${sound.color}-400`}
                  />
                </svg>

                <button 
                  title={`Preview ${sound.label}`}
                  onClick={() => handlePreview(sound.type)}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all active:scale-95 border border-white/5"
                >
                  <Play size={16} fill="currentColor" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Technical Footer */}
        <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[2rem] space-y-6">
          <div className="flex items-center gap-3">
            <Settings2 className="text-indigo-400 w-5 h-5" />
            <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Synthesis Engine Logic</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Oscillator Types</div>
              <div className="flex gap-2">
                {['Sine', 'Square', 'Triangle', 'Sawtooth'].map(type => (
                  <span key={type} className="px-2 py-1 bg-slate-950 border border-white/5 rounded text-[8px] font-bold text-slate-300 uppercase tracking-tighter">
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Envelope Control</div>
              <div className="text-[10px] font-medium text-slate-400 italic">
                Using linearRampToValueAtTime for millisecond-perfect ADSR curves.
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
              <Cpu size={12} className="text-indigo-400" />
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest italic">
                Sound Design by Web Audio API — No external files
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-600">Context: SampleRate @ 44.1kHz</span>
          </div>
        </div>

      </div>
    </div>
  );
};

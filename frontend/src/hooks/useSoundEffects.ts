import { useCallback, useRef } from 'react';
import { create } from 'zustand';

interface SoundStore {
  masterVolume: number;
  isMuted: boolean;
  setMasterVolume: (v: number) => void;
  setIsMuted: (m: boolean) => void;
}

export const useSoundStore = create<SoundStore>((set) => ({
  masterVolume: 0.5,
  isMuted: false,
  setMasterVolume: (v) => set({ masterVolume: v }),
  setIsMuted: (m) => set({ isMuted: m }),
}));

export type SoundType = 
  | 'SOS_TRIGGER' 
  | 'DISPATCH_CONFIRMED' 
  | 'MESH_MODE_ACTIVE' 
  | 'AI_THINKING' 
  | 'ALERT_CRITICAL' 
  | 'COUNTDOWN_TICK' 
  | 'GOLDEN_HOUR_WARNING';

export const useSoundEffects = () => {
  const { masterVolume, isMuted } = useSoundStore();
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (isMuted) return;
    const ctx = initAudio();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.value = masterVolume;
    masterGain.connect(ctx.destination);

    switch (type) {
      case 'SOS_TRIGGER': {
        const freqs = [440, 550, 660];
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.25);
          g.gain.setValueAtTime(0, now + i * 0.25);
          g.gain.linearRampToValueAtTime(0.5, now + i * 0.25 + 0.05);
          g.gain.linearRampToValueAtTime(0, now + i * 0.25 + 0.2);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(now + i * 0.25);
          osc.stop(now + i * 0.25 + 0.2);
        });
        break;
      }

      case 'DISPATCH_CONFIRMED': {
        const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
        freqs.forEach(f => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now);
          g.gain.setValueAtTime(0, now);
          g.gain.linearRampToValueAtTime(0.2, now + 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.8);
        });
        break;
      }

      case 'MESH_MODE_ACTIVE': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.8);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.3, now + 0.1);
        g.gain.linearRampToValueAtTime(0, now + 0.8);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.8);
        break;
      }

      case 'AI_THINKING': {
        // High frequency "clicks"
        for (let i = 0; i < 8; i++) {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(2000 + Math.random() * 1000, now + i * 0.125);
          g.gain.setValueAtTime(0, now + i * 0.125);
          g.gain.linearRampToValueAtTime(0.05, now + i * 0.125 + 0.01);
          g.gain.linearRampToValueAtTime(0, now + i * 0.125 + 0.02);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(now + i * 0.125);
          osc.stop(now + i * 0.125 + 0.03);
        }
        break;
      }

      case 'ALERT_CRITICAL': {
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now + i * 0.2);
          g.gain.setValueAtTime(0, now + i * 0.2);
          g.gain.linearRampToValueAtTime(0.6, now + i * 0.2 + 0.02);
          g.gain.linearRampToValueAtTime(0, now + i * 0.2 + 0.15);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(now + i * 0.2);
          osc.stop(now + i * 0.2 + 0.2);
        }
        break;
      }

      case 'COUNTDOWN_TICK': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(261.63, now); // C4
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.2, now + 0.01);
        g.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case 'GOLDEN_HOUR_WARNING': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.4, now + 0.1);
        g.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }
    }
  }, [masterVolume, isMuted, initAudio]);

  return { playSound, initAudio };
};

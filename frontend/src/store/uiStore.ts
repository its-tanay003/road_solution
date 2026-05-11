import { create } from 'zustand';

export type UXMode = 'DEFAULT' | 'COMMAND' | 'EMERGENCY' | 'VOICE' | 'BYSTANDER' | 'PANIC';

interface UIState {
  isStressed: boolean;
  setStressed: (stressed: boolean) => void;
  uxMode: UXMode;
  setUxMode: (mode: UXMode) => void;
  isCrackedScreen: boolean;
  setCrackedScreen: (isCracked: boolean) => void;
  isGloveMode: boolean;
  setGloveMode: (isGlove: boolean) => void;
  panicScore: number;
  setPanicScore: (score: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isStressed: false,
  setStressed: (stressed) => set({ isStressed: stressed }),
  uxMode: 'DEFAULT',
  setUxMode: (mode) => set({ uxMode: mode }),
  panicScore: 0,
  setPanicScore: (score) => set({ panicScore: score }),
  isCrackedScreen: false,
  setCrackedScreen: (val) => set({ isCrackedScreen: val }),
  isGloveMode: false,
  setGloveMode: (val) => set({ isGloveMode: val }),
}));

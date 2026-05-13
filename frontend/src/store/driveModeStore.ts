import { create } from 'zustand';

interface DriveModeState {
  isActive: boolean;
  speed: number;
  limit: number;
  setSpeed: (speed: number) => void;
  setActive: (isActive: boolean) => void;
  toggle: () => void;
}

export const useDriveModeStore = create<DriveModeState>((set) => ({
  isActive: false,
  speed: 0,
  limit: 80,
  setSpeed: (speed) => set({ speed }),
  setActive: (isActive) => set({ isActive }),
  toggle: () => set((state) => ({ isActive: !state.isActive })),
}));

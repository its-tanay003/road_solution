import { create } from 'zustand';

interface AutomotiveState {
  isAutomotive: boolean;
  setAutomotive: (active: boolean) => void;
}

export const useAutomotiveStore = create<AutomotiveState>((set) => ({
  isAutomotive: false,
  setAutomotive: (isAutomotive) => set({ isAutomotive }),
}));

import { create } from 'zustand';

interface NetworkState {
  isLowBandwidth: boolean;
  isMeshMode: boolean;
  setLowBandwidth: (isLow: boolean) => void;
  setMeshMode: (isMesh: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isLowBandwidth: false,
  isMeshMode: false,
  setLowBandwidth: (isLow) => set({ isLowBandwidth: isLow }),
  setMeshMode: (isMesh) => set({ isMeshMode: isMesh })
}));

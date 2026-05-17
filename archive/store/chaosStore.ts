import { create } from 'zustand';

export interface ChaosLog {
  id: string;
  message: string;
  timestamp: Date;
  type: 'FAIL' | 'RECOVERY' | 'INFO';
}

interface ChaosState {
  internetKilled: boolean;
  backendKilled: boolean;
  latencyMs: number;
  gpsCorrupted: boolean;
  logs: ChaosLog[];
  killInternet: () => void;
  killBackend: () => void;
  setLatency: (ms: number) => void;
  corruptGps: () => void;
  restoreAll: () => void;
  addLog: (message: string, type: ChaosLog['type']) => void;
}

export const useChaosStore = create<ChaosState>((set) => ({
  internetKilled: false,
  backendKilled: false,
  latencyMs: 0,
  gpsCorrupted: false,
  logs: [],
  killInternet: () => set((state) => ({ 
    internetKilled: true, 
    logs: [{ id: Math.random().toString(), message: 'Internet Connection Severed', timestamp: new Date(), type: 'FAIL' }, ...state.logs] 
  })),
  killBackend: () => set((state) => ({ 
    backendKilled: true, 
    logs: [{ id: Math.random().toString(), message: 'Backend Services Terminated', timestamp: new Date(), type: 'FAIL' }, ...state.logs] 
  })),
  setLatency: (ms) => set({ latencyMs: ms }),
  corruptGps: () => set((state) => ({ 
    gpsCorrupted: true, 
    logs: [{ id: Math.random().toString(), message: 'GPS Signal Corrupted', timestamp: new Date(), type: 'FAIL' }, ...state.logs] 
  })),
  restoreAll: () => set({ 
    internetKilled: false, 
    backendKilled: false, 
    latencyMs: 0, 
    gpsCorrupted: false,
    logs: [{ id: Math.random().toString(), message: 'All Systems Restored', timestamp: new Date(), type: 'RECOVERY' }]
  }),
  addLog: (message, type) => set((state) => ({ 
    logs: [{ id: Math.random().toString(), message, timestamp: new Date(), type }, ...state.logs].slice(0, 50) 
  }))
}));

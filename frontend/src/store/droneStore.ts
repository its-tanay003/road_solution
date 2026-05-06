import { create } from 'zustand';

// DroneStatus — exported type for dispatch state machine
export type DroneStatus = 'IDLE' | 'TAKEOFF' | 'CRUISING' | 'EN_ROUTE' | 'HOVERING' | 'LIVE';

interface DroneState {
  isDispatched: boolean;
  status: DroneStatus;
  eta: number; // in seconds
  distance: number; // in km
  aiFindings: string[];
  currentLocation: [number, number];
  
  dispatchDrone: () => void;
  setStatus: (status: DroneStatus) => void;
  updateEta: (seconds: number) => void;
  addAiFinding: (finding: string) => void;
  resetDrone: () => void;
}

export const useDroneStore = create<DroneState>((set) => ({
  isDispatched: false,
  status: 'IDLE',
  eta: 134, // 2:14
  distance: 8,
  aiFindings: [],
  currentLocation: [13.0125, 80.2214], // Guindy Hub
  
  dispatchDrone: () => set({ isDispatched: true, status: 'TAKEOFF' }),
  setStatus: (status) => set({ status }),
  updateEta: (seconds) => set({ eta: seconds }),
  addAiFinding: (finding) => set((state) => ({ 
    aiFindings: [...state.aiFindings, finding] 
  })),
  resetDrone: () => set({ 
    isDispatched: false, 
    status: 'IDLE', 
    eta: 134, 
    aiFindings: [] 
  }),
}));

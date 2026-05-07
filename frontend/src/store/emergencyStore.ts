import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EmergencyState {
  sosActive: boolean;
  crashDetectedAt: number | null;
  currentIncidentId: string | null;
  isDispatched: boolean;
  dispatchData: unknown | null;
  
  // Golden Hour / Advanced Emergency State
  goldenHourActive: boolean;
  goldenHourExpired: boolean;
  crashTriggered: boolean;
  gForceData: { x: number; y: number; z: number };
  dispatchConfirmed: boolean;

  triggerSOS: (incidentId?: string) => void;
  cancelSOS: () => void;
  confirmDispatch: (data: unknown) => void;
  
  setGoldenHourActive: (active: boolean) => void;
  setGoldenHourExpired: (expired: boolean) => void;
  setCrashDetectedAt: (time: number | null) => void;
  setCrashTriggered: (triggered: boolean) => void;
  setGForceData: (data: { x: number; y: number; z: number }) => void;
}

export const useEmergencyStore = create<EmergencyState>()(
  persist(
    (set) => ({
      sosActive: false,
      crashDetectedAt: null,
      currentIncidentId: null,
      isDispatched: false,
      dispatchData: null,
      
      goldenHourActive: false,
      goldenHourExpired: false,
      crashTriggered: false,
      gForceData: { x: 0, y: 0, z: 0 },
      dispatchConfirmed: false,

      triggerSOS: (incidentId) => set({
        sosActive: true,
        crashDetectedAt: Date.now(),
        currentIncidentId: incidentId || `INC-${Math.random().toString(36).substring(7).toUpperCase()}`,
        isDispatched: false,
        dispatchData: null,
        crashTriggered: true,
        goldenHourActive: true
      }),

      cancelSOS: () => set({
        sosActive: false,
        crashDetectedAt: null,
        currentIncidentId: null,
        isDispatched: false,
        dispatchData: null,
        goldenHourActive: false,
        goldenHourExpired: false,
        crashTriggered: false,
        dispatchConfirmed: false
      }),

      confirmDispatch: (data) => set({
        isDispatched: true,
        dispatchConfirmed: true,
        dispatchData: data
      }),

      setGoldenHourActive: (active) => set({ goldenHourActive: active }),
      setGoldenHourExpired: (expired) => set({ goldenHourExpired: expired }),
      setCrashDetectedAt: (time) => set({ crashDetectedAt: time }),
      setCrashTriggered: (triggered) => set({ crashTriggered: triggered }),
      setGForceData: (data) => set({ gForceData: data })
    }),
    {
      name: 'roadsos-emergency-state'
    }
  )
);

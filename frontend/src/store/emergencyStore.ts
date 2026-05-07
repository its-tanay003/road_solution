import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EmergencyState {
  sosActive: boolean;
  crashDetectedAt: number | null;
  currentIncidentId: string | null;
  isDispatched: boolean;
  dispatchData: unknown | null;
  
  triggerSOS: (incidentId?: string) => void;
  cancelSOS: () => void;
  confirmDispatch: (data: unknown) => void;
}

export const useEmergencyStore = create<EmergencyState>()(
  persist(
    (set) => ({
      sosActive: false,
      crashDetectedAt: null,
      currentIncidentId: null,
      isDispatched: false,
      dispatchData: null,

      triggerSOS: (incidentId) => set({
        sosActive: true,
        crashDetectedAt: Date.now(),
        currentIncidentId: incidentId || `INC-${Math.random().toString(36).substring(7).toUpperCase()}`,
        isDispatched: false,
        dispatchData: null
      }),

      cancelSOS: () => set({
        sosActive: false,
        crashDetectedAt: null,
        currentIncidentId: null,
        isDispatched: false,
        dispatchData: null
      }),

      confirmDispatch: (data) => set({
        isDispatched: true,
        dispatchData: data
      })
    }),
    {
      name: 'roadsos-emergency-state'
    }
  )
);

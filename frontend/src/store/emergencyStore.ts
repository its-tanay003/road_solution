import { create } from 'zustand';

interface EmergencyState {
  sosActive:        boolean;
  crashDetectedAt:  number | null;
  currentIncidentId: string | null;
  activateSOS:   () => void;
  cancelSOS:     () => void;
  setCrashAt:    (ts: number) => void;
  setIncidentId: (id: string) => void;
}

export const useEmergencyStore = create<EmergencyState>((set) => ({
  sosActive:         false,
  crashDetectedAt:   null,
  currentIncidentId: null,

  activateSOS: () =>
    set({ sosActive: true, crashDetectedAt: Date.now() }),

  cancelSOS: () =>
    set({ sosActive: false, crashDetectedAt: null, currentIncidentId: null }),

  setCrashAt:    (ts)  => set({ crashDetectedAt: ts }),
  setIncidentId: (id)  => set({ currentIncidentId: id }),
}));

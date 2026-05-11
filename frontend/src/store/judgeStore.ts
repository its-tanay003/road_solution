import { create } from 'zustand';

export interface JudgeIncident {
  id: string;
  name: string;
  location: [number, number];
  timestamp: Date;
  sessionId: string;
}

interface JudgeStore {
  activeIncidents: JudgeIncident[];
  addIncident: (incident: JudgeIncident) => void;
  removeIncident: (id: string) => void;
  clearIncidents: () => void;
}

export const useJudgeStore = create<JudgeStore>((set) => ({
  activeIncidents: [],
  addIncident: (incident) => set((state) => ({ 
    activeIncidents: [incident, ...state.activeIncidents].slice(0, 5) 
  })),
  removeIncident: (id) => set((state) => ({ 
    activeIncidents: state.activeIncidents.filter(i => i.id !== id) 
  })),
  clearIncidents: () => set({ activeIncidents: [] })
}));

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Debrief {
  id: string;
  incidentId: string;
  timestamp: string;
  content: string;
}

interface DebriefState {
  debriefs: Debrief[];
  saveDebrief: (debrief: Debrief) => void;
  getDebrief: (id: string) => Debrief | undefined;
}

export const useDebriefStore = create<DebriefState>()(
  persist(
    (set, get) => ({
      debriefs: [],
      saveDebrief: (debrief) => set((state) => ({ debriefs: [...state.debriefs, debrief] })),
      getDebrief: (id) => get().debriefs.find(d => d.id === id)
    }),
    {
      name: 'roadsos-debriefs'
    }
  )
);

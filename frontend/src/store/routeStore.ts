import { create } from 'zustand';

interface Journey {
  source: string;
  destination: string;
  startTime: number;
  safetyScore: number;
}

interface RouteState {
  activeJourney: Journey | null;
  startJourney: (source: string, destination: string, score: number) => void;
  endJourney: () => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  activeJourney: null,
  startJourney: (source, destination, safetyScore) => set({ 
    activeJourney: { source, destination, safetyScore, startTime: Date.now() } 
  }),
  endJourney: () => set({ activeJourney: null }),
}));

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SafetyEvent {
  id: string;
  type: 'hard_brake' | 'overspeed' | 'sos_triggered' | 'safe_trip';
  scoreImpact: number;
  timestamp: number;
  description: string;
}

interface SafetyScoreState {
  score: number;
  events: SafetyEvent[];
  addEvent: (event: Omit<SafetyEvent, 'id' | 'timestamp'>) => void;
}

export const useSafetyScoreStore = create<SafetyScoreState>()(
  persist(
    (set) => ({
      score: 850, // Out of 1000
      events: [
        { id: '1', type: 'safe_trip', scoreImpact: 5, timestamp: Date.now() - 86400000, description: 'Completed a 15km trip with no incidents' },
        { id: '2', type: 'hard_brake', scoreImpact: -15, timestamp: Date.now() - 172800000, description: 'Sudden braking detected on MG Road' },
      ],
      addEvent: (data) => set((state) => ({
        events: [
          { ...data, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() },
          ...state.events
        ],
        score: Math.min(1000, Math.max(0, state.score + data.scoreImpact))
      })),
    }),
    { name: 'safety-score-storage' }
  )
);

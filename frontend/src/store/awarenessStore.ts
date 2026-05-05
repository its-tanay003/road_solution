import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SafetyLevel = 'Cautious' | 'Safe Driver' | 'Road Guardian' | 'Road Hero';

interface AwarenessState {
  xp: number;
  knownFacts: string[];
  quizCompletedToday: boolean;
  addXP: (amount: number) => void;
  markFactAsKnown: (factId: string) => void;
  completeQuiz: () => void;
  getLevel: () => SafetyLevel;
}

export const useAwarenessStore = create<AwarenessState>()(
  persist(
    (set, get) => ({
      xp: 0,
      knownFacts: [],
      quizCompletedToday: false,

      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),

      markFactAsKnown: (factId) => set((state) => ({
        knownFacts: [...state.knownFacts, factId]
      })),

      completeQuiz: () => set({ quizCompletedToday: true }),

      getLevel: () => {
        const { xp } = get();
        if (xp >= 400) return 'Road Hero';
        if (xp >= 250) return 'Road Guardian';
        if (xp >= 100) return 'Safe Driver';
        return 'Cautious';
      }
    }),
    {
      name: 'roadsos-awareness-store'
    }
  )
);

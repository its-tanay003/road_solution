import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TrainingRecord {
  id: string;
  scenarioType: string;
  timestamp: string;
  score: number;
  timeToTriage: number;
  correctUnitDispatched: boolean;
  aiCompliance: boolean;
}

interface TrainingState {
  records: TrainingRecord[];
  currentStreak: number;
  lastTrainingDate: string | null;
  addRecord: (record: Omit<TrainingRecord, 'id' | 'timestamp'>) => void;
  getAverageScore: () => number;
}

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set, get) => ({
      records: [],
      currentStreak: 0,
      lastTrainingDate: null,
      addRecord: (recordData) => {
        const today = new Date().toISOString().split('T')[0];
        
        set((state) => {
          let newStreak = state.currentStreak;
          if (state.lastTrainingDate) {
            const lastDate = new Date(state.lastTrainingDate);
            const currentDate = new Date(today);
            const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
            
            if (diffDays === 1) {
              newStreak += 1; // Consecutive day
            } else if (diffDays > 1) {
              newStreak = 1; // Streak broken
            }
            // If diffDays === 0, streak remains same
          } else {
            newStreak = 1; // First training
          }

          const newRecord: TrainingRecord = {
            ...recordData,
            id: `tr_${Date.now()}`,
            timestamp: new Date().toISOString(),
          };

          return {
            records: [newRecord, ...state.records],
            currentStreak: newStreak,
            lastTrainingDate: today
          };
        });
      },
      getAverageScore: () => {
        const { records } = get();
        if (records.length === 0) return 0;
        const total = records.reduce((sum, r) => sum + r.score, 0);
        return Math.round(total / records.length);
      }
    }),
    {
      name: 'roadsos-training-storage',
    }
  )
);

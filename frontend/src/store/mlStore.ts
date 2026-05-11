import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TriageSeverity = 'CRITICAL' | 'SERIOUS' | 'MODERATE' | 'MINOR';

export interface TrainingExample {
  features: number[]; // [gForce, heartRate, spO2, movementScore, timeOfDay, roadType]
  label: number[];    // [CRITICAL, SERIOUS, MODERATE, MINOR] (one-hot)
  timestamp: number;
}

interface MLState {
  trainingData: TrainingExample[];
  modelAccuracy: number;
  lastRetrained: number | null;
  examplesSinceLastRetrain: number;
  isTraining: boolean;
  
  addTrainingExample: (example: TrainingExample) => void;
  updateAccuracy: (accuracy: number) => void;
  setLastRetrained: (timestamp: number) => void;
  incrementExamplesSinceRetrain: () => void;
  resetExamplesSinceRetrain: () => void;
  setIsTraining: (isTraining: boolean) => void;
}

export const useMLStore = create<MLState>()(
  persist(
    (set) => ({
      trainingData: [],
      modelAccuracy: 0,
      lastRetrained: null,
      examplesSinceLastRetrain: 0,
      isTraining: false,

      addTrainingExample: (example) => set((state) => ({
        trainingData: [...state.trainingData, example]
      })),
      
      updateAccuracy: (accuracy) => set({ modelAccuracy: accuracy }),
      
      setLastRetrained: (timestamp) => set({ lastRetrained: timestamp }),
      
      incrementExamplesSinceRetrain: () => set((state) => ({
        examplesSinceLastRetrain: state.examplesSinceLastRetrain + 1
      })),
      
      resetExamplesSinceRetrain: () => set({ examplesSinceLastRetrain: 0 }),
      
      setIsTraining: (isTraining) => set({ isTraining })
    }),
    {
      name: 'roadsos-ml-store'
    }
  )
);

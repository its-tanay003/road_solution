import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RoadReport {
  id: string;
  type: 'pothole' | 'accident' | 'flood' | 'construction' | 'blockage';
  severity: 'low' | 'medium' | 'high';
  lat: number;
  lng: number;
  timestamp: number;
  userId: string;
}

interface RoadReportState {
  reports: RoadReport[];
  isReporting: boolean;
  addReport: (report: Omit<RoadReport, 'id' | 'timestamp'>) => void;
  setReporting: (val: boolean) => void;
}

export const useRoadReportStore = create<RoadReportState>()(
  persist(
    (set) => ({
      reports: [],
      isReporting: false,
      addReport: (data) => set((state) => ({
        reports: [
          ...state.reports,
          { ...data, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() }
        ],
        isReporting: false
      })),
      setReporting: (isReporting) => set({ isReporting }),
    }),
    { name: 'road-report-storage' }
  )
);

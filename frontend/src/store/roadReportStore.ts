import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface RoadReport {
  id: string;
  type: 'pothole' | 'accident' | 'flood' | 'construction' | 'blockage';
  severity: 'low' | 'medium' | 'high';
  lat: number;
  lng: number;
  timestamp: number;
  userId: string;
  description?: string;
  image_url?: string;
}

interface RoadReportState {
  reports: RoadReport[];
  isReporting: boolean;
  isLoading: boolean;
  addReport: (report: Omit<RoadReport, 'id' | 'timestamp'>) => Promise<void>;
  fetchReports: () => Promise<void>;
  setReporting: (val: boolean) => void;
}

export const useRoadReportStore = create<RoadReportState>()(
  persist(
    (set, get) => ({
      reports: [],
      isReporting: false,
      isLoading: false,

      fetchReports: async () => {
        set({ isLoading: true });
        try {
          const res = await axios.get(`${API_BASE}/road-reports`);
          set({ reports: res.data, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch reports:', error);
          set({ isLoading: false });
        }
      },

      addReport: async (data) => {
        set({ isLoading: true });
        try {
          const res = await axios.post(`${API_BASE}/road-reports`, data);
          if (res.data.success) {
            // Re-fetch to get the official list
            await get().fetchReports();
          }
          set({ isReporting: false, isLoading: false });
        } catch (error) {
          console.error('Failed to add report:', error);
          set({ isLoading: false });
        }
      },

      setReporting: (isReporting) => set({ isReporting }),
    }),
    { name: 'road-report-storage' }
  )
);

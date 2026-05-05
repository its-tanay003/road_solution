import { create } from 'zustand';

export interface Hotspot {
  id: string;
  lat: number;
  lng: number;
  intensity: number;
  locationName: string;
  insight: string;
  trend: number;
}

interface AnalyticsState {
  hotspots: Hotspot[];
  setHotspots: (hotspots: Hotspot[]) => void;
  isAnalyticsLoading: boolean;
  setAnalyticsLoading: (loading: boolean) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  hotspots: [],
  setHotspots: (hotspots) => set({ hotspots }),
  isAnalyticsLoading: false,
  setAnalyticsLoading: (isAnalyticsLoading) => set({ isAnalyticsLoading }),
}));

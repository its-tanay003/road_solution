import { create } from 'zustand';

export interface AlertData {
  id: string;
  type: string;
  lat: number;
  lng: number;
  distance: number;
  user: string;
  timestamp: number;
}

interface AlertState {
  activeAlert: AlertData | null;
  triggerAlert: (alert: AlertData) => void;
  clearAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  activeAlert: null,
  triggerAlert: (alert) => set({ activeAlert: alert }),
  clearAlert: () => set({ activeAlert: null })
}));

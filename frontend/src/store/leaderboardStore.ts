import { create } from 'zustand';

export interface Responder {
  unitId: string;
  unitType: 'ALS' | 'BLS' | 'Police' | 'Fire';
  responderName: string;
  incidentsHandled: number;
  avgResponseTime: string;
  aiCollaborationScore: number;
  livesImpacted: number;
  currentStatus: 'ON SCENE' | 'AVAILABLE' | 'EN ROUTE';
  streak: number;
  city: string;
  location: { lat: number; lng: number };
  shift: 'morning' | 'evening' | 'night';
}

interface LeaderboardState {
  responders: Responder[];
  updateResponders: (responders: Responder[]) => void;
  shuffleMetrics: () => void;
}

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  responders: [
    { unitId: "A47", unitType: "ALS", responderName: "Unit Alpha 47", incidentsHandled: 23, avgResponseTime: "3m 42s", aiCollaborationScore: 94, livesImpacted: 11, currentStatus: "AVAILABLE", streak: 7, city: "New Delhi", location: { lat: 28.6139, lng: 77.2090 }, shift: "morning" },
    { unitId: "B12", unitType: "BLS", responderName: "Guardian 12", incidentsHandled: 19, avgResponseTime: "4m 15s", aiCollaborationScore: 88, livesImpacted: 8, currentStatus: "EN ROUTE", streak: 4, city: "Mumbai", location: { lat: 19.0760, lng: 72.8777 }, shift: "morning" },
    { unitId: "P09", unitType: "Police", responderName: "Sector-9 Patrol", incidentsHandled: 45, avgResponseTime: "2m 55s", aiCollaborationScore: 72, livesImpacted: 5, currentStatus: "ON SCENE", streak: 2, city: "New Delhi", location: { lat: 28.6145, lng: 77.2095 }, shift: "evening" },
    { unitId: "F03", unitType: "Fire", responderName: "Station 3 Rescue", incidentsHandled: 31, avgResponseTime: "5m 20s", aiCollaborationScore: 91, livesImpacted: 14, currentStatus: "AVAILABLE", streak: 9, city: "Bangalore", location: { lat: 12.9716, lng: 77.5946 }, shift: "night" },
    { unitId: "A11", unitType: "ALS", responderName: "Swift Response 11", incidentsHandled: 15, avgResponseTime: "4m 02s", aiCollaborationScore: 84, livesImpacted: 6, currentStatus: "AVAILABLE", streak: 3, city: "New Delhi", location: { lat: 28.6130, lng: 77.2085 }, shift: "morning" },
    { unitId: "B88", unitType: "BLS", responderName: "Unit Bravo 88", incidentsHandled: 12, avgResponseTime: "6m 10s", aiCollaborationScore: 61, livesImpacted: 3, currentStatus: "ON SCENE", streak: 1, city: "Mumbai", location: { lat: 19.0770, lng: 72.8785 }, shift: "evening" }
  ],
  updateResponders: (responders) => set({ responders }),
  shuffleMetrics: () => set((state) => ({
    responders: state.responders.map(r => ({
      ...r,
      incidentsHandled: r.incidentsHandled + (Math.random() > 0.8 ? 1 : 0),
      aiCollaborationScore: Math.min(100, Math.max(0, r.aiCollaborationScore + (Math.random() * 4 - 2)))
    }))
  }))
}));

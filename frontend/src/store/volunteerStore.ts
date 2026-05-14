import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { socket } from '../lib/socket';

export interface ActiveIncident {
  incidentId: string;
  type: string;
  location: { lat: number; lng: number };
  severity: string;
  distance: number;
}

interface VolunteerState {
  isRegistered: boolean;
  isActive: boolean;
  nearbyIncidents: ActiveIncident[];
  stats: {
    helped: number;
    distanceTravelled: number;
    points: number;
  };
  init: () => void;
  register: (name: string, skills: string[]) => void;
  toggleStatus: () => void;
  addNearbyIncident: (incident: ActiveIncident) => void;
  removeIncident: (id: string) => void;
  updateStats: (updates: Partial<VolunteerState['stats']>) => void;
}

export const useVolunteerStore = create<VolunteerState>()(
  persist(
    (set, get) => ({
      isRegistered: false,
      isActive: false,
      nearbyIncidents: [],
      stats: {
        helped: 0,
        distanceTravelled: 0,
        points: 0
      },
      init: () => {
        if (!socket.connected) {
          socket.connect();
        }

        socket.on('volunteer:nearby_incident', (incident: ActiveIncident) => {
          get().addNearbyIncident(incident);
        });

        // Listen for SOS cancel
        socket.on('sos:cancelled_globally', (incidentId: string) => {
          get().removeIncident(incidentId);
        });
      },
      register: (name, skills) => {
        set({ isRegistered: true, isActive: true });
        
        get().init();

        socket.emit('volunteer:register', {
          name,
          skills,
          location: { lat: 28.6139, lng: 77.2090 } // Initial mock
        });
      },
      toggleStatus: () => {
        const nextActive = !get().isActive;
        set({ isActive: nextActive });
        // Emit status update to backend if needed
      },
      addNearbyIncident: (incident) => {
        const exists = get().nearbyIncidents.some(i => i.incidentId === incident.incidentId);
        if (!exists) {
          set((state) => ({ nearbyIncidents: [incident, ...state.nearbyIncidents] }));
        }
      },
      removeIncident: (id) => set((state) => ({
        nearbyIncidents: state.nearbyIncidents.filter(i => i.incidentId !== id)
      })),
      updateStats: (updates) => set((state) => ({
        stats: { ...state.stats, ...updates }
      }))
    }),
    {
      name: 'roadsos-volunteer-store'
    }
  )
);

import { create } from 'zustand';

export type AmbulanceStatus = "AVAILABLE" | "DISPATCHED" | "ON_SCENE" | "TRANSPORTING" | "AT_HOSPITAL";
export type AmbulanceType = "ALS" | "BLS";

export interface Ambulance {
  unitId: string;
  type: AmbulanceType;
  status: AmbulanceStatus;
  currentLat: number;
  currentLng: number;
  driver: string;
  paramedic: string;
  lastUpdated: number;
  speedKmh: number;
  heading: number;
  certifications: string[];
  currentIncidentId: string | null;
  route: [number, number][]; // Full polyline from OSRM
  routeIndex: number; // Current progress along the route
  history: [number, number][]; // For replay
}

interface AmbulanceState {
  ambulances: Ambulance[];
  dispatchedUnitId: string | null;
  eta: string | null;
  distance: string | null;
  
  initializeFleet: (center: { lat: number, lng: number }) => void;
  dispatchAmbulance: (unitId: string, route: [number, number][], duration: number, distance: number) => void;
  updateAmbulancePos: (unitId: string, lat: number, lng: number, heading: number, speed: number) => void;
  setEtaInfo: (eta: string, distance: string) => void;
  tick: () => void;
}

export const useAmbulanceStore = create<AmbulanceState>((set, get) => ({
  ambulances: [],
  dispatchedUnitId: null,
  eta: null,
  distance: null,

  initializeFleet: (center) => {
    const fleet: Ambulance[] = [
      { unitId: "MH-108-A47", type: "ALS", status: "AVAILABLE", currentLat: center.lat + 0.015, currentLng: center.lng - 0.01, driver: "Rajesh Kumar", paramedic: "Dr. Priya Sharma", lastUpdated: Date.now(), speedKmh: 0, heading: 90, certifications: ["ALS", "ACLS", "Pediatric"], currentIncidentId: null, route: [], routeIndex: 0, history: [] },
      { unitId: "MH-108-B12", type: "BLS", status: "AVAILABLE", currentLat: center.lat - 0.01, currentLng: center.lng + 0.02, driver: "Amit Singh", paramedic: "Suresh Raina", lastUpdated: Date.now(), speedKmh: 0, heading: 180, certifications: ["BLS", "First Aid"], currentIncidentId: null, route: [], routeIndex: 0, history: [] },
      { unitId: "MH-108-A03", type: "ALS", status: "AVAILABLE", currentLat: center.lat + 0.02, currentLng: center.lng + 0.01, driver: "Vikram Rathore", paramedic: "Dr. Anjali Gupta", lastUpdated: Date.now(), speedKmh: 0, heading: 45, certifications: ["ALS", "Trauma", "Cardiac"], currentIncidentId: null, route: [], routeIndex: 0, history: [] },
      { unitId: "MH-108-B09", type: "BLS", status: "AVAILABLE", currentLat: center.lat - 0.015, currentLng: center.lng - 0.02, driver: "Mohit Sharma", paramedic: "Rahul Dravid", lastUpdated: Date.now(), speedKmh: 0, heading: 270, certifications: ["BLS", "CPR"], currentIncidentId: null, route: [], routeIndex: 0, history: [] },
      { unitId: "MH-108-A22", type: "ALS", status: "AVAILABLE", currentLat: center.lat + 0.005, currentLng: center.lng + 0.03, driver: "Deepak Chahar", paramedic: "Dr. MS Dhoni", lastUpdated: Date.now(), speedKmh: 0, heading: 0, certifications: ["ALS", "ACLS"], currentIncidentId: null, route: [], routeIndex: 0, history: [] },
    ];
    set({ ambulances: fleet });
  },

  dispatchAmbulance: (unitId, route, duration, distance) => {
    set((state) => ({
      dispatchedUnitId: unitId,
      eta: `${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s`,
      distance: `${(distance / 1000).toFixed(1)} km`,
      ambulances: state.ambulances.map(a => 
        a.unitId === unitId 
          ? { ...a, status: 'DISPATCHED', route, routeIndex: 0, history: [[a.currentLat, a.currentLng]] } 
          : a
      )
    }));
  },

  updateAmbulancePos: (unitId, lat, lng, heading, speed) => {
    set((state) => ({
      ambulances: state.ambulances.map(a => 
        a.unitId === unitId 
          ? { 
              ...a, 
              currentLat: lat, 
              currentLng: lng, 
              heading, 
              speedKmh: speed, 
              lastUpdated: Date.now(),
              history: [...a.history, [lat, lng]]
            } 
          : a
      )
    }));
  },

  setEtaInfo: (eta, distance) => set({ eta, distance }),

  tick: () => {
    const { dispatchedUnitId } = get();
    if (!dispatchedUnitId) return;

    set((state) => ({
      ambulances: state.ambulances.map(a => {
        if (a.unitId === dispatchedUnitId && a.status === 'DISPATCHED') {
          if (a.routeIndex >= a.route.length - 1) {
            return { ...a, status: 'ON_SCENE', speedKmh: 0 };
          }

          const nextIndex = a.routeIndex + 1;
          const [nextLat, nextLng] = a.route[nextIndex];
          
          // Calculate heading
          const dy = nextLat - a.currentLat;
          const dx = Math.cos(Math.PI/180 * a.currentLat) * (nextLng - a.currentLng);
          const heading = Math.atan2(dx, dy) * 180 / Math.PI;

          // Realistic speed simulation
          let speed = 40 + (Math.random() * 20); // Base 40-60kmh
          if (a.route.length - nextIndex < 5) speed = 10; // Slowing down as arriving
          if (Math.random() > 0.95) speed = 0; // Simulated traffic light stop

          return {
            ...a,
            currentLat: nextLat,
            currentLng: nextLng,
            routeIndex: nextIndex,
            heading,
            speedKmh: speed,
            lastUpdated: Date.now(),
            history: [...a.history, [nextLat, nextLng]]
          };
        }
        return a;
      })
    }));
  }
}));

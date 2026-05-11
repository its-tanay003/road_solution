import { create } from 'zustand';

export interface Drone {
  droneId: string;
  model: string;
  status: 'STANDBY' | 'DISPATCHED' | 'ON SCENE' | 'RETURNING';
  batteryPct: number;
  currentLat: number;
  currentLng: number;
  baseLat: number;
  baseLng: number;
  payload: string;
  maxRangeKm: number;
  etaSeconds: number;
  cameraActive: boolean;
}

interface DroneRegistryState {
  drones: Drone[];
  dispatchDrone: (droneId: string, targetLat: number, targetLng: number) => void;
  updateDronePos: (droneId: string, lat: number, lng: number) => void;
  toggleCamera: (droneId: string) => void;
}

export const useDroneRegistryStore = create<DroneRegistryState>((set) => ({
  drones: [
    { droneId: "DR-01", model: "DJI Matrice 30T", status: "STANDBY", batteryPct: 87, currentLat: 28.625, currentLng: 77.210, baseLat: 28.625, baseLng: 77.210, payload: "AED + Trauma Kit", maxRangeKm: 8, etaSeconds: 0, cameraActive: false },
    { droneId: "DR-02", model: "DJI Matrice 30T", status: "STANDBY", batteryPct: 92, currentLat: 28.610, currentLng: 77.230, baseLat: 28.610, baseLng: 77.230, payload: "AED + Trauma Kit", maxRangeKm: 8, etaSeconds: 0, cameraActive: false },
    { droneId: "DR-03", model: "DJI Matrice 30T", status: "STANDBY", batteryPct: 45, currentLat: 28.640, currentLng: 77.190, baseLat: 28.640, baseLng: 77.190, payload: "AED + Trauma Kit", maxRangeKm: 8, etaSeconds: 0, cameraActive: false },
    { droneId: "DR-04", model: "DJI Matrice 30T", status: "STANDBY", batteryPct: 88, currentLat: 28.590, currentLng: 77.200, baseLat: 28.590, baseLng: 77.200, payload: "AED + Trauma Kit", maxRangeKm: 8, etaSeconds: 0, cameraActive: false },
    { droneId: "DR-05", model: "DJI Matrice 30T", status: "STANDBY", batteryPct: 76, currentLat: 28.615, currentLng: 77.180, baseLat: 28.615, baseLng: 77.180, payload: "AED + Trauma Kit", maxRangeKm: 8, etaSeconds: 0, cameraActive: false }
  ],
  dispatchDrone: (droneId, targetLat, targetLng) => set((state) => ({
    drones: state.drones.map(d => d.droneId === droneId ? { 
      ...d, 
      status: 'DISPATCHED',
      currentLat: targetLat || d.currentLat,
      currentLng: targetLng || d.currentLng
    } : d)
  })),
  updateDronePos: (droneId, lat, lng) => set((state) => ({
    drones: state.drones.map(d => d.droneId === droneId ? { ...d, currentLat: lat, currentLng: lng } : d)
  })),
  toggleCamera: (droneId) => set((state) => ({
    drones: state.drones.map(d => d.droneId === droneId ? { ...d, cameraActive: !d.cameraActive } : d)
  }))
}));

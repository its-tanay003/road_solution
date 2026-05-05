import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ConnectionStatus = 'DISCONNECTED' | 'SCANNING' | 'PAIRING' | 'CONNECTED';

export interface WearableDevice {
  id: string;
  name: string;
  type: 'WATCH' | 'TRACKER' | 'VEHICLE';
  status: ConnectionStatus;
  battery: number;
  lastSync: number;
}

export interface HealthData {
  bpmHistory: { time: number; value: number }[];
  steps: number;
  sleepStatus: 'AWAKE' | 'LIGHT' | 'DEEP';
  ecgStatus: 'NORMAL' | 'AFIB' | 'INCONCLUSIVE';
  spO2: number;
}

export interface VehicleData {
  model: string;
  speed: number;
  acceleration: number;
  airbags: {
    driver: boolean;
    passenger: boolean;
    side: boolean;
  };
  seatbelts: {
    driver: boolean;
    passenger: boolean;
  };
}

interface WearableState {
  devices: WearableDevice[];
  health: HealthData;
  vehicle: VehicleData;
  activeAlerts: string[];
  
  // Actions
  setConnectionStatus: (deviceId: string, status: ConnectionStatus) => void;
  updateHealthData: (data: Partial<HealthData>) => void;
  updateVehicleData: (data: Partial<VehicleData>) => void;
  addAlert: (alert: string) => void;
  removeAlert: (alert: string) => void;
  simulateBpm: () => void;
  triggerAirbag: () => void;
}

export const useWearableStore = create<WearableState>()(
  persist(
    (set, get) => ({
      devices: [
        { id: 'watch-1', name: 'Apple Watch Series 9', type: 'WATCH', status: 'CONNECTED', battery: 84, lastSync: Date.now() },
        { id: 'tracker-1', name: 'Fitbit Charge 6', type: 'TRACKER', status: 'DISCONNECTED', battery: 0, lastSync: 0 },
        { id: 'vehicle-1', name: 'Honda City 2022 (OBD-II)', type: 'VEHICLE', status: 'CONNECTED', battery: 100, lastSync: Date.now() }
      ],
      health: {
        bpmHistory: Array.from({ length: 60 }, (_, i) => ({ 
          time: Date.now() - (60 - i) * 1000, 
          value: 70 + Math.floor(Math.random() * 10) 
        })),
        steps: 8421,
        sleepStatus: 'AWAKE',
        ecgStatus: 'NORMAL',
        spO2: 98
      },
      vehicle: {
        model: 'Honda City 2022',
        speed: 0,
        acceleration: 0,
        airbags: { driver: false, passenger: false, side: false },
        seatbelts: { driver: true, passenger: true }
      },
      activeAlerts: [],

      setConnectionStatus: (id, status) => set((state) => ({
        devices: state.devices.map(d => d.id === id ? { ...d, status, lastSync: status === 'CONNECTED' ? Date.now() : d.lastSync } : d)
      })),

      updateHealthData: (data) => set((state) => ({
        health: { ...state.health, ...data }
      })),

      updateVehicleData: (data) => set((state) => ({
        vehicle: { ...state.vehicle, ...data }
      })),

      addAlert: (alert) => set((state) => ({
        activeAlerts: [...state.activeAlerts, alert]
      })),

      removeAlert: (alert) => set((state) => ({
        activeAlerts: state.activeAlerts.filter(a => a !== alert)
      })),

      simulateBpm: () => {
        const { health } = get();
        const lastBpm = health.bpmHistory[health.bpmHistory.length - 1].value;
        const nextBpm = Math.max(60, Math.min(180, lastBpm + (Math.random() * 6 - 3)));
        
        set((state) => ({
          health: {
            ...state.health,
            bpmHistory: [...state.health.bpmHistory.slice(1), { time: Date.now(), value: nextBpm }]
          }
        }));
      },

      triggerAirbag: () => {
        set((state) => ({
          vehicle: {
            ...state.vehicle,
            airbags: { driver: true, passenger: true, side: false }
          }
        }));
      }
    }),
    {
      name: 'roadsos-wearables'
    }
  )
);

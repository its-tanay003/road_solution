import { create } from 'zustand';

export type ServiceLayerType = 
  | 'hospitals' 
  | 'clinics' 
  | 'pharmacies' 
  | 'bloodBanks' 
  | 'ambulances' 
  | 'police' 
  | 'fire' 
  | 'fuel' 
  | 'tolls' 
  | 'atms' 
  | 'blackSpots' 
  | 'hazards';

export type MapPlace = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: ServiceLayerType;
  address?: string;
  phone?: string;
  isOpen?: boolean;
  rating?: number;
  distance?: number;
  eta?: string;
  facilities?: string[];
  mockData?: any;
}

interface MapDataState {
  activeLayers: Set<ServiceLayerType>;
  searchRadius: number; // in meters
  placesCache: Record<string, { timestamp: number; data: MapPlace[] }>;
  sosActive: boolean;
  
  toggleLayer: (layer: ServiceLayerType) => void;
  setSearchRadius: (radius: number) => void;
  setSosActive: (active: boolean) => void;
  cachePlaces: (key: string, data: MapPlace[]) => void;
  getCachedPlaces: (key: string) => MapPlace[] | null;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useMapDataStore = create<MapDataState>((set, get) => ({
  activeLayers: new Set(['hospitals', 'ambulances', 'police']), // Default active
  searchRadius: 3000,
  placesCache: {},
  sosActive: false,

  toggleLayer: (layer) => set((state) => {
    const newLayers = new Set(state.activeLayers);
    if (newLayers.has(layer)) {
      newLayers.delete(layer);
    } else {
      newLayers.add(layer);
    }
    return { activeLayers: newLayers };
  }),

  setSearchRadius: (searchRadius) => set({ searchRadius }),

  setSosActive: (sosActive) => set((state) => {
    // If turning on SOS, force only critical layers
    if (sosActive) {
      return { 
        sosActive, 
        activeLayers: new Set(['hospitals', 'ambulances'])
      };
    }
    return { sosActive };
  }),

  cachePlaces: (key, data) => set((state) => ({
    placesCache: {
      ...state.placesCache,
      [key]: { timestamp: Date.now(), data }
    }
  })),

  getCachedPlaces: (key) => {
    const cacheHit = get().placesCache[key];
    if (cacheHit && (Date.now() - cacheHit.timestamp < CACHE_TTL)) {
      return cacheHit.data;
    }
    return null;
  }
}));

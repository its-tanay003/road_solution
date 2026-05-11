import { create } from 'zustand';

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  traumaLevel: 1 | 2 | 3; // 1 = highest
  erAvailableBeds: number;
  erTotalBeds: number;
  erWaitMinutes: number;
  traumaSurgeonOnCall: boolean;
  neurologyAvailable: boolean;
  bloodBankReady: string[];
  helipads: number;
  currentAlerts: string[];
  acceptingTrauma: boolean;
  preAlerted?: boolean;
  estimatedETA?: number; // minutes
  matchScore?: number;
}

interface HospitalState {
  hospitals: Hospital[];
  isSimulating: boolean;
  startSimulation: () => void;
  stopSimulation: () => void;
  preAlertHospital: (id: string, incidentDetails?: Record<string, unknown>) => Promise<void>;
  computeBestMatches: (lat: number, lng: number, conditions: string[]) => Hospital[];
}

const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: "HOSP-01",
    name: "AIIMS Delhi",
    lat: 28.5672, lng: 77.2100,
    traumaLevel: 1,
    erAvailableBeds: 3,
    erTotalBeds: 12,
    erWaitMinutes: 24,
    traumaSurgeonOnCall: true,
    neurologyAvailable: true,
    bloodBankReady: ["O+", "O-", "A+", "B+"],
    helipads: 1,
    currentAlerts: ["Mass casualty drill"],
    acceptingTrauma: true
  },
  {
    id: "HOSP-02",
    name: "Max Super Speciality",
    lat: 28.5273, lng: 77.2181,
    traumaLevel: 2,
    erAvailableBeds: 8,
    erTotalBeds: 20,
    erWaitMinutes: 12,
    traumaSurgeonOnCall: true,
    neurologyAvailable: true,
    bloodBankReady: ["A+", "B+", "AB+"],
    helipads: 0,
    currentAlerts: [],
    acceptingTrauma: true
  },
  {
    id: "HOSP-03",
    name: "Safdarjung Hospital",
    lat: 28.5684, lng: 77.2046,
    traumaLevel: 1,
    erAvailableBeds: 0,
    erTotalBeds: 15,
    erWaitMinutes: 45,
    traumaSurgeonOnCall: true,
    neurologyAvailable: false,
    bloodBankReady: ["O+", "B-"],
    helipads: 0,
    currentAlerts: ["Capacity critical"],
    acceptingTrauma: false
  },
  {
    id: "HOSP-04",
    name: "Apollo Indraprastha",
    lat: 28.5412, lng: 77.2845,
    traumaLevel: 2,
    erAvailableBeds: 5,
    erTotalBeds: 18,
    erWaitMinutes: 18,
    traumaSurgeonOnCall: false,
    neurologyAvailable: true,
    bloodBankReady: ["O+", "A-", "B+"],
    helipads: 1,
    currentAlerts: [],
    acceptingTrauma: true
  }
];

// Helper to calculate haversine distance in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; 
  return d;
};

export const useHospitalStore = create<HospitalState>((set, get) => {
  let simulationInterval: ReturnType<typeof setInterval> | null = null;

  return {
    hospitals: INITIAL_HOSPITALS,
    isSimulating: false,

    startSimulation: () => {
      if (get().isSimulating) return;
      set({ isSimulating: true });
      
      simulationInterval = setInterval(() => {
        set(state => ({
          hospitals: state.hospitals.map(hosp => {
            // Randomly fluctuate beds by -1, 0, or 1 every few seconds
            // Do not fluctuate if preAlerted (capacity reserved)
            if (hosp.preAlerted) return hosp;
            
            const change = Math.floor(Math.random() * 3) - 1; 
            let newBeds = hosp.erAvailableBeds + change;
            if (newBeds < 0) newBeds = 0;
            if (newBeds > hosp.erTotalBeds) newBeds = hosp.erTotalBeds;
            
            // Adjust wait time based on capacity
            const waitRatio = (hosp.erTotalBeds - newBeds) / hosp.erTotalBeds;
            const newWait = Math.floor(waitRatio * 60);

            return {
              ...hosp,
              erAvailableBeds: newBeds,
              erWaitMinutes: newWait
            };
          })
        }));
      }, 3000); // Update every 3 seconds for demo effect
    },

    stopSimulation: () => {
      if (simulationInterval) clearInterval(simulationInterval);
      set({ isSimulating: false });
    },

    preAlertHospital: async (id: string) => {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          set(state => ({
            hospitals: state.hospitals.map(h => h.id === id ? { ...h, preAlerted: true } : h)
          }));
          resolve();
        }, 1500);
      });
    },

    computeBestMatches: (lat: number, lng: number, conditions: string[]) => {
      const hospitals = get().hospitals;
      
      const requiresNeurology = conditions.some(c => c.toLowerCase().includes('head') || c.toLowerCase().includes('neuro'));
      
      return hospitals.map(h => {
        // Calculate distance in km
        const distKm = calculateDistance(lat, lng, h.lat, h.lng);
        // Rough estimate ETA based on 40km/h ambulance speed in city
        const estimatedETA = Math.ceil((distKm / 40) * 60) + 2; // +2 mins overhead
        
        let score = 100;
        
        // Distance penalty (longer distance = lower score)
        score -= distKm * 2;
        
        // Capacity penalty
        if (h.erAvailableBeds === 0) score -= 50;
        else score += (h.erAvailableBeds * 2);
        
        // Trauma level bonus
        if (h.traumaLevel === 1) score += 20;
        if (h.traumaLevel === 2) score += 10;
        
        // Specialty penalty
        if (requiresNeurology && !h.neurologyAvailable) score -= 40;
        
        // Readiness penalty
        if (!h.acceptingTrauma) score -= 60;
        if (!h.traumaSurgeonOnCall) score -= 20;

        return {
          ...h,
          estimatedETA,
          matchScore: Math.max(0, Math.round(score))
        };
      }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }
  };
});

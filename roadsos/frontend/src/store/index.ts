import { create } from 'zustand';
import axios from 'axios';
import { encryptData } from '../utils/crypto';

interface SosState {
  isActive: boolean;
  isTriggering: boolean;
  location: { lat: number; lng: number } | null;
  trackingToken: string | null;
  deliveryStatus: {
    internet: string;
    sms: string;
    mesh: string;
  };
  countdownActive: boolean;
  countdownTime: number;
  triggerSos: () => void;
  startCountdown: () => void;
  cancelCountdown: () => void;
  decrementCountdown: () => void;
  cancelSos: () => void;
  setLocation: (lat: number, lng: number) => void;
  setTrackingToken: (token: string) => void;
  updateDeliveryStatus: (channel: 'internet' | 'sms' | 'mesh', status: string) => void;
}

export const useSosStore = create<SosState>((set, get) => ({
  isActive: false,
  isTriggering: false,
  location: null,
  trackingToken: null,
  countdownActive: false,
  countdownTime: 10,
  deliveryStatus: {
    internet: 'PENDING',
    sms: 'PENDING',
    mesh: 'PENDING'
  },
  startCountdown: () => set({ countdownActive: true, countdownTime: 10 }),
  cancelCountdown: () => set({ countdownActive: false, countdownTime: 10 }),
  decrementCountdown: () => set((state) => ({ countdownTime: Math.max(0, state.countdownTime - 1) })),
  triggerSos: async () => {
    set({ isTriggering: true, countdownActive: false });
    try {
      const state = get();
      const loc = state.location || { lat: 28.6139, lng: 77.2090 }; // fallback
      
      // Get medical info from user store directly
      const rawMedicalProfile = useUserStore.getState().medicalInfo;
      const medicalProfile = await encryptData(rawMedicalProfile);

      const blackboxData = JSON.parse(localStorage.getItem('roadsos_blackbox_crash') || '[]');
      // Simple heuristic for emotional state from UI store
      const isStressed = useUIStore.getState().isStressed;
      const emotionalState = isStressed ? 'panic' : 'normal';

      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/sos/trigger`, {
        deviceId: 'device-1234', // In a real app this would be a unique UUID per installation
        lat: loc.lat,
        lng: loc.lng,
        medicalProfile,
        contactPhones: useUserStore.getState().contacts.map(c => c.phone),
        blackboxData,
        emotionalState,
        networkCondition: useNetworkStore.getState().isLowBandwidth ? 'poor' : 'good'
      });
      
      set({ 
        trackingToken: response.data.token, 
        isActive: true, 
        isTriggering: false 
      });
    } catch (error) {
      console.error('Failed to trigger SOS on backend', error);
      set({ isTriggering: false });
    }
  },
  cancelSos: () => set({ 
    isTriggering: false, 
    isActive: false, 
    trackingToken: null,
    countdownActive: false,
    deliveryStatus: { internet: 'PENDING', sms: 'PENDING', mesh: 'PENDING' }
  }),
  setLocation: (lat, lng) => set({ location: { lat, lng } }),
  setTrackingToken: (token) => set({ trackingToken: token, isActive: true, isTriggering: false }),
  updateDeliveryStatus: (channel, status) => set((state) => ({
    deliveryStatus: {
      ...state.deliveryStatus,
      [channel]: status
    }
  }))
}));

interface UserState {
  language: string;
  setLanguage: (lang: string) => void;
  contacts: any[];
  addContact: (contact: any) => void;
  medicalInfo: {
    bloodGroup: string;
    allergies: string;
    conditions: string;
  };
  updateMedicalInfo: (info: Partial<UserState['medicalInfo']>) => void;
  isResponder: boolean;
  toggleResponderMode: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  contacts: [],
  addContact: (contact) => set((state) => ({ contacts: [...state.contacts, contact] })),
  medicalInfo: {
    bloodGroup: 'O Positive',
    allergies: 'Penicillin',
    conditions: 'Type 2 Diabetes, Hypertension'
  },
  updateMedicalInfo: (info) => set((state) => ({ medicalInfo: { ...state.medicalInfo, ...info } })),
  isResponder: false,
  toggleResponderMode: () => set((state) => ({ isResponder: !state.isResponder }))
}));

interface ServicesState {
  services: any[];
  setServices: (services: any[]) => void;
}

export const useServicesStore = create<ServicesState>((set) => ({
  services: [],
  setServices: (services) => set({ services })
}));

interface UIState {
  isStressed: boolean;
  setStressed: (stressed: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isStressed: false,
  setStressed: (stressed) => set({ isStressed: stressed })
}));

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

interface NetworkState {
  isLowBandwidth: boolean;
  setLowBandwidth: (isLow: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isLowBandwidth: false,
  setLowBandwidth: (isLow) => set({ isLowBandwidth: isLow })
}));

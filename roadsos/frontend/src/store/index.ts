import { create } from 'zustand';

interface SosState {
  isActive: boolean;
  isTriggering: boolean;
  location: { lat: number; lng: number } | null;
  trackingToken: string | null;
  triggerSos: () => void;
  cancelSos: () => void;
  setLocation: (lat: number, lng: number) => void;
  setTrackingToken: (token: string) => void;
}

export const useSosStore = create<SosState>((set) => ({
  isActive: false,
  isTriggering: false,
  location: null,
  trackingToken: null,
  triggerSos: () => set({ isTriggering: true }),
  cancelSos: () => set({ isTriggering: false, isActive: false }),
  setLocation: (lat, lng) => set({ location: { lat, lng } }),
  setTrackingToken: (token) => set({ trackingToken: token, isActive: true, isTriggering: false })
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

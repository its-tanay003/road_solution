import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { encryptData } from '../utils/crypto';

export * from './hospitalStore';
export type { Hospital } from './hospitalStore';
export * from './blockchainStore';
export * from './distressStore';
export * from './notificationStore';
export * from './trainingStore';
export * from './wearableStore';
export * from './ambulanceStore';

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
      
      // MOCK NOTIFICATION SYSTEM
      setTimeout(() => {
        const contacts = useUserStore.getState().contacts;
        contacts.forEach(contact => {
          if (contact.notifySms || contact.notifyPush) {
            console.log(`[MOCK NOTIFICATION] Alerting ${contact.relationship} (${contact.name}) at ${contact.phone}`);
          }
        });
      }, 1500);
      
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

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  notifySms: boolean;
  notifyPush: boolean;
  notifyEmail: boolean;
}

import { COUNTRY_PROFILES, type CountryProfile } from '../data/countries';

interface UserState {
  language: string;
  countryCode: string;
  activeCountry: CountryProfile;
  setLanguage: (lang: string) => void;
  setCountryCode: (code: string) => void;
  switchCountry: (code: string) => void;
  contacts: EmergencyContact[];
  addContact: (contact: EmergencyContact) => void;
  removeContact: (id: string) => void;
  updateContact: (id: string, contact: Partial<EmergencyContact>) => void;
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
  countryCode: 'IN',
  activeCountry: COUNTRY_PROFILES.IN,
  setLanguage: (lang) => set({ language: lang }),
  setCountryCode: (code) => set({ countryCode: code }),
  switchCountry: (code) => {
    const profile = COUNTRY_PROFILES[code];
    if (profile) {
      set({ 
        countryCode: code, 
        activeCountry: profile,
        language: profile.language 
      });
    }
  },
  contacts: [],
  addContact: (contact) => set((state) => ({ 
    contacts: state.contacts.length < 5 ? [...state.contacts, contact] : state.contacts 
  })),
  removeContact: (id) => set((state) => ({
    contacts: state.contacts.filter(c => c.id !== id)
  })),
  updateContact: (id, contact) => set((state) => ({
    contacts: state.contacts.map(c => c.id === id ? { ...c, ...contact } : c)
  })),
  medicalInfo: {
    bloodGroup: 'O Positive',
    allergies: 'Penicillin',
    conditions: 'Type 2 Diabetes, Hypertension'
  },
  updateMedicalInfo: (info) => set((state) => ({ medicalInfo: { ...state.medicalInfo, ...info } })),
  isResponder: false,
  toggleResponderMode: () => set((state) => ({ isResponder: !state.isResponder }))
}));

interface Service {
  id?: string;
  name: string;
  type: string;
  lat?: number;
  lng?: number;
  phone_primary?: string;
  address?: string;
  distance?: number;
  eta?: string;
}

interface ServicesState {
  services: Service[];
  setServices: (services: Service[]) => void;
}

export const useServicesStore = create<ServicesState>((set) => ({
  services: [],
  setServices: (services) => set({ services })
}));

interface UIState {
  isStressed: boolean;
  setStressed: (stressed: boolean) => void;
  uxMode: 'DEFAULT' | 'COMMAND' | 'EMERGENCY' | 'VOICE' | 'BYSTANDER';
  setUxMode: (mode: 'DEFAULT' | 'COMMAND' | 'EMERGENCY' | 'VOICE' | 'BYSTANDER') => void;
  panicScore: number;
  setPanicScore: (score: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isStressed: false,
  setStressed: (stressed) => set({ isStressed: stressed }),
  uxMode: 'DEFAULT',
  setUxMode: (mode) => set({ uxMode: mode }),
  panicScore: 0,
  setPanicScore: (score) => set({ panicScore: score })
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
  isMeshMode: boolean;
  setLowBandwidth: (isLow: boolean) => void;
  setMeshMode: (isMesh: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isLowBandwidth: false,
  isMeshMode: false,
  setLowBandwidth: (isLow) => set({ isLowBandwidth: isLow }),
  setMeshMode: (isMesh) => set({ isMeshMode: isMesh })
}));

interface DemoState {
  isDemoMode: boolean;
  currentScenario: 'CRASH' | 'RURAL' | 'MULTI' | null;
  aiThinking: string[];
  decisionExplanations: {
    responder: { id: string; reason: string; confidence: number } | null;
    hospital: { name: string; reason: string; confidence: number } | null;
  };
  livesSaved: number;
  avgResponseReduction: number;
  
  setDemoMode: (isDemo: boolean) => void;
  startScenario: (scenario: 'CRASH' | 'RURAL' | 'MULTI') => void;
  addThinkingStep: (step: string) => void;
  clearThinking: () => void;
  setDecisionExplanation: (type: 'responder' | 'hospital', data: { id?: string; name?: string; reason: string; confidence: number }) => void;
  incrementStats: () => void;
}

export const useDemoStore = create<DemoState>((set) => ({
  isDemoMode: false,
  currentScenario: null,
  aiThinking: [],
  decisionExplanations: {
    responder: null,
    hospital: null
  },
  livesSaved: JSON.parse(localStorage.getItem('roadsos_demo_stats') || '{}').livesSaved || 1242,
  avgResponseReduction: JSON.parse(localStorage.getItem('roadsos_demo_stats') || '{}').avgResponseReduction || 35,

  setDemoMode: (isDemo) => set({ isDemoMode: isDemo }),
  startScenario: (scenario) => set({ currentScenario: scenario, aiThinking: [] }),
  addThinkingStep: (step) => set((state) => ({ aiThinking: [...state.aiThinking, step] })),
  clearThinking: () => set({ aiThinking: [] }),
  setDecisionExplanation: (type, data) => set((state) => ({
    decisionExplanations: { ...state.decisionExplanations, [type]: data }
  })),
  incrementStats: () => set((state) => ({ 
    livesSaved: state.livesSaved + 1,
    avgResponseReduction: state.avgResponseReduction + 0.1
  }))
}));

interface EmergencyState {
  goldenHourActive: boolean;
  dispatchConfirmed: boolean;
  setGoldenHourActive: (active: boolean) => void;
  confirmDispatch: () => void;
}

export const useEmergencyStore = create<EmergencyState>((set) => ({
  goldenHourActive: false,
  dispatchConfirmed: false,
  setGoldenHourActive: (active) => set({ goldenHourActive: active, dispatchConfirmed: false }),
  confirmDispatch: () => set({ dispatchConfirmed: true })
}));

interface JudgeIncident {
  id: string;
  name: string;
  location: [number, number];
  timestamp: Date;
  sessionId: string;
}

interface JudgeStore {
  activeIncidents: JudgeIncident[];
  addIncident: (incident: JudgeIncident) => void;
  removeIncident: (id: string) => void;
  clearIncidents: () => void;
}

export const useJudgeStore = create<JudgeStore>((set) => ({
  activeIncidents: [],
  addIncident: (incident) => set((state) => ({ 
    activeIncidents: [incident, ...state.activeIncidents].slice(0, 5) 
  })),
  removeIncident: (id) => set((state) => ({ 
    activeIncidents: state.activeIncidents.filter(i => i.id !== id) 
  })),
  clearIncidents: () => set({ activeIncidents: [] })
}));

interface ChaosLog {
  id: string;
  message: string;
  timestamp: Date;
  type: 'FAIL' | 'RECOVERY' | 'INFO';
}

interface ChaosState {
  internetKilled: boolean;
  backendKilled: boolean;
  latencyMs: number;
  gpsCorrupted: boolean;
  logs: ChaosLog[];
  killInternet: () => void;
  killBackend: () => void;
  setLatency: (ms: number) => void;
  corruptGps: () => void;
  restoreAll: () => void;
  addLog: (message: string, type: ChaosLog['type']) => void;
}

export const useChaosStore = create<ChaosState>((set) => ({
  internetKilled: false,
  backendKilled: false,
  latencyMs: 0,
  gpsCorrupted: false,
  logs: [],
  addLog: (message, type) => set((state) => ({
    logs: [{ id: Math.random().toString(36), message, timestamp: new Date(), type } as ChaosLog, ...state.logs].slice(0, 50)
  })),
  killInternet: () => set((state) => {
    const isKilling = !state.internetKilled;
    const msg = isKilling ? "Internet connection severed. PWA Offline mode active." : "Internet connection restored.";
    const type: ChaosLog['type'] = isKilling ? 'FAIL' : 'RECOVERY';
    return { 
      internetKilled: isKilling,
      logs: [{ id: Math.random().toString(36), message: msg, timestamp: new Date(), type } as ChaosLog, ...state.logs].slice(0, 50)
    };
  }),
  killBackend: () => set((state) => {
    const isKilling = !state.backendKilled;
    const msg = isKilling ? "Backend link terminated. Failover mode engaged." : "Backend handshake re-established.";
    const type: ChaosLog['type'] = isKilling ? 'FAIL' : 'RECOVERY';
    return { 
      backendKilled: isKilling,
      logs: [{ id: Math.random().toString(36), message: msg, timestamp: new Date(), type } as ChaosLog, ...state.logs].slice(0, 50)
    };
  }),
  setLatency: (ms) => set((state) => ({
    latencyMs: ms,
    logs: [{ id: Math.random().toString(36), message: `Artificial latency set to ${ms}ms`, timestamp: new Date(), type: 'INFO' as ChaosLog['type'] } as ChaosLog, ...state.logs].slice(0, 50)
  })),
  corruptGps: () => set((state) => {
    const isCorrupting = !state.gpsCorrupted;
    const msg = isCorrupting ? "GPS Signal degraded. Multipath error injected." : "GPS Signal stabilized.";
    const type: ChaosLog['type'] = isCorrupting ? 'FAIL' : 'RECOVERY';
    return { 
      gpsCorrupted: isCorrupting,
      logs: [{ id: Math.random().toString(36), message: msg, timestamp: new Date(), type } as ChaosLog, ...state.logs].slice(0, 50)
    };
  }),
  restoreAll: () => set((state) => ({
    internetKilled: false,
    backendKilled: false,
    latencyMs: 0,
    gpsCorrupted: false,
    logs: [{ id: Math.random().toString(36), message: "SYSTEM RESTORE: All resilience protocols nominal.", timestamp: new Date(), type: 'RECOVERY' as ChaosLog['type'] } as ChaosLog, ...state.logs].slice(0, 50)
  }))
}));

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
  shift: 'morning' | 'evening' | 'night';
}

interface LeaderboardState {
  responders: Responder[];
  updateResponders: (responders: Responder[]) => void;
  shuffleMetrics: () => void;
}

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  responders: [
    { unitId: "A47", unitType: "ALS", responderName: "Unit Alpha 47", incidentsHandled: 23, avgResponseTime: "3m 42s", aiCollaborationScore: 94, livesImpacted: 11, currentStatus: "AVAILABLE", streak: 7, city: "New Delhi", shift: "morning" },
    { unitId: "B12", unitType: "BLS", responderName: "Guardian 12", incidentsHandled: 19, avgResponseTime: "4m 15s", aiCollaborationScore: 88, livesImpacted: 8, currentStatus: "EN ROUTE", streak: 4, city: "Mumbai", shift: "morning" },
    { unitId: "P09", unitType: "Police", responderName: "Sector-9 Patrol", incidentsHandled: 45, avgResponseTime: "2m 55s", aiCollaborationScore: 72, livesImpacted: 5, currentStatus: "ON SCENE", streak: 2, city: "New Delhi", shift: "evening" },
    { unitId: "F03", unitType: "Fire", responderName: "Station 3 Rescue", incidentsHandled: 31, avgResponseTime: "5m 20s", aiCollaborationScore: 91, livesImpacted: 14, currentStatus: "AVAILABLE", streak: 9, city: "Bangalore", shift: "night" },
    { unitId: "A11", unitType: "ALS", responderName: "Swift Response 11", incidentsHandled: 15, avgResponseTime: "4m 02s", aiCollaborationScore: 84, livesImpacted: 6, currentStatus: "AVAILABLE", streak: 3, city: "New Delhi", shift: "morning" },
    { unitId: "B88", unitType: "BLS", responderName: "Unit Bravo 88", incidentsHandled: 12, avgResponseTime: "6m 10s", aiCollaborationScore: 61, livesImpacted: 3, currentStatus: "ON SCENE", streak: 1, city: "Mumbai", shift: "evening" }
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

interface DroneState {
  drones: Drone[];
  dispatchDrone: (droneId: string, targetLat: number, targetLng: number) => void;
  updateDronePos: (droneId: string, lat: number, lng: number) => void;
  toggleCamera: (droneId: string) => void;
}

export const useDroneStore = create<DroneState>((set) => ({
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

interface AccessibilityState {
  isDyslexic: boolean;
  isReducedMotion: boolean;
  isHighContrast: boolean;
  isSimpleLanguage: boolean;
  setDyslexic: (val: boolean) => void;
  setReducedMotion: (val: boolean) => void;
  setHighContrast: (val: boolean) => void;
  setSimpleLanguage: (val: boolean) => void;
}

export const useAccessibilityStore = create<AccessibilityState>((set) => ({
  isDyslexic: false,
  isReducedMotion: false,
  isHighContrast: false,
  isSimpleLanguage: false,
  setDyslexic: (val) => {
    set({ isDyslexic: val });
    document.body.classList.toggle('dyslexic', val);
  },
  setReducedMotion: (val) => set({ isReducedMotion: val }),
  setHighContrast: (val) => set({ isHighContrast: val }),
  setSimpleLanguage: (val) => set({ isSimpleLanguage: val }),
}));

export interface Debrief {
  id: string;
  incidentId: string;
  timestamp: string;
  content: string;
}

interface DebriefState {
  debriefs: Debrief[];
  saveDebrief: (debrief: Debrief) => void;
  getDebrief: (id: string) => Debrief | undefined;
}

export const useDebriefStore = create<DebriefState>()(
  persist(
    (set, get) => ({
      debriefs: [],
      saveDebrief: (debrief) => set((state) => ({ debriefs: [...state.debriefs, debrief] })),
      getDebrief: (id) => get().debriefs.find(d => d.id === id)
    }),
    {
      name: 'roadsos-debriefs'
    }
  )
);

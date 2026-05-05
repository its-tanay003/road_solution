import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { encryptData } from '../utils/crypto';

import { useNotificationStore } from '../store/notificationStore';
import { useAmbulanceStore } from '../store/ambulanceStore';
import { useWearableStore } from '../store/wearableStore';
import { runOfflineTriage } from '../lib/offlineTriage';
import { notifyNearbyResponders } from '../lib/pushService';

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
  india112Alerted: boolean;
  offlineQueue: Record<string, unknown>[];
  closedIncidents: any[];
  triggerSos: () => void;
  startCountdown: () => void;
  cancelCountdown: () => void;
  decrementCountdown: () => void;
  cancelSos: () => void;
  setLocation: (lat: number, lng: number) => void;
  setTrackingToken: (token: string) => void;
  updateDeliveryStatus: (channel: 'internet' | 'sms' | 'mesh', status: string) => void;
  syncOfflineQueue: () => Promise<void>;
}

export const useSosStore = create<SosState>()(
  persist(
    (set, get) => ({
      isActive: false,
      isTriggering: false,
      location: null,
      trackingToken: null,
      countdownActive: false,
      countdownTime: 10,
      india112Alerted: false,
      offlineQueue: [],
      closedIncidents: JSON.parse(localStorage.getItem('roadsos_closed_incidents') || '[]'),
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
          const loc = state.location || { lat: 28.6139, lng: 77.2090 };
          
          const rawMedicalProfile = useUserStore.getState().medicalInfo;
          const medicalProfile = await encryptData(rawMedicalProfile);

          const blackboxData = JSON.parse(localStorage.getItem('roadsos_blackbox_crash') || '[]');
          const isStressed = useUIStore.getState().isStressed;
          const emotionalState = isStressed ? 'panic' : 'normal';

          const payload = {
            deviceId: 'device-1234',
            lat: loc.lat,
            lng: loc.lng,
            medicalProfile,
            contactPhones: useUserStore.getState().contacts.map(c => c.phone),
            blackboxData,
            emotionalState,
            networkCondition: useNetworkStore.getState().isLowBandwidth ? 'poor' : 'good'
          };

          if (!navigator.onLine || useChaosStore.getState().internetKilled) {
            set((state) => ({
              offlineQueue: [...state.offlineQueue, payload],
              trackingToken: 'OFFLINE-' + Math.random().toString(36).substring(7),
              isActive: true,
              isTriggering: false,
              countdownActive: true,
              countdownTime: 240,
              deliveryStatus: { ...state.deliveryStatus, internet: 'FAILED', mesh: 'PENDING' }
            }));
            
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
              const registration = await navigator.serviceWorker.ready;
              try {
                await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-incident-queue');
              } catch (e) {
                console.error('Background Sync not supported', e);
              }
            }
            return;
          }

          const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/sos/trigger`, payload);
          
          // MOCK NOTIFICATION SYSTEM
          setTimeout(() => {
            const contacts = useUserStore.getState().contacts;
            contacts.forEach(contact => {
              if (contact.notifySms || contact.notifyPush) {
                console.log(`[MOCK NOTIFICATION] Alerting ${contact.relationship} (${contact.name}) at ${contact.phone}`);
              }
            });
          }, 1500);
          
          if (useUserStore.getState().countryCode === 'IN') {
            try {
              await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/sos/112`, {
                lat: loc.lat,
                lng: loc.lng,
                severityLevel: 'HIGH',
                vehicleType: 'Car'
              });
              set({ india112Alerted: true });
            } catch (e) {
              console.error('Failed to trigger 112 simulation', e);
            }
          }
          
          set({ 
            trackingToken: response.data.token, 
            isActive: true, 
            isTriggering: false,
            countdownActive: true,
            countdownTime: 240
          });

          // Alert Nearby Responders Proactively
          const nearbyResponders = useLeaderboardStore.getState().responders;
          notifyNearbyResponders(loc, "NH-48", nearbyResponders);
        } catch (error) {
          console.error('Failed to trigger SOS on backend', error);
          set({ isTriggering: false });
        }
      },
      syncOfflineQueue: async () => {
        const queue = get().offlineQueue;
        if (queue.length === 0) return;
        console.log(`Syncing ${queue.length} offline incidents...`);
        for (const payload of queue) {
          try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/sos/trigger`, payload);
          } catch (e) {
            console.error('Failed to sync offline incident', e);
          }
        }
        set({ offlineQueue: [] });
      },
      cancelSos: () => {
        const state = get();
        if (state.isActive) {
          const newIncident = {
            id: state.trackingToken || `INC-${Date.now()}`,
            timestamp: Date.now(),
            location: state.location,
            severity: 'CRITICAL', // Simulated for history
            behaviorScore: 65 + Math.random() * 30, // Simulated
            telemetry: JSON.parse(localStorage.getItem('roadsos_blackbox_crash') || '[]')
          };
          const updatedClosed = [newIncident, ...state.closedIncidents].slice(0, 10);
          set({ closedIncidents: updatedClosed });
          localStorage.setItem('roadsos_closed_incidents', JSON.stringify(updatedClosed));
        }
        
        set({ 
          isTriggering: false, 
          isActive: false, 
          trackingToken: null,
          countdownActive: false,
          india112Alerted: false,
          deliveryStatus: { internet: 'PENDING', sms: 'PENDING', mesh: 'PENDING' }
        });
      },
      setLocation: (lat, lng) => set({ location: { lat, lng } }),
      setTrackingToken: (token) => set({ trackingToken: token, isActive: true, isTriggering: false }),
      updateDeliveryStatus: (channel, status) => set((state) => ({
        deliveryStatus: {
          ...state.deliveryStatus,
          [channel]: status
        }
      }))
    }),
    {
      name: 'roadsos-sos-store',
      partialize: (state) => ({ offlineQueue: state.offlineQueue })
    }
  )
);

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
import i18n from '../i18n/config';

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
  primaryEmergencyContact: string | null;
  setPrimaryEmergencyContact: (phone: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      language: 'en',
      countryCode: 'IN',
      activeCountry: COUNTRY_PROFILES.IN,
      primaryEmergencyContact: null,
      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
      setCountryCode: (code) => set({ countryCode: code }),
      switchCountry: (code) => {
        const profile = COUNTRY_PROFILES[code];
        if (profile) {
          i18n.changeLanguage(profile.language);
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
      toggleResponderMode: () => set((state) => ({ isResponder: !state.isResponder })),
      setPrimaryEmergencyContact: (phone) => set({ primaryEmergencyContact: phone })
    }),
    {
      name: 'roadsos-user-settings'
    }
  )
);

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
  uxMode: 'DEFAULT' | 'COMMAND' | 'EMERGENCY' | 'VOICE' | 'BYSTANDER' | 'PANIC';
  setUxMode: (mode: 'DEFAULT' | 'COMMAND' | 'EMERGENCY' | 'VOICE' | 'BYSTANDER' | 'PANIC') => void;
  isCrackedScreen: boolean;
  setCrackedScreen: (isCracked: boolean) => void;
  isGloveMode: boolean;
  setGloveMode: (isGlove: boolean) => void;
  panicScore: number;
  setPanicScore: (score: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isStressed: false,
  setStressed: (stressed) => set({ isStressed: stressed }),
  uxMode: 'DEFAULT',
  setUxMode: (mode) => set({ uxMode: mode }),
  panicScore: 0,
  setPanicScore: (score) => set({ panicScore: score }),
  isCrackedScreen: false,
  setCrackedScreen: (val) => set({ isCrackedScreen: val }),
  isGloveMode: false,
  setGloveMode: (val) => set({ isGloveMode: val }),
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
  isOrchestrating: boolean;
  scenarioStep: number;
  scenarioTime: number;
  isPaused: boolean;
  playbackSpeed: number;
  isScreenshotMode: boolean;
  isPresentationMode: boolean;
  showShortcuts: boolean;
  
  setDemoMode: (isDemo: boolean) => void;
  startScenario: (scenario: 'CRASH' | 'RURAL' | 'MULTI') => void;
  setOrchestrating: (val: boolean) => void;
  setScenarioStep: (step: number) => void;
  setScenarioTime: (time: number) => void;
  addThinkingStep: (step: string) => void;
  clearThinking: () => void;
  setDecisionExplanation: (type: 'responder' | 'hospital', data: { id?: string; name?: string; reason: string; confidence: number }) => void;
  incrementStats: () => void;
  triggerScenario: (id: number) => void;
  resetAll: () => void;
  setPaused: (val: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setScreenshotMode: (val: boolean) => void;
  togglePause: () => void;
  setSpeed: (speed: number) => void;
  toggleScreenshot: () => void;
  togglePresentationMode: () => void;
  toggleShortcuts: (val?: boolean) => void;
  vaahanData: {
    plate: string;
    model: string;
    owner: string;
    insurance: string;
    puc: string;
    status: 'IDLE' | 'SEARCHING' | 'FOUND';
  };
  setVaahanStatus: (status: 'IDLE' | 'SEARCHING' | 'FOUND') => void;
}

export const useDemoStore = create<DemoState>((set, get) => ({
  isDemoMode: false,
  currentScenario: null,
  aiThinking: [],
  decisionExplanations: {
    responder: null,
    hospital: null
  },
  livesSaved: JSON.parse(localStorage.getItem('roadsos_demo_stats') || '{}').livesSaved || 1242,
  avgResponseReduction: JSON.parse(localStorage.getItem('roadsos_demo_stats') || '{}').avgResponseReduction || 35,
  isOrchestrating: false,
  scenarioStep: 0,
  scenarioTime: 0,
  isPaused: false,
  playbackSpeed: 1,
  isScreenshotMode: false,
  isPresentationMode: false,
  showShortcuts: false,
  vaahanData: {
    plate: 'TN 09 AZ 4521',
    model: 'Maruti Suzuki Swift VXI (2019)',
    owner: 'RAJESH KUMAR (NAME_WITHHELD)',
    insurance: 'VALID (MAR 2026)',
    puc: 'VALID (NOV 2025)',
    status: 'IDLE'
  },

  setDemoMode: (isDemo) => set({ isDemoMode: isDemo }),
  startScenario: (scenario) => set({ currentScenario: scenario, aiThinking: [], scenarioStep: 0, scenarioTime: 0 }),
  setOrchestrating: (val) => set({ isOrchestrating: val }),
  setScenarioStep: (step) => set({ scenarioStep: step }),
  setScenarioTime: (time) => set({ scenarioTime: time }),
  addThinkingStep: (step) => set((state) => ({ aiThinking: [...state.aiThinking, step] })),
  clearThinking: () => set({ aiThinking: [] }),
  setDecisionExplanation: (type, data) => set((state) => ({
    decisionExplanations: { ...state.decisionExplanations, [type]: data }
  })),
  incrementStats: () => set((state) => ({ 
    livesSaved: state.livesSaved + 1,
    avgResponseReduction: state.avgResponseReduction + 0.1
  })),
  setPaused: (isPaused) => set({ isPaused }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setScreenshotMode: (isScreenshotMode) => set({ isScreenshotMode }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setSpeed: (speed) => set({ playbackSpeed: speed }),
  toggleScreenshot: () => set((state) => ({ isScreenshotMode: !state.isScreenshotMode })),
  togglePresentationMode: () => set((state) => ({ isPresentationMode: !state.isPresentationMode })),
  toggleShortcuts: (val) => set((state) => ({ showShortcuts: val !== undefined ? val : !state.showShortcuts })),
  setVaahanStatus: (status) => set((state) => ({ vaahanData: { ...state.vaahanData, status } })),
  resetAll: () => {
    useSosStore.getState().cancelSos();
    useEmergencyStore.getState().setGoldenHourActive(false);
    useEmergencyStore.getState().setCrashDetectedAt(null);
    useEmergencyStore.getState().setCrashTriggered(false);
    useUIStore.getState().setStressed(false);
    useUIStore.getState().setUxMode('DEFAULT');
    useNetworkStore.getState().setMeshMode(false);
    useNotificationStore.getState().clearAll();
    set({ currentScenario: null, aiThinking: [], isOrchestrating: false, scenarioStep: 0, scenarioTime: 0, isPaused: false });
  },
  triggerScenario: (id) => {
    const { resetAll, startScenario, setOrchestrating, setScenarioStep, playbackSpeed } = get();
    resetAll();
    setOrchestrating(true);

    const speedFactor = 1 / playbackSpeed;

    if (id === 1) {
      startScenario('CRASH');
      const emergencyStore = useEmergencyStore.getState();
      const sosStore = useSosStore.getState();
      const uiStore = useUIStore.getState();
      const ambulanceStore = useAmbulanceStore.getState();

      // t=0
      emergencyStore.setGForceData({ x: 12.4, y: 2.1, z: -3.2 });
      useWearableStore.getState().updateHealthData({ spO2: 89 }); // Trigger rule-based fallback
      emergencyStore.setCrashTriggered(true);
      emergencyStore.setCrashDetectedAt(Date.now());
      setScenarioStep(1);

      // t=1: SOS countdown
      setTimeout(() => {
        if (get().isPaused) return;
        sosStore.startCountdown();
        uiStore.setStressed(true);
        setScenarioStep(2);
      }, 1000 * speedFactor);

      // t=11: Dispatch
      setTimeout(() => {
        if (get().isPaused) return;
        sosStore.triggerSos();
        useNotificationStore.getState().addNotification({
          type: 'CRITICAL',
          title: 'AMBULANCE DISPATCHED',
          message: 'Unit MH-108-A47 en route to Urban Crash scene.'
        });
        setScenarioStep(3);
      }, 11000 * speedFactor);

      // t=12: Golden Hour
      setTimeout(() => {
        if (get().isPaused) return;
        emergencyStore.setGoldenHourActive(true);
        setScenarioStep(4);
      }, 12000 * speedFactor);

      // t=14: AI Stream
      setTimeout(() => {
        if (get().isPaused) return;
        const thinking = ["Analyzing collision impact...", "Retrieving medical history...", "Calculating optimal trauma center...", "Alerting neurosurgery team..."];
        thinking.forEach((step, i) => setTimeout(() => get().addThinkingStep(step), i * 1000 * speedFactor));
        setScenarioStep(5);
      }, 14000 * speedFactor);

      // t=20: Biometrics erratic
      setTimeout(() => {
        if (get().isPaused) return;
        setScenarioStep(6);
      }, 20000 * speedFactor);

      // t=25: Ambulance moves
      setTimeout(() => {
        if (get().isPaused) return;
        ambulanceStore.dispatchAmbulance("MH-108-A47", [[12.9716, 77.5946], [12.9719, 77.5949], [12.9725, 77.5955]], 120, 1500 * speedFactor);
        setScenarioStep(7);
      }, 25000 * speedFactor);
    }

    if (id === 2) {
      startScenario('RURAL');
      useNetworkStore.getState().setMeshMode(true);
      setScenarioStep(1);
      setTimeout(() => setScenarioStep(2), 4000);
      setTimeout(() => setScenarioStep(3), 8000);
      setTimeout(() => {
        useNetworkStore.getState().setMeshMode(false);
        setScenarioStep(4);
      }, 15000);
    }

    if (id === 3) {
      startScenario('MULTI');
      setScenarioStep(1);
      setTimeout(() => {
        useNotificationStore.getState().addNotification({
          type: 'HIGH',
          title: 'BYSTANDER REPORT',
          message: 'Video feed received from bystander at scene.'
        });
        setScenarioStep(2);
      }, 4000);
      setTimeout(() => setScenarioStep(3), 8000);
      setTimeout(() => setScenarioStep(4), 12000);
    }

    if (id === 4) {
      resetAll();
    }
  }
}));

interface EmergencyState {
  goldenHourActive: boolean;
  dispatchConfirmed: boolean;
  crashDetectedAt: number | null;
  goldenHourExpired: boolean;
  crashTriggered: boolean;
  gForceData: { x: number; y: number; z: number };
  setGoldenHourActive: (active: boolean) => void;
  setGoldenHourExpired: (expired: boolean) => void;
  confirmDispatch: () => void;
  setCrashDetectedAt: (time: number | null) => void;
  setCrashTriggered: (triggered: boolean) => void;
  setGForceData: (data: { x: number; y: number; z: number }) => void;
}

export const useEmergencyStore = create<EmergencyState>((set) => ({
  goldenHourActive: false,
  dispatchConfirmed: false,
  crashDetectedAt: null,
  goldenHourExpired: false,
  crashTriggered: false,
  gForceData: { x: 0, y: 0, z: 0 },
  setGoldenHourActive: (active) => set({ 
    goldenHourActive: active, 
    dispatchConfirmed: false,
    goldenHourExpired: false,
    crashTriggered: false
  }),
  setGoldenHourExpired: (expired) => set({ goldenHourExpired: expired }),
  confirmDispatch: () => set({ dispatchConfirmed: true }),
  setCrashDetectedAt: (time) => set({ crashDetectedAt: time }),
  setCrashTriggered: (triggered) => set({ crashTriggered: triggered }),
  setGForceData: (data) => set({ gForceData: data })
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
  theme: 'light' | 'dark' | 'high-contrast';
  textSize: 'small' | 'medium' | 'large' | 'xl';
  fontStyle: 'system' | 'rounded' | 'bold';
  isReducedMotion: boolean;
  isDyslexic: boolean;
  isHighContrast: boolean;
  isSimpleLanguage: boolean;
  sosTriggerMode: 'hold' | 'tap' | 'voice';
  onboardingComplete: boolean;
  
  setTheme: (theme: 'light' | 'dark' | 'high-contrast') => void;
  setTextSize: (size: 'small' | 'medium' | 'large' | 'xl') => void;
  setFontStyle: (style: 'system' | 'rounded' | 'bold') => void;
  setReducedMotion: (val: boolean) => void;
  setDyslexic: (val: boolean) => void;
  setHighContrast: (val: boolean) => void;
  setSimpleLanguage: (val: boolean) => void;
  setSosTriggerMode: (mode: 'hold' | 'tap' | 'voice') => void;
  setOnboardingComplete: (val: boolean) => void;
}

const fontSizeMap = {
  small: '14px',
  medium: '16px',
  large: '20px',
  xl: '24px'
};

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      theme: 'light',
      textSize: 'medium',
      fontStyle: 'system',
      isReducedMotion: false,
      isDyslexic: false,
      isHighContrast: false,
      isSimpleLanguage: false,
      sosTriggerMode: 'hold',
      onboardingComplete: false,

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },
      setTextSize: (textSize) => {
        set({ textSize });
        document.documentElement.style.setProperty('--base-font-size', fontSizeMap[textSize]);
      },
      setFontStyle: (fontStyle) => {
        set({ fontStyle });
        document.documentElement.setAttribute('data-font', fontStyle);
      },
      setReducedMotion: (isReducedMotion) => {
        set({ isReducedMotion });
        document.documentElement.setAttribute('data-reduce-motion', String(isReducedMotion));
      },
      setDyslexic: (isDyslexic) => set({ isDyslexic }),
      setHighContrast: (isHighContrast) => {
        set({ isHighContrast });
        document.documentElement.setAttribute('data-high-contrast', String(isHighContrast));
      },
      setSimpleLanguage: (isSimpleLanguage) => set({ isSimpleLanguage }),
      setSosTriggerMode: (sosTriggerMode) => set({ sosTriggerMode }),
      setOnboardingComplete: (onboardingComplete) => set({ onboardingComplete }),
    }),
    {
      name: 'roadsos-accessibility-settings'
    }
  )
);

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

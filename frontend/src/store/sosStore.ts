import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from '../lib/axios';
import { useNotificationStatusStore } from './notificationStatusStore';
import { useUserStore } from './userStore';
import { useWearableStore } from './wearableStore';
import { buildSOSMessage } from '../utils/whatsappNotify';
import { socket } from '../lib/socket';

import { type iRADReport } from '../lib/iradReporter';

export type SosStatus = 
  | 'idle' | 'detecting' | 'confirming' | 'alerting' | 'resolved' | 'cancelled'
  | 'countdown' | 'active' | 'dispatched' 
  | 'IDLE' | 'TRIGGERED' | 'DISPATCH' | 'RESOLVED' | 'GOLDEN_HOUR';

export type CrashType = 
  | 'impact' | 'rollover' | 'sudden_stop' | 'manual'
  | 'urban' | 'rural' | 'highway' | 'gforce' | 'voice'
  | null;

export interface DistressEvent {
  id: string;
  type: CrashType | string;
  timestamp: number;
  location?: { lat: number; lng: number };
  severity?: number;
  gForce?: number;
  description?: string;
  weight?: number;
}

export interface AlertData {
  id: string;
  status?: SosStatus;
  contactsNotified?: string[];
  servicesDispatched?: string[];
  incidentId?: string;
  lat?: number;
  lng?: number;
  severity?: 'CRITICAL' | 'SERIOUS' | 'MODERATE' | 'MINOR' | string;
  timestamp?: number | string;
  victimName?: string;
  bloodType?: string;
  message?: string;
  user?: Record<string, unknown>;
  distance?: number | string;
  type?: string;
  [key: string]: unknown;
}

export interface IradReport extends iRADReport {
  ackId?: string;
  status?: 'pending' | 'submitted' | 'acknowledged';
}

export interface ClosedIncident {
  id: string;
  closedAt: number;
  openedAt: number;
  severity: 'CRITICAL' | 'SERIOUS' | 'MODERATE' | 'MINOR' | string;
  location: { lat: number; lng: number } | string;
  aiTriageSummary?: string;
  responderName?: string;
  hospitalName?: string;
  responseTimeSeconds?: number;
  driverBehaviorScore?: number;
  behaviorScore?: number;
  iradReportId?: string;
  insuranceClaimId?: string;
  timestamp?: string | number;
  weather?: Record<string, unknown>;
  triageScore?: number;
  timeline?: Array<{ time: number; event: string }>;
  [key: string]: unknown;
}


export interface DispatchUnit {
  unitId: string;
  type: string;
  status: string;
  driverName: string;
  driverPhone: string;
}

export interface Dispatch108 {
  dispatchId: string;
  unit: DispatchUnit;
  eta: string;
  distanceKm: number;
  currentLat: number;
  currentLng: number;
}

export interface SosState {
  // Core Status
  isActive: boolean;
  sosActive: boolean; // Alias for isActive (backward compatibility)
  status: SosStatus;
  crashType: CrashType;
  countdown: number;
  incidentId: string | null;
  currentIncidentId: string | null; // Alias for incidentId (backward compatibility)
  crashDetectedAt: number | null;
  crashTriggered: boolean;
  dispatch108: Dispatch108 | boolean;
  countdownTime: number; // Alias for countdown
  
  // Distress Engine (Merged from distressStore)
  isDistressEngineActive: boolean;
  distressScore: number;
  distressEvents: DistressEvent[];
  uiSimplified: boolean;
  autoPromptActive: boolean;

  // Nearby Alerts (Merged from alertStore)
  activeAlert: AlertData | null;
  
  // Dispatch Info
  isDispatched: boolean;
  dispatchData: Record<string, unknown> | null;
  dispatchConfirmed: boolean;
  
  // Golden Hour
  goldenHourActive: boolean;
  goldenHourExpired: boolean;
  
  // Physics/Sensor Data
  gForceData: { x: number; y: number; z: number };
  location: { lat: number; lng: number } | null;
  india112Alerted: boolean;
  
  // Actions
  setCountdown: (count: number) => void;
  setCrashType: (type: CrashType) => void;
  triggerSOS: (incidentId?: string) => Promise<void>;
  triggerSos: (incidentId?: string) => Promise<void>; // Alias
  cancelSOS: () => void;
  cancelSos: () => void; // Alias for cancelSOS
  cancelCountdown: () => void; // Alias for cancelSOS
  confirmDispatch: (data: Record<string, unknown>) => void;
  resolveIncident: () => void;
  decrementCountdown: () => void;
  
  setGoldenHourActive: (active: boolean) => void;
  setGoldenHourExpired: (expired: boolean) => void;
  setGForceData: (data: { x: number; y: number; z: number }) => void;
  setCrashTriggered: (triggered: boolean) => void;
  setCrashDetectedAt: (time: number | null) => void;
  startCountdown: () => void;
  updateIradReport: (report: Record<string, unknown>, ackId: string) => void;
  setLocation: (loc: { lat: number; lng: number }) => void;
  startRescueLoop: (id: string) => void;
  updateDispatchPosition: (lat: number, lng: number, etaSeconds: number, status: string) => void;

  // Distress Actions
  toggleDistressEngine: (active: boolean) => void;
  addDistressEvent: (type: string, weight: number) => void;
  recalculateDistress: () => void;
  dismissAutoPrompt: () => void;
  clearDistressEvents: () => void;

  // Alert Actions
  triggerNearbyAlert: (alert: AlertData) => void;
  clearNearbyAlert: () => void;

  // Computed/Derived States
  countdownActive: boolean;
  isTriggering: boolean;
  iradAckId: string | null;
  iradReport: IradReport | null;
  closedIncidents: ClosedIncident[];
}

const DISTRESS_ROLLING_WINDOW_MS = 30000;

export const useSosStore = create<SosState>()(
  persist(
    (set, get) => ({
      isActive: false,
      sosActive: false,
      status: 'IDLE',
      crashType: null,
      countdown: 10,
      incidentId: null,
      currentIncidentId: null,
      crashDetectedAt: null,
      crashTriggered: false,
      dispatch108: false,
      countdownTime: 10,
      
      // Distress Defaults
      isDistressEngineActive: false,
      distressScore: 0,
      distressEvents: [],
      uiSimplified: false,
      autoPromptActive: false,

      // Alert Defaults
      activeAlert: null,

      isDispatched: false,
      dispatchData: null,
      dispatchConfirmed: false,
      
      goldenHourActive: false,
      goldenHourExpired: false,
      
      gForceData: { x: 0, y: 0, z: 0 },
      location: { lat: 12.9716, lng: 77.5946 }, // Default to Bangalore
      iradReport: null,
      iradAckId: null,
      india112Alerted: false,
      countdownActive: false,
      isTriggering: false,
      closedIncidents: [],

      setCountdown: (count) => set({ countdown: count, countdownTime: count }),
      setCrashType: (type) => set({ crashType: type }),

      triggerSOS: async (manualIncidentId) => {
        const id = manualIncidentId || `INC-${Math.random().toString(36).substring(7).toUpperCase()}`;
        
        set({
          isActive: true,
          sosActive: true,
          status: 'TRIGGERED',
          incidentId: id,
          currentIncidentId: id,
          crashDetectedAt: Date.now(),
          goldenHourActive: true,
          isDispatched: false,
          dispatchConfirmed: false,
          crashTriggered: true,
          countdownActive: true,
          isTriggering: true
        });

        const statusStore = useNotificationStatusStore.getState();
        statusStore.resetAll();

        // 1. NEARBY BROADCAST
        statusStore.updateStatus('NEARBY', 'SENDING');
        try {
          socket.emit('emergency:nearby_broadcast', {
            incidentId: id,
            location: { lat: 28.6139, lng: 77.2090 }
          });
          statusStore.updateStatus('NEARBY', 'SENT');
        } catch {
          statusStore.updateStatus('NEARBY', 'FAILED', 'Socket Error');
        }

        // 2. PUSH NOTIFICATIONS
        statusStore.updateStatus('PUSH', 'SENDING');
        try {
          await axios.post('/api/sos/notify-push', { incidentId: id });
          statusStore.updateStatus('PUSH', 'SENT');
        } catch {
          statusStore.updateStatus('PUSH', 'FAILED');
        }

        // 3. WHATSAPP SEQUENTIAL LOOP
        const contacts = useUserStore.getState().contacts;
        const wearable = useWearableStore.getState().health;
        const devices = useWearableStore.getState().devices;
        const watch = devices.find(d => d.type === 'WATCH');
        const user = useUserStore.getState();
        
        statusStore.updateStatus('WHATSAPP', 'SENDING');

        const dispatchWhatsApp = async () => {
          for (let i = 0; i < contacts.length; i++) {
            if (!get().isActive) return;

            const contact = contacts[i];
            if (!contact.alertViaWhatsApp) continue;

            const message = buildSOSMessage(
              user.name || 'User',
              { lat: 28.6139, lng: 77.2090 },
              { name: 'Emergency Services', eta: 8 },
              wearable ? { 
                hr: wearable.bpmHistory[wearable.bpmHistory.length - 1]?.value || 0, 
                spO2: wearable.spO2, 
                battery: watch?.battery || 0 
              } : undefined
            );

            try {
              await axios.post('/api/sos/notify-whatsapp', {
                phone: contact.phone,
                message: decodeURIComponent(message)
              });
              statusStore.updateStatus('WHATSAPP', 'SENT', `Notified ${contact.name}`);
            } catch {
              statusStore.updateStatus('WHATSAPP', 'FAILED', `Error: ${contact.name}`);
            }

            if (i < contacts.length - 1) {
              await new Promise(r => setTimeout(r, 10000));
            }
          }
          if (get().isActive) statusStore.updateStatus('WHATSAPP', 'DELIVERED');
        };

        dispatchWhatsApp();

        // 4. INDIA 112
        if (user.countryCode === 'IN') {
          statusStore.updateStatus('INDIA_112', 'SENDING');
          try {
            await axios.post('/api/sos/112', { incidentId: id });
            set({ india112Alerted: true });
            statusStore.updateStatus('INDIA_112', 'SENT');
          } catch {
            statusStore.updateStatus('INDIA_112', 'FAILED');
          }
        }

        // 5. SMS BACKUP (20s)
        setTimeout(async () => {
          if (get().isActive) {
            statusStore.updateStatus('SMS', 'SENDING');
            try {
              await axios.post('/api/sos/notify-sms', { incidentId: id });
              statusStore.updateStatus('SMS', 'SENT');
            } catch {
              statusStore.updateStatus('SMS', 'FAILED');
            }
          }
        }, 20000);
      },

      cancelSOS: () => {
        set({
          isActive: false,
          sosActive: false,
          status: 'IDLE',
          crashType: null,
          incidentId: null,
          currentIncidentId: null,
          crashDetectedAt: null,
          isDispatched: false,
          dispatchConfirmed: false,
          goldenHourActive: false,
          goldenHourExpired: false,
          crashTriggered: false
        });
        useNotificationStatusStore.getState().resetAll();
      },

      cancelSos: () => get().cancelSOS(),
      cancelCountdown: () => get().cancelSOS(),
      triggerSos: (id) => get().triggerSOS(id),

      decrementCountdown: () => set((state) => ({ 
        countdown: Math.max(0, state.countdown - 1),
        countdownTime: Math.max(0, state.countdownTime - 1)
      })),

      confirmDispatch: (data) => set({
        status: 'DISPATCH',
        isDispatched: true,
        dispatchConfirmed: true,
        dispatchData: data,
        isTriggering: false,
        countdownActive: false
      }),

      resolveIncident: () => set({
        isActive: false,
        sosActive: false,
        status: 'RESOLVED',
        goldenHourActive: false,
        isTriggering: false,
        countdownActive: false
      }),

      setGoldenHourActive: (active) => set({ goldenHourActive: active }),
      setGoldenHourExpired: (expired) => set({ goldenHourExpired: expired }),
      setGForceData: (data) => set({ gForceData: data }),
      setCrashTriggered: (triggered) => set({ crashTriggered: triggered }),
      setCrashDetectedAt: (time) => set({ crashDetectedAt: time }),

      startCountdown: () => set({ 
        countdown: 10, 
        countdownTime: 10,
        status: 'TRIGGERED', 
        countdownActive: true, 
        isTriggering: true 
      }),
      
      updateIradReport: (report, ackId) => set({ 
        iradReport: { ...report, ackId } as unknown as IradReport,
        iradAckId: ackId
      }),

      setLocation: (location) => set({ location }),

      startRescueLoop: (id) => {
        set({ status: 'GOLDEN_HOUR', goldenHourActive: true, incidentId: id, currentIncidentId: id, sosActive: true, isActive: true });
      },

      updateDispatchPosition: (lat, lng, etaSeconds, status) => set((state) => {
        if (!state.dispatch108 || typeof state.dispatch108 === 'boolean') return state;
        
        // Complex ETA object logic
        const etaDisplay = `${Math.floor(etaSeconds / 60)}m`;
        
        return {
          dispatch108: {
            ...state.dispatch108,
            currentLat: lat,
            currentLng: lng,
            eta: etaDisplay, // Assuming string eta based on Dispatch108 interface
            unit: {
              ...state.dispatch108.unit,
              status
            }
          }
        };
      }),

      // Distress Actions
      toggleDistressEngine: (active) => set({ 
        isDistressEngineActive: active, 
        distressScore: 0, 
        distressEvents: [], 
        uiSimplified: false, 
        autoPromptActive: false 
      }),

      addDistressEvent: (type, weight) => {
        const { isDistressEngineActive } = get();
        if (!isDistressEngineActive) return;

        set((state) => {
          const newEvent: DistressEvent = { 
            id: `EV-${Math.random().toString(36).substring(7)}`,
            type, 
            weight, 
            timestamp: Date.now() 
          };
          return {
            distressEvents: [...state.distressEvents, newEvent]
          };
        });
        get().recalculateDistress();
      },

      recalculateDistress: () => {
        const { distressEvents, isDistressEngineActive, autoPromptActive } = get();
        if (!isDistressEngineActive) return;

        const now = Date.now();
        const validEvents = distressEvents.filter(e => now - e.timestamp <= DISTRESS_ROLLING_WINDOW_MS);
        
        let newScore = validEvents.reduce((sum, e) => sum + (e.weight || 0), 0);
        newScore = Math.min(Math.max(0, newScore), 100);

        const uiSimplified = newScore >= 61;
        const newAutoPrompt = autoPromptActive || newScore >= 86;

        set({
          distressEvents: validEvents,
          distressScore: newScore,
          uiSimplified,
          autoPromptActive: newAutoPrompt
        });
      },

      dismissAutoPrompt: () => set({ autoPromptActive: false }),
      clearDistressEvents: () => set({ distressEvents: [], distressScore: 0, uiSimplified: false, autoPromptActive: false }),

      // Alert Actions
      triggerNearbyAlert: (alert) => set({ activeAlert: alert }),
      clearNearbyAlert: () => set({ activeAlert: null })
    }),
    {
      name: 'yirc-sos-store'
    }
  )
);

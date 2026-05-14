import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from '../lib/axios';
import { useNotificationStatusStore } from './notificationStatusStore';
import { useUserStore } from './userStore';
import { useWearableStore } from './wearableStore';
import { buildSOSMessage } from '../utils/whatsappNotify';
import { socket } from '../lib/socket';

export type SosStatus = 'IDLE' | 'TRIGGERED' | 'DISPATCH' | 'GOLDEN_HOUR' | 'RESOLVED';
export type CrashType = 'MAJOR' | 'MINOR' | 'SYSTEM_FAIL' | null;

interface SosState {
  // Core Status
  isActive: boolean;
  sosActive: boolean; // Alias for isActive (backward compatibility)
  status: SosStatus;
  crashType: CrashType;
  countdown: number;
  incidentId: string | null;
  currentIncidentId: string | null; // Alias for incidentId (backward compatibility)
  crashDetectedAt: number | null;
  crashTriggered: boolean; // Added for backward compatibility
  
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
  iradReport: Record<string, unknown> | null;
  
  // Actions
  setCountdown: (count: number) => void;
  setCrashType: (type: CrashType) => void;
  triggerSOS: (incidentId?: string) => Promise<void>;
  cancelSOS: () => void;
  confirmDispatch: (data: Record<string, unknown>) => void;
  resolveIncident: () => void;
  
  setGoldenHourActive: (active: boolean) => void;
  setGoldenHourExpired: (expired: boolean) => void;
  setGForceData: (data: { x: number; y: number; z: number }) => void;
  setCrashTriggered: (triggered: boolean) => void;
  setCrashDetectedAt: (time: number | null) => void;
  startCountdown: () => void;
  updateIradReport: (report: Record<string, unknown>, ackId: string) => void;
  setLocation: (loc: { lat: number; lng: number }) => void;
  startRescueLoop: (id: string) => void;
}

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
      
      isDispatched: false,
      dispatchData: null,
      dispatchConfirmed: false,
      
      goldenHourActive: false,
      goldenHourExpired: false,
      
      gForceData: { x: 0, y: 0, z: 0 },
      location: { lat: 12.9716, lng: 77.5946 }, // Default to Bangalore
      iradReport: null,

      setCountdown: (count) => set({ countdown: count }),
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
          crashTriggered: true
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

      confirmDispatch: (data) => set({
        status: 'DISPATCH',
        isDispatched: true,
        dispatchConfirmed: true,
        dispatchData: data
      }),

      resolveIncident: () => set({
        isActive: false,
        sosActive: false,
        status: 'RESOLVED',
        goldenHourActive: false
      }),

      setGoldenHourActive: (active) => set({ goldenHourActive: active }),
      setGoldenHourExpired: (expired) => set({ goldenHourExpired: expired }),
      setGForceData: (data) => set({ gForceData: data }),
      setCrashTriggered: (triggered) => set({ crashTriggered: triggered }),
      setCrashDetectedAt: (time) => set({ crashDetectedAt: time }),

      startCountdown: () => set({ countdown: 10, status: 'TRIGGERED' }),
      
      updateIradReport: (report, ackId) => set({ 
        iradReport: { ...report, ackId } 
      }),

      setLocation: (location) => set({ location }),

      startRescueLoop: (id) => {
        set({ status: 'GOLDEN_HOUR', goldenHourActive: true, incidentId: id, currentIncidentId: id, sosActive: true, isActive: true });
      }
    }),
    {
      name: 'yirc-sos-store'
    }
  )
);

// Unified export for backward compatibility
export const useEmergencyStore = useSosStore;

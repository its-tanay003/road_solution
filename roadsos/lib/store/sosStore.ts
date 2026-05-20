import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export type SOSStatus = 'idle' | 'countdown' | 'active' | 'acknowledged' | 'resolved';
export type TriggerType = 'manual' | 'crash' | 'shake' | 'triple-press' | 'voice' | 'scheduled' | 'rollover';

export interface SOSLocation {
  lat: number;
  lng: number;
  address: string;
  accuracy?: number;
  timestamp: number;
}

export interface BroadcastStatus {
  sms: 'pending' | 'sent' | 'failed' | 'stub';
  whatsapp: 'pending' | 'sent' | 'failed' | 'link_generated';
  push: 'pending' | 'sent' | 'failed';
  websocket: 'pending' | 'broadcast' | 'failed';
  bluetooth: 'pending' | 'attempted' | 'failed';
  email: 'pending' | 'sent' | 'failed';
  mqtt: 'pending' | 'published' | 'failed';
  webrtc_data: 'pending' | 'connected' | 'failed';
}

export interface Responder {
  name: string;
  lat: number;
  lng: number;
  etaMinutes: number;
  id?: string;
  assignedAt?: number;
}

interface SOSState {
  status: SOSStatus;
  countdownSeconds: number;
  incidentId: string | null;
  location: SOSLocation | null;
  trigger: TriggerType | null;
  broadcastStatus: BroadcastStatus | null;
  responder: Responder | null;
  autoDialed: boolean;

  // Actions
  arm: (trigger?: TriggerType, customCountdown?: number) => void;
  cancel: () => void;
  broadcast: () => Promise<void>;
  resolve: () => void;
  setLocation: (location: SOSLocation) => void;
  tickCountdown: () => void;
  setAutoDialed: (val: boolean) => void;
}

const DEFAULT_BROADCAST: BroadcastStatus = {
  sms: 'pending', whatsapp: 'pending', push: 'pending',
  websocket: 'pending', bluetooth: 'pending', email: 'pending',
  mqtt: 'pending', webrtc_data: 'pending'
};

export const useSOSStore = create<SOSState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      countdownSeconds: 30,
      incidentId: null,
      location: null,
      trigger: null,
      broadcastStatus: null,
      responder: null,
      autoDialed: false,

      arm: (trigger = 'manual', customCountdown = 30) => {
        set({
          status: 'countdown',
          countdownSeconds: customCountdown,
          trigger,
          incidentId: nanoid(),
          broadcastStatus: { ...DEFAULT_BROADCAST },
          autoDialed: false,
        });

        // Grab location
        navigator.geolocation?.getCurrentPosition(
          (pos) => {
            const loc: SOSLocation = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              address: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
              accuracy: pos.coords.accuracy,
              timestamp: Date.now(),
            };
            set({ location: loc });

            // Try reverse geocode via browser
            void fetch(`https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json`)
              .then((r) => r.json())
              .then((data) => {
                if (data.display_name) {
                  set({ location: { ...loc, address: data.display_name } });
                }
              })
              .catch(() => {});
          },
          () => {
            set({ location: { lat: 0, lng: 0, address: 'Location unavailable', timestamp: Date.now() } });
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      },

      cancel: () => set({ status: 'idle', countdownSeconds: 30, incidentId: null, broadcastStatus: null, autoDialed: false }),

      broadcast: async () => {
        const { incidentId, location } = get();
        set({ status: 'active' });

        try {
          const res = await fetch('/api/sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              incidentId, lat: location?.lat, lng: location?.lng,
              address: location?.address, emergencyType: 'road_crash',
            }),
          });
          const data = await res.json() as { broadcastStatus: BroadcastStatus; responder: Responder };
          set({ broadcastStatus: data.broadcastStatus, responder: data.responder, status: 'acknowledged' });
        } catch {
          // Still mark as active even if API fails — local siren/vibration continues
          set({ status: 'active' });
        }
      },

      resolve: () => set({ status: 'resolved' }),

      setLocation: (location) => set({ location }),
      
      setAutoDialed: (val) => set({ autoDialed: val }),

      tickCountdown: () => {
        const { countdownSeconds, status, broadcast } = get();
        if (status !== 'countdown') return;
        if (countdownSeconds <= 1) {
          void broadcast();
        } else {
          set({ countdownSeconds: countdownSeconds - 1 });
        }
      },
    }),
    {
      name: 'roadsos-sos',
      partialize: (s) => ({
        location: s.location,
        status: s.status === 'active' || s.status === 'acknowledged' ? s.status : 'idle',
      }),
    }
  )
);

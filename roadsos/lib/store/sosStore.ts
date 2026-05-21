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

export interface SOSTelemetry {
  name: string;
  age: string;
  bloodGroup: string;
  conditions: string;
  allergies: string;
  emergencyContacts: { name: string; phone: string; relationship?: string }[];
  lat: number;
  lng: number;
  address: string;
  battery: number;
  network: string;
  speed: number;
  timestamp: number;
  deviceInfo: string;
}

export interface BroadcastStatus {
  sms: 'pending' | 'sent' | 'failed' | 'unavailable';
  whatsapp: 'pending' | 'sent' | 'failed' | 'unavailable';
  push: 'pending' | 'sent' | 'failed' | 'unavailable';
  websocket: 'pending' | 'sent' | 'failed' | 'unavailable';
  bluetooth: 'pending' | 'sent' | 'failed' | 'unavailable';
  email: 'pending' | 'sent' | 'failed' | 'unavailable';
  mqtt: 'pending' | 'sent' | 'failed' | 'unavailable';
  serial: 'pending' | 'sent' | 'failed' | 'unavailable';
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
  telemetryData: SOSTelemetry | null;

  // Actions
  arm: (trigger?: TriggerType, customCountdown?: number) => void;
  cancel: () => void;
  broadcast: () => Promise<void>;
  resolve: () => void;
  allClear: () => Promise<void>;
  setLocation: (location: SOSLocation) => void;
  tickCountdown: () => void;
  setAutoDialed: (val: boolean) => void;
}

const DEFAULT_BROADCAST: BroadcastStatus = {
  sms: 'pending', whatsapp: 'pending', push: 'pending',
  websocket: 'pending', bluetooth: 'pending', email: 'pending',
  mqtt: 'pending', serial: 'pending'
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
      telemetryData: null,

      arm: (trigger = 'manual', customCountdown = 30) => {
        const incidentId = nanoid();
        const startStatus = trigger === 'crash' ? 'active' : 'countdown';
        
        set({
          status: startStatus,
          countdownSeconds: trigger === 'crash' ? 0 : customCountdown,
          trigger,
          incidentId,
          broadcastStatus: { ...DEFAULT_BROADCAST },
          autoDialed: false,
          telemetryData: null,
        });

        // Initialize telemetry synchronously with available data
        const telemetry: SOSTelemetry = {
          name: 'Unknown User',
          age: 'Unknown',
          bloodGroup: 'Unknown',
          conditions: '',
          allergies: '',
          emergencyContacts: [],
          lat: 0,
          lng: 0,
          address: 'Locating user...',
          battery: 100,
          network: 'unknown',
          speed: 0,
          timestamp: Date.now(),
          deviceInfo: `UA: ${navigator.userAgent} | Screen: ${window.screen.width}x${window.screen.height} @ DPR ${window.devicePixelRatio || 1}`,
        };

        // Try load profile from localStorage
        try {
          const profileStr = localStorage.getItem('roadsos-profile');
          if (profileStr) {
            const profile = JSON.parse(profileStr);
            telemetry.name = profile.name || telemetry.name;
            if (profile.dob) {
              const birthYear = new Date(profile.dob).getFullYear();
              if (!isNaN(birthYear)) {
                telemetry.age = String(new Date().getFullYear() - birthYear);
              }
            }
            telemetry.bloodGroup = profile.bloodGroup || telemetry.bloodGroup;
            telemetry.conditions = profile.conditions || telemetry.conditions;
            telemetry.allergies = profile.allergies || telemetry.allergies;
            telemetry.emergencyContacts = profile.emergencyContacts || [];
          }
        } catch (e) {
          console.warn('[SOS Store] Local profile read error:', e);
        }

        // Fetch network speed / type
        const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        if (conn) {
          telemetry.network = conn.effectiveType || conn.type || 'unknown';
        }

        const gatherAsyncTelemetry = async () => {
          // 1. Get Battery
          try {
            if ('getBattery' in navigator) {
              const b = await (navigator as any).getBattery();
              telemetry.battery = Math.round(b.level * 100);
            }
          } catch {}

          // 2. Get Geolocation
          const getGeo = () => new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation?.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: trigger === 'crash' ? 2000 : 8000,
              maximumAge: 0
            });
          });

          try {
            const pos = await getGeo();
            telemetry.lat = pos.coords.latitude;
            telemetry.lng = pos.coords.longitude;
            telemetry.speed = pos.coords.speed || 0;
            telemetry.address = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
            
            const loc: SOSLocation = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              address: telemetry.address,
              accuracy: pos.coords.accuracy,
              timestamp: Date.now(),
            };
            set({ location: loc });

            // nominatim reverse geocode
            try {
              const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json`);
              const data = await r.json();
              if (data.display_name) {
                loc.address = data.display_name;
                telemetry.address = data.display_name;
                set({ location: loc });
              }
            } catch {}
          } catch (err) {
            console.warn('[SOS Store] Geolocation error:', err);
            const fallbackLoc = { lat: 0, lng: 0, address: 'Location unavailable', timestamp: Date.now() };
            set({ location: fallbackLoc });
            telemetry.lat = 0;
            telemetry.lng = 0;
            telemetry.address = 'Location unavailable';
          }

          // 3. Merge database profile if active session exists
          try {
            const res = await fetch('/api/profile');
            if (res.ok) {
              const data = await res.json();
              if (data.profile) {
                telemetry.name = data.profile.full_name || telemetry.name;
                telemetry.bloodGroup = data.profile.blood_group || telemetry.bloodGroup;
                telemetry.conditions = data.profile.medical_conditions?.join(', ') || telemetry.conditions;
                telemetry.allergies = data.profile.allergies?.join(', ') || telemetry.allergies;
                if (data.profile.date_of_birth) {
                  const birthYear = new Date(data.profile.date_of_birth).getFullYear();
                  if (!isNaN(birthYear)) {
                    telemetry.age = String(new Date().getFullYear() - birthYear);
                  }
                }
              }
              if (Array.isArray(data.contacts) && data.contacts.length > 0) {
                telemetry.emergencyContacts = data.contacts.map((c: any) => ({
                  name: c.name,
                  phone: c.phone,
                  relationship: c.relationship || c.relation || 'Emergency Contact'
                }));
              }
            }
          } catch {}

          // Finalize telemetry
          set({ telemetryData: telemetry });

          // If trigger is crash, we proceed to call broadcast() immediately
          if (trigger === 'crash') {
            void get().broadcast();
          }
        };

        void gatherAsyncTelemetry();
      },

      cancel: () => set({ status: 'idle', countdownSeconds: 30, incidentId: null, broadcastStatus: null, autoDialed: false, telemetryData: null }),

      broadcast: async () => {
        set({ status: 'active' });
        const { incidentId, telemetryData, location, trigger } = get();

        // Standard fallback payload if telemetry resolved late
        const sosPayload: SOSTelemetry = telemetryData || {
          name: 'Unknown User',
          age: 'Unknown',
          bloodGroup: 'Unknown',
          conditions: '',
          allergies: '',
          emergencyContacts: [],
          lat: location?.lat || 0,
          lng: location?.lng || 0,
          address: location?.address || 'Locating...',
          battery: 100,
          network: 'unknown',
          speed: 0,
          timestamp: Date.now(),
          deviceInfo: `UA: ${navigator.userAgent}`,
        };

        try {
          // Trigger server database logging (creates incident and sos_events record)
          const res = await fetch('/api/sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              incidentId,
              lat: sosPayload.lat,
              lng: sosPayload.lng,
              address: sosPayload.address,
              batteryLevel: sosPayload.battery,
              networkType: sosPayload.network,
              emergencyType: 'road_crash',
              triggerType: trigger || 'manual',
              telemetry: sosPayload,
            }),
          });
          
          if (res.ok) {
            const data = await res.json() as { responder?: Responder };
            if (data.responder) {
              set({ responder: data.responder });
            }
          }
          
          // Switch theme to high-contrast emergency mode
          document.documentElement.classList.add('emergency-high-contrast');
          
          // Trigger the local broadcast service (Phase 5)
          const { broadcastSOS } = await import('@/lib/sosbroadcast');
          const results = await broadcastSOS(sosPayload);
          
          // Update Zustand store's broadcastStatus with the outcomes of each channel
          const currentStatus = { ...DEFAULT_BROADCAST };
          results.forEach((r) => {
            const ch = r.channel as keyof BroadcastStatus;
            if (ch in currentStatus) {
              currentStatus[ch] = r.status as any;
            }
          });
          
          set({ broadcastStatus: currentStatus, status: 'acknowledged' });
        } catch (err) {
          console.error('[SOS Store] Broadcast error:', err);
          // Make sure we still stay in active emergency
          set({ status: 'active' });
        }
      },

      resolve: () => {
        document.documentElement.classList.remove('emergency-high-contrast');
        set({ status: 'resolved' });
      },

      allClear: async () => {
        const { incidentId, telemetryData } = get();
        document.documentElement.classList.remove('emergency-high-contrast');

        try {
          await fetch('/api/sos/all-clear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              incidentId,
              contacts: telemetryData?.emergencyContacts || [],
              userName: telemetryData?.name || 'User',
            }),
          });
        } catch (err) {
          console.warn('[SOS Store] All-clear POST failed:', err);
        }

        set({ status: 'idle', countdownSeconds: 30, incidentId: null, broadcastStatus: null, autoDialed: false, telemetryData: null, responder: null });
      },

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
        telemetryData: s.telemetryData,
      }),
    }
  )
);


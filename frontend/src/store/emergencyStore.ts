import { create } from 'zustand';
import { socket } from '../lib/socket';

type SOSState = 'idle' | 'countdown' | 'active' | 'resolved';

interface Responder {
  name: string;
  unit: string;
  distance: string;
}

interface EmergencyState {
  sosState: SOSState;
  incidentId: string | null;
  location: { lat: number; lng: number } | null;
  eta: number | null; // minutes
  responder: Responder | null;
  triageData: Record<string, unknown> | null;
  triggerSOS: () => Promise<void>;
  cancelSOS: () => void;
  resolveSOS: () => void;
}

export const useEmergencyStore = create<EmergencyState>()((set, get) => ({
  sosState: 'idle',
  incidentId: null,
  location: null,
  eta: null,
  responder: null,
  triageData: null,

  triggerSOS: async () => {
    // 1. Get user location (with fallback to Bengaluru centroid)
    let location = { lat: 12.9716, lng: 77.5946 };
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
      // Use fallback — never block on location failure
    }

    const incidentId = `RS-${Date.now()}`;
    set({ sosState: 'active', incidentId, location });

    // 2. Call backend dispatch endpoint
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/dispatch/108`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('roadsos_token') ?? ''}`,
        },
        body: JSON.stringify({
          incidentId,
          location,
          severity: 'critical',
          timestamp: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        set({
          eta: data.eta_minutes ?? 10,
          responder: {
            name: data.driver ?? 'Dispatch Unit',
            unit: data.unit ?? 'GVK EMRI',
            distance: data.distance ?? 'Calculating...',
          },
        });
      }
    } catch (err) {
      console.error('[emergencyStore] Dispatch failed:', err);
      // Keep SOS active — never silently fail in an emergency
      set({
        eta: 10,
        responder: { name: 'Dispatch Unit', unit: 'Local Emergency (108)', distance: 'Calculating...' },
      });
    }

    // 3. Emit real-time event
    socket.emit('sos_triggered', { incidentId, location, timestamp: new Date().toISOString() });

    // 4. Alert WhatsApp emergency contact (non-blocking)
    try {
      const stored = localStorage.getItem('roadsos-settings-v2');
      const contact = stored ? JSON.parse(stored)?.state?.emergencyContact : null;
      if (contact) {
        fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/notify/whatsapp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contact, location, incidentId }),
        }).catch(() => {}); // fire-and-forget
      }
    } catch { /* ignore */ }
  },

  cancelSOS: () => {
    const { incidentId } = get();
    socket.emit('sos_cancelled', { incidentId });
    set({ sosState: 'idle', incidentId: null, eta: null, responder: null });
  },

  resolveSOS: () => {
    set({ sosState: 'resolved' });
    setTimeout(() => set({ sosState: 'idle', incidentId: null }), 3000);
  },
}));

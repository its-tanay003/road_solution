import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SafetyTimer {
  active: boolean;
  expiresAt: number | null;       // unix ms
  durationMs: number;
  selectedContactIds: string[];
  graceActive: boolean;           // 30s grace overlay
}

interface SafetyTimerStore extends SafetyTimer {
  start: (durationMs: number, contactIds: string[]) => void;
  checkIn: () => void;
  stop: () => void;
  triggerGrace: () => void;
  fireAlert: () => void;
}

export const useSafetyTimerStore = create<SafetyTimerStore>()(
  persist(
    (set) => ({
      active: false,
      expiresAt: null,
      durationMs: 0,
      selectedContactIds: [],
      graceActive: false,

      start: (durationMs, contactIds) =>
        set({ active: true, expiresAt: Date.now() + durationMs, durationMs, selectedContactIds: contactIds, graceActive: false }),

      checkIn: () =>
        set({ active: false, expiresAt: null, graceActive: false }),

      stop: () =>
        set({ active: false, expiresAt: null, graceActive: false }),

      triggerGrace: () =>
        set({ graceActive: true }),

      fireAlert: () => {
        // In production: call backend to SMS contacts
        console.warn('[SafetyTimer] SOS auto-fired to contacts');
        set({ active: false, expiresAt: null, graceActive: false });
      },
    }),
    { name: 'roadsos-safety-timer' }
  )
);

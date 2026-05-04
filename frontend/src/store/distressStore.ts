import { create } from 'zustand';

export interface DistressEvent {
  type: 'RAPID_TAP' | 'SHAKE' | 'ERRATIC_SCROLL' | 'INACTIVITY' | 'HELP_ARRIVED' | string;
  weight: number;
  timestamp: number;
}

interface DistressState {
  isActive: boolean;
  score: number;
  events: DistressEvent[];
  uiSimplified: boolean;
  autoPromptActive: boolean;
  
  toggleEngine: (active: boolean) => void;
  addEvent: (type: string, weight: number) => void;
  recalculate: () => void;
  dismissAutoPrompt: () => void;
  clearEvents: () => void;
}

const ROLLING_WINDOW_MS = 30000; // 30 seconds

export const useDistressStore = create<DistressState>((set, get) => ({
  isActive: false, // Default off for privacy
  score: 0,
  events: [],
  uiSimplified: false,
  autoPromptActive: false,

  toggleEngine: (active) => set({ isActive: active, score: 0, events: [], uiSimplified: false, autoPromptActive: false }),

  addEvent: (type, weight) => {
    const { isActive } = get();
    if (!isActive) return;

    set((state) => {
      const newEvent: DistressEvent = { type, weight, timestamp: Date.now() };
      return { events: [...state.events, newEvent] };
    });
    get().recalculate();
  },

  recalculate: () => {
    const { events, isActive, autoPromptActive } = get();
    if (!isActive) return;

    const now = Date.now();
    // Filter out events older than 30s
    const validEvents = events.filter(e => now - e.timestamp <= ROLLING_WINDOW_MS);
    
    // Sum weights
    let newScore = validEvents.reduce((sum, e) => sum + e.weight, 0);
    
    // Cap score at 100
    newScore = Math.min(Math.max(0, newScore), 100);

    const uiSimplified = newScore >= 61;
    // Don't auto-disable prompt if score drops, but enable if > 86
    const newAutoPrompt = autoPromptActive || newScore >= 86;

    set({
      events: validEvents,
      score: newScore,
      uiSimplified,
      autoPromptActive: newAutoPrompt
    });
  },

  dismissAutoPrompt: () => set({ autoPromptActive: false }),
  
  clearEvents: () => set({ events: [], score: 0, uiSimplified: false, autoPromptActive: false })
}));

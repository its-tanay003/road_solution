import { create } from 'zustand';

export type CrashSensitivity = 'high' | 'normal' | 'low';

interface CrashState {
  isCrashMonitoring: boolean;
  sensitivity: CrashSensitivity;
  crashTriggered: boolean;
  countdownSeconds: number;
  triggerReason: 'crash likely' | 'impact detected' | 'rollover possible' | null;

  setCrashMonitoring: (monitoring: boolean) => void;
  setSensitivity: (sensitivity: CrashSensitivity) => void;
  setCrashTriggered: (triggered: boolean) => void;
  setCountdownSeconds: (seconds: number) => void;
  setTriggerReason: (reason: 'crash likely' | 'impact detected' | 'rollover possible' | null) => void;
  resetCrash: () => void;
}

export const useCrashStore = create<CrashState>((set) => ({
  isCrashMonitoring: true, // Default to true for safety
  sensitivity: 'normal',
  crashTriggered: false,
  countdownSeconds: 15,
  triggerReason: null,

  setCrashMonitoring: (isCrashMonitoring) => set({ isCrashMonitoring }),
  setSensitivity: (sensitivity) => set({ sensitivity }),
  setCrashTriggered: (crashTriggered) => set({ crashTriggered }),
  setCountdownSeconds: (countdownSeconds) => set({ countdownSeconds }),
  setTriggerReason: (triggerReason) => set({ triggerReason }),
  resetCrash: () => set({ crashTriggered: false, countdownSeconds: 15, triggerReason: null }),
}));

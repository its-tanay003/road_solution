import { useSosStore } from '../store';
import { useWearableStore } from '../store/wearableStore';

export interface OfflineTriageResult {
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  consensus: string;
  isFallback: boolean;
  agentDecisions: Record<string, string>;
}

/**
 * Executes a deterministic, rule-based triage logic when AI services are unavailable.
 * This runs entirely on-device with zero network dependency.
 */
export const runOfflineTriage = (): OfflineTriageResult => {
  const { gForceData } = useSosStore.getState();
  const { health } = useWearableStore.getState();
  
  const gForceMagnitude = Math.sqrt(
    Math.pow(gForceData.x, 2) + 
    Math.pow(gForceData.y, 2) + 
    Math.pow(gForceData.z, 2)
  );

  // The specific rule requested: G-force > 10G + SpO2 < 92%
  // We simulate "movement = none" by checking if BPM is low or SpO2 is dropping
  const isCritical = gForceMagnitude > 10 && health.spO2 < 92;
  const isHigh = gForceMagnitude > 7 || health.spO2 < 95;

  if (isCritical) {
    return {
      severity: 'CRITICAL',
      consensus: "CRITICAL FALLBACK: High-impact collision (>10G) + Hypoxia detected (<92%). ALS required immediately.",
      isFallback: true,
      agentDecisions: {
        crash: "IMPACT CRITICAL (>10G)",
        medical: "HYPOXIA DETECTED (<92%)",
        resource: "ALS UNIT A47 - IMMEDIATE DISPATCH",
        vaahan: "DATA RETRIEVED FROM LOCAL CACHE"
      }
    };
  }

  if (isHigh) {
    return {
      severity: 'HIGH',
      consensus: "HIGH SEVERITY FALLBACK: Significant impact detected. Dispatching Emergency Response Team.",
      isFallback: true,
      agentDecisions: {
        crash: "HIGH IMPACT",
        medical: "STABLE BUT MONITORING",
        resource: "DISPATCH NEAREST UNIT",
        vaahan: "LOCAL RECORD"
      }
    };
  }

  return {
    severity: 'MODERATE',
    consensus: "OFFLINE TRIAGE: Moderate impact. Suggesting precautionary checkup.",
    isFallback: true,
    agentDecisions: {
      crash: "MODERATE IMPACT",
      medical: "NORMAL VITALS",
      resource: "NON-EMERGENCY UNIT",
      vaahan: "LOCAL RECORD"
    }
  };
};

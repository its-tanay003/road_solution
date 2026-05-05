import { useMemo } from 'react';
import { useEmergencyStore } from '../store';

export const useBiometricsContext = (heartRate: number, spo2: number, movement: boolean) => {
  const { crashTriggered } = useEmergencyStore();

  const contextString = useMemo(() => {
    if (!crashTriggered) return "Biometrics: Normal Baseline";

    const hrStatus = heartRate > 100 ? "TACHYCARDIA" : heartRate < 60 ? "BRADYCARDIA" : "NORMAL";
    const spo2Status = spo2 < 90 ? "HYPOXEMIA" : "NORMAL";
    const moveStatus = movement ? "ACTIVE" : "NONE (POSSIBLE UNCONSCIOUSNESS)";

    return `HR: ${heartRate}bpm (${hrStatus}), SpO2: ${spo2}% (${spo2Status}), Movement: ${moveStatus}`;
  }, [heartRate, spo2, movement, crashTriggered]);

  return contextString;
};

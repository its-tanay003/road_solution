import { useState, useEffect, useMemo } from 'react';
import { triageIncident } from '../logic/offlineTriageEngine';
import type { TriageInput, TriageOutput } from '../logic/offlineTriageEngine';

export const useOfflineTriage = (input: TriageInput | null) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triageResult = useMemo(() => {
    if (!input) return null;
    return triageIncident(input);
  }, [input]);

  return {
    isOffline,
    triageResult
  };
};

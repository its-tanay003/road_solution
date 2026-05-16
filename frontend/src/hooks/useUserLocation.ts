import { useState, useEffect } from 'react';
import { getCurrentPosition, watchPosition } from '../utils/geolocation';
import type { GeoPosition } from '../utils/geolocation';

interface LocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export const useUserLocation = () => {
  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    const handleUpdate = (pos: GeoPosition) => {
      setLocation({
        lat: pos.lat,
        lng: pos.lng,
        accuracy: pos.accuracy,
        error: null,
        loading: false,
      });
    };

    const handleError = (error: Error) => {
      console.warn('[useUserLocation] Geolocation warning:', error.message);
      // Utility handles fallback, so we don't necessarily set error: error.message 
      // unless we want the UI to show a warning.
    };

    // Initial fetch
    getCurrentPosition().then(handleUpdate);

    // Watch for changes
    const unwatch = watchPosition(handleUpdate, handleError);

    return () => unwatch();
  }, []);

  return location;
};

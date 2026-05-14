import { useState, useEffect } from 'react';

interface LocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

const CHENNAI_DEFAULT = {
  lat: 13.0827,
  lng: 80.2707,
  accuracy: null,
};

export const useUserLocation = () => {
  const [location, setLocation] = useState<LocationState>(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return {
        ...CHENNAI_DEFAULT,
        error: typeof navigator === 'undefined' ? null : 'Geolocation is not supported by your browser',
        loading: false,
      };
    }
    return {
      lat: null,
      lng: null,
      accuracy: null,
      error: null,
      loading: true,
    };
  });

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;

    const handleSuccess = (position: GeolocationPosition) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      setLocation({
        ...CHENNAI_DEFAULT,
        error: error.message,
        loading: false,
      });
    };

    // Get initial position quickly
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });

    // Then watch for changes
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return location;
};

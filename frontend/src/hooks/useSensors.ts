import { useState, useEffect } from 'react';

interface SensorData {
  speed: number | null; // in km/h
  accuracy: number | null;
  acceleration: {
    x: number | null;
    y: number | null;
    z: number | null;
  };
  isImpactDetected: boolean;
}

export const requestSensorPermissions = async (): Promise<boolean> => {
  if (typeof (DeviceMotionEvent as unknown as DeviceMotionEventStatic).requestPermission === 'function') {
    try {
      const response = await (DeviceMotionEvent as unknown as DeviceMotionEventStatic).requestPermission!();
      return response === 'granted';
    } catch (e) {
      console.error('Permission request failed:', e);
      return false;
    }
  }
  return true; // Already granted or not required
};

export const useSensors = (onImpact?: () => void): SensorData => {
  const [speed, setSpeed] = useState<number | null>(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });
  const [isImpactDetected, setIsImpactDetected] = useState(false);

  // Impact detection threshold (G-force)
  const IMPACT_THRESHOLD = 25; // Significant spike in acceleration

  useEffect(() => {
    // 1. Geolocation for Speed
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          // speed is in m/s, convert to km/h
          const speedKmh = position.coords.speed ? Math.round(position.coords.speed * 3.6) : 0;
          setSpeed(speedKmh);
          setAccuracy(position.coords.accuracy);
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    // 2. Device Motion for Impact Detection
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;

      setAcceleration({ x, y, z });

      // Calculate total G-force magnitude
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      
      if (magnitude > IMPACT_THRESHOLD && !isImpactDetected) {
        setIsImpactDetected(true);
        if (onImpact) onImpact();
        
        // Reset impact state after some time
        setTimeout(() => setIsImpactDetected(false), 5000);
      }
    };

    if ('DeviceMotionEvent' in window) {
      // Request permission for iOS 13+
      if (typeof (DeviceMotionEvent as unknown as DeviceMotionEventStatic).requestPermission === 'function') {
        (DeviceMotionEvent as unknown as DeviceMotionEventStatic).requestPermission!()
          .then((response: string) => {
            if (response === 'granted') {
              window.addEventListener('devicemotion', handleMotion);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('devicemotion', handleMotion);
      }
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [onImpact, isImpactDetected]);

  return { speed, accuracy, acceleration, isImpactDetected };
};

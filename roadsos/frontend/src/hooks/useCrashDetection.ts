import { useEffect, useState, useRef } from 'react';
import { useSosStore, useNetworkStore } from '../store';

export interface TelemetryPoint {
  time: number;
  acc: { x: number; y: number; z: number };
  gps?: { lat: number; lng: number };
}

export const useCrashDetection = (isSimulating: boolean = false) => {
  const { triggerSos, isActive, startCountdown, countdownActive, countdownTime, decrementCountdown, location } = useSosStore();
  const { setLowBandwidth } = useNetworkStore();
  const [lastAcceleration, setLastAcceleration] = useState({ x: 0, y: 0, z: 0 });
  const [impactDetected, setImpactDetected] = useState(false);
  const [behavioralAlert, setBehavioralAlert] = useState<string | null>(null);

  // Blackbox rolling buffer (last 60 seconds)
  const blackboxRef = useRef<TelemetryPoint[]>([]);

  // Handle Countdown Timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdownActive && countdownTime > 0) {
      timer = setTimeout(() => {
        decrementCountdown();
      }, 1000);
    } else if (countdownActive && countdownTime === 0) {
      triggerSos();
    }
    return () => clearTimeout(timer);
  }, [countdownActive, countdownTime, decrementCountdown, triggerSos]);

  // Handle Motion Sensor
  useEffect(() => {
    if (!window.DeviceMotionEvent && !isSimulating) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (isActive || countdownActive) return; // Don't trigger if already active or counting down

      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
      const gForce = magnitude / 9.8;
      
      const now = Date.now();
      
      // Update Blackbox (Keep last 60 seconds of data. Assuming 10hz sampling = max 600 points)
      blackboxRef.current.push({
        time: now,
        acc: { x: acc.x, y: acc.y, z: acc.z },
        gps: location || undefined
      });
      // Trim blackbox to approx 60 seconds (keep last 600 points)
      if (blackboxRef.current.length > 600) {
        blackboxRef.current.shift();
      }

      // 1. Crash Detection (>4.0g)
      if (gForce > 4.0) {
        console.warn(`HIGH IMPACT DETECTED! G-Force: ${gForce.toFixed(2)}G`);
        setImpactDetected(true);
        setLowBandwidth(true); // Disable animations to save processing
        startCountdown();
        
        // Push blackbox data to backend or persist locally
        if (typeof window !== 'undefined') {
          localStorage.setItem('roadsos_blackbox_crash', JSON.stringify(blackboxRef.current));
        }
      } 
      // 2. Behavioral Risk Monitoring: Sudden Braking / Aggressive Acceleration
      else if (gForce > 1.5 && gForce <= 4.0) {
        // Typically harsh braking/acceleration is between 0.8g and 1.5g. We use >1.5 for "extreme" non-crash
        if (acc.y && acc.y > 15) {
          setBehavioralAlert('Sudden Braking Detected. Maintain safe following distance.');
          setTimeout(() => setBehavioralAlert(null), 5000);
        } else if (acc.y && acc.y < -15) {
          setBehavioralAlert('Aggressive Acceleration Detected.');
          setTimeout(() => setBehavioralAlert(null), 5000);
        }
      }

      setLastAcceleration({ x: acc.x, y: acc.y, z: acc.z });
    };

    // Throttle devicemotion event frequency if needed, but modern browsers usually cap at 60Hz.
    // For production, we might downsample.

    if (isSimulating) {
      // Setup a simulated high-g impact after 5 seconds if simulating
      const timer = setTimeout(() => {
        if (!isActive && !countdownActive) {
          console.warn('SIMULATED CRASH: 5.2G impact detected.');
          setImpactDetected(true);
          setLowBandwidth(true);
          startCountdown();
        }
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      window.addEventListener('devicemotion', handleMotion);
      // Add debug listener for E2E tests
      const handleSimulateCrash = () => {
        console.log('Simulated crash triggered via event');
        setImpactDetected(true);
        setLowBandwidth(true);
        startCountdown();
      };
      window.addEventListener('dev:simulate-crash', handleSimulateCrash);

      return () => {
        window.removeEventListener('devicemotion', handleMotion);
        window.removeEventListener('dev:simulate-crash', handleSimulateCrash);
      };
    }
  }, [isSimulating, isActive, countdownActive, startCountdown, setLowBandwidth, location]);

  return { impactDetected, lastAcceleration, behavioralAlert, blackboxData: blackboxRef.current };
};

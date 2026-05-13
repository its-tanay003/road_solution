import React, { useEffect } from 'react';
import { useDriveModeStore } from '../store/driveModeStore';
import { DriveModeScreen } from '../screens/DriveModeScreen';
import { AnimatePresence } from 'framer-motion';

export const DriveModeListener: React.FC = () => {
  const { isActive, setActive, setSpeed } = useDriveModeStore();

  useEffect(() => {
    // In a real app, this would use Geolocation API / Accelerometer
    // For demo, we auto-trigger if speed > 30 (simulated)
    const iv = setInterval(() => {
      const mockSpeed = Math.floor(Math.random() * 20) + 20; // 20-40 km/h
      setSpeed(mockSpeed);
      
      // Auto-activate logic: if speed > 30 for 5 seconds
      // if (mockSpeed > 30 && !isActive) setActive(true);
    }, 2000);

    return () => clearInterval(iv);
  }, [isActive, setActive, setSpeed]);

  return (
    <AnimatePresence>
      {isActive && <DriveModeScreen />}
    </AnimatePresence>
  );
};

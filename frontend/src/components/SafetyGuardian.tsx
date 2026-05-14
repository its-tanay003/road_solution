import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSensors } from '../hooks/useSensors';
import { useSafetyScoreStore } from '../store/safetyScoreStore';
import { useDriveModeStore } from '../store/driveModeStore';

export const SafetyGuardian: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent } = useSafetyScoreStore();
  const { limit, setSpeed } = useDriveModeStore();
  const lastEventTime = useRef<Record<string, number>>({});
  const overspeedStartTime = useRef<number | null>(null);

  // 1. Monitor Sensors
  const { speed, acceleration } = useSensors(() => {
    // Impact detected! (Defined as >2.5G in useSensors)
    addEvent({
      type: 'sos_triggered',
      scoreImpact: -100,
      description: 'Severe impact detected - Emergency SOS initiated'
    });
    // Trigger actual SOS flow
    navigate('/sos-active');
  });

  // 2. Monitor Driving Behavior
  useEffect(() => {
    if (speed === null) return;
    
    // Sync speed with drive store
    setSpeed(speed);

    const now = Date.now();
    const throttle = (key: string, ms: number) => {
      if (!lastEventTime.current[key] || now - lastEventTime.current[key] > ms) {
        lastEventTime.current[key] = now;
        return true;
      }
      return false;
    };

    // Thresholds (m/s²) - 1G ≈ 9.8 m/s²
    // Production standards: 
    // Hard brake: 0.3G - 0.4G (3-4 m/s²)
    // Hard corner: 0.3G - 0.4G
    // Rapid Accel: 0.25G+
    
    const ax = Math.abs(acceleration.x ?? 0);
    const ay = Math.abs(acceleration.y ?? 0);

    // Hard Braking (Y-axis typically forward/backward)
    if (ay > 4.5 && throttle('brake', 5000)) {
      addEvent({
        type: 'hard_brake',
        scoreImpact: -15,
        description: 'Hard braking detected'
      });
    }

    // Rapid Acceleration
    if (ay > 3.5 && (acceleration.y ?? 0) < 0 && throttle('accel', 5000)) {
      addEvent({
        type: 'rapid_accel',
        scoreImpact: -10,
        description: 'Rapid acceleration detected'
      });
    }

    // Hard Cornering (X-axis)
    if (ax > 4.0 && throttle('corner', 5000)) {
      addEvent({
        type: 'hard_corner',
        scoreImpact: -12,
        description: 'Sharp cornering detected'
      });
    }

    // Overspeeding Duration Monitoring
    if (speed > limit) {
      if (!overspeedStartTime.current) {
        overspeedStartTime.current = now;
      } else if (now - overspeedStartTime.current > 30000) {
        // Log overspeeding after 30 seconds
        addEvent({
          type: 'overspeed',
          scoreImpact: -20,
          description: `Sustained overspeeding above ${limit} km/h`
        });
        overspeedStartTime.current = now; // reset timer to log again in 30s
      }
    } else {
      overspeedStartTime.current = null;
    }
  }, [speed, acceleration, limit, setSpeed, addEvent]);

  // 3. Global Voice Trigger
  // Note: We don't use useVoiceRecognition here because it might conflict with screen-specific ones
  // In a real production app, you'd want one global voice manager.
  // For now, we rely on the ones in specific screens (Onboarding/DriveMode).

  return null; // Background component
};

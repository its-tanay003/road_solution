import { useNavigate } from 'react-router-dom';
import { useSensors } from '../hooks/useSensors';
import { useSafetyScoreStore } from '../store/safetyScoreStore';
import { useDriveModeStore } from '../store/driveModeStore';

export const SafetyGuardian: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent } = useSafetyScoreStore();
  const { limit, setSpeed } = useDriveModeStore();
  const lastBrakeTime = useRef(0);
  const overspeedStartTime = useRef<number | null>(null);

  // 1. Monitor Sensors
  const { speed, acceleration } = useSensors(() => {
    // Impact detected!
    addEvent({
      type: 'sos_triggered',
      scoreImpact: -100,
      description: 'Severe impact detected by accelerometer'
    });
    // Trigger actual SOS flow
    navigate('/sos-active');
  });

  // 2. Monitor Driving Behavior
  useEffect(() => {
    if (speed === null) return;
    
    // Sync speed with drive store
    setSpeed(speed);

    // Hard Braking Detection
    // If deceleration is very high (z-axis or magnitude change)
    // This is a simple heuristic
    if (Math.abs(acceleration.y ?? 0) > 15 && Date.now() - lastBrakeTime.current > 5000) {
      addEvent({
        type: 'hard_brake',
        scoreImpact: -15,
        description: 'Hard braking detected'
      });
      lastBrakeTime.current = Date.now();
    }

    // Overspeeding Duration Monitoring
    if (speed > limit) {
      if (!overspeedStartTime.current) {
        overspeedStartTime.current = Date.now();
      } else if (Date.now() - overspeedStartTime.current > 30000) {
        // Log overspeeding after 30 seconds
        addEvent({
          type: 'overspeed',
          scoreImpact: -20,
          description: `Sustained overspeeding above ${limit} km/h`
        });
        overspeedStartTime.current = Date.now(); // reset timer to log again in 30s
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

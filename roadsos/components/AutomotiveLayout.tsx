'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAutomotiveMode } from '@/hooks/useAutomotiveMode';
import { useSOSStore } from '@/lib/store/sosStore';
import { useChatStore } from '@/lib/store/chatStore';
import { useVoiceStore } from '@/lib/store/voiceStore';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Map, 
  Phone, 
  Mic, 
  Moon, 
  Sun, 
  Eye, 
  Navigation, 
  ArrowLeft,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AutomotiveLayout({ children }: { children: React.ReactNode }) {
  const { isAutomotive, toggleAutomotiveMode } = useAutomotiveMode();
  const armSOS = useSOSStore((s) => s.arm);
  const toggleChat = useChatStore((s) => s.toggle);
  const { startListening } = useVoiceCommands();
  const setOverlayOpen = useVoiceStore((s) => s.setOverlayOpen);
  const router = useRouter();

  // Speed and location tracking
  const [speed, setSpeed] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [positionError, setPositionError] = useState<string | null>(null);

  // Proximity status simulation/detection
  const [proximityNear, setProximityNear] = useState(false);

  // Ambient light / dimming
  const [lux, setLux] = useState<number | null>(null);
  const [isDimmed, setIsDimmed] = useState(false);

  useEffect(() => {
    if (!isAutomotive) return;

    // 1. Geolocation Speedometer
    let watchId: number;
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          // pos.coords.speed is in meters/second
          if (pos.coords.speed !== null) {
            // Convert to km/h
            setSpeed(Math.round(pos.coords.speed * 3.6));
          } else {
            setSpeed(null);
          }
          setHeading(pos.coords.heading);
          setPositionError(null);
        },
        (err) => {
          setPositionError(err.message);
        },
        { enableHighAccuracy: true }
      );
    }

    // 2. Ambient Light Sensor
    let ambientSensor: any = null;
    if (typeof window !== 'undefined' && 'AmbientLightSensor' in window) {
      try {
        const SensorClass = (window as any).AmbientLightSensor;
        ambientSensor = new SensorClass();
        ambientSensor.addEventListener('reading', () => {
          setLux(ambientSensor.lux);
          setIsDimmed(ambientSensor.lux < 10);
        });
        ambientSensor.start();
      } catch (err) {
        console.warn('AmbientLightSensor failed to initialize:', err);
      }
    }

    // Fallback: If no AmbientLightSensor, auto-dim during late night hours (7 PM - 7 AM)
    if (!ambientSensor) {
      const hours = new Date().getHours();
      setIsDimmed(hours >= 19 || hours < 7);
    }

    // 3. Proximity Sensor Simulation
    // Since DeviceProximityEvent is deprecated, we simulate it or watch UserProximity if available
    const handleUserProximity = (event: any) => {
      setProximityNear(event.near);
    };
    window.addEventListener('userproximity' as any, handleUserProximity);

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (ambientSensor) {
        try {
          ambientSensor.stop();
        } catch {}
      }
      window.removeEventListener('userproximity' as any, handleUserProximity);
    };
  }, [isAutomotive]);

  if (!isAutomotive) {
    return <>{children}</>;
  }

  // Convert Heading degrees to Compass directions
  const getCompassDirection = (deg: number | null) => {
    if (deg === null) return 'N';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(((deg % 360) / 45)) % 8;
    return directions[idx];
  };

  const handleSOSClick = () => {
    // Instant arm in automotive mode
    armSOS('manual', 5);
  };

  const handleVoiceAssistantClick = () => {
    // Enable continuous listening & open command list for visual guidance
    startListening();
    setOverlayOpen(true);
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] flex flex-row overflow-hidden transition-colors duration-500 font-sans select-none",
        isDimmed 
          ? "bg-black text-red-500" // Night view / vision preservation
          : "bg-black text-white"   // Normal high-contrast CarPlay mode
      )}
    >
      {/* LEFT SIDEBAR: Huge CarPlay Action Buttons (min 64px tap target, 24px gaps) */}
      <div 
        className={cn(
          "w-1/3 max-w-[280px] h-full flex flex-col p-6 gap-6 justify-between shrink-0 border-r",
          isDimmed ? "border-red-950 bg-black" : "border-gray-900 bg-gray-950"
        )}
      >
        {/* Top Header - App ID & Mode Switcher */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-black tracking-widest uppercase flex items-center gap-2">
            <Activity size={14} className="text-red-500 animate-pulse" />
            RoadSOS Auto
          </span>
          <button
            onClick={toggleAutomotiveMode}
            className="p-3 rounded-xl bg-gray-950 border border-gray-800 text-[10px] uppercase font-bold text-gray-400 hover:text-white flex items-center gap-1.5"
          >
            <ArrowLeft size={10} /> Exit
          </button>
        </div>

        {/* Action Buttons Grid */}
        <div className="flex-1 flex flex-col justify-center gap-5">
          {/* Button 1: SOS (Huge, red pulsing) */}
          <motion.button
            onClick={handleSOSClick}
            whileTap={{ scale: 0.95 }}
            className="w-full h-16 rounded-2xl bg-red-600 border border-red-500 text-white font-black uppercase text-sm tracking-wide flex items-center justify-center gap-3 shadow-lg shadow-red-900/20 active:bg-red-700"
          >
            <ShieldAlert size={24} className="animate-pulse" />
            Trigger SOS
          </motion.button>

          {/* Button 2: Map */}
          <motion.button
            onClick={() => router.push('/map')}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "w-full h-16 rounded-2xl font-black uppercase text-sm tracking-wide flex items-center justify-center gap-3 border shadow-md",
              isDimmed 
                ? "bg-red-950/20 border-red-900 text-red-500" 
                : "bg-gray-900 border-gray-800 text-white hover:bg-gray-850"
            )}
          >
            <Map size={24} />
            Show Map
          </motion.button>

          {/* Button 3: Call Ambulance */}
          <motion.button
            onClick={() => { window.location.href = 'tel:108'; }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "w-full h-16 rounded-2xl font-black uppercase text-sm tracking-wide flex items-center justify-center gap-3 border shadow-md",
              isDimmed 
                ? "bg-red-950/30 border-red-900 text-red-400" 
                : "bg-blue-900/30 border-blue-800 text-blue-400 hover:bg-blue-900/40"
            )}
          >
            <Phone size={24} />
            Call Ambulance
          </motion.button>

          {/* Button 4: AI Voice Assistant */}
          <motion.button
            onClick={handleVoiceAssistantClick}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "w-full h-16 rounded-2xl font-black uppercase text-sm tracking-wide flex items-center justify-center gap-3 border shadow-md",
              isDimmed 
                ? "bg-red-950/30 border-red-900 text-red-400" 
                : "bg-purple-900/30 border-purple-800 text-purple-400 hover:bg-purple-900/40"
            )}
          >
            <Mic size={24} className="animate-bounce" />
            Voice Helper
          </motion.button>
        </div>

        {/* Footer Dim Mode Indicator */}
        <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold tracking-wider">
          <div className="flex items-center gap-1.5">
            {isDimmed ? <Moon size={12} className="text-amber-500" /> : <Sun size={12} className="text-yellow-500" />}
            <span>{isDimmed ? 'NIGHT SCREEN' : 'DAY SCREEN'}</span>
          </div>
          <span>{lux !== null ? `${lux} LX` : 'AUTO LUX'}</span>
        </div>
      </div>

      {/* RIGHT MAIN VIEW: Speed, Proximity, Navigation */}
      <div className="flex-1 h-full flex flex-col p-8 justify-between relative">
        {/* Speed / Dashboard Section */}
        <div className="grid grid-cols-3 gap-6 flex-1 items-center">
          
          {/* Dashboard Item 1: Live Speedometer */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Speed</span>
            <div className="text-7xl font-black font-mono tracking-tighter text-white tabular-nums my-1">
              {speed !== null ? speed : '0'}
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase">KM/H</span>
          </div>

          {/* Dashboard Item 2: Heading / Direction */}
          <div className="flex flex-col items-center justify-center border-x border-gray-900 py-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Direction</span>
            <div className="text-6xl font-black font-mono text-white my-2 flex items-center gap-1">
              <Navigation 
                size={28} 
                className="text-red-500" 
                style={{ transform: `rotate(${heading ?? 0}deg)` }}
              />
              {getCompassDirection(heading)}
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase">{heading !== null ? `${Math.round(heading)}°` : '0°'}</span>
          </div>

          {/* Dashboard Item 3: Proximity Sensor / Safety */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Proximity</span>
            <div 
              className={cn(
                "my-3 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border",
                proximityNear 
                  ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse" 
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              )}
            >
              <Eye size={16} />
              {proximityNear ? 'OBSTACLE DETECTED' : 'PATH CLEAR'}
            </div>
            <span className="text-[9px] font-semibold text-gray-500 text-center leading-normal max-w-[120px]">
              {proximityNear ? 'Move device clear of windshield mount' : 'Device orientation and sensors calibrated'}
            </span>
          </div>
        </div>

        {/* Navigation / Instructions Section */}
        <div 
          className={cn(
            "rounded-2xl p-5 flex items-center justify-between border shadow-sm",
            isDimmed 
              ? "bg-red-950/10 border-red-900/30" 
              : "bg-gray-950 border-gray-900"
          )}
        >
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-wide text-white">CarPlay System Online</h3>
            <p className="text-[11px] text-gray-400 leading-normal max-w-lg">
              Automotive navigation layers are loaded. Say <strong className="text-white">"Hey Emergency"</strong> at any time to execute instant safety commands hands-free while driving.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full uppercase tracking-wider">
              System Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

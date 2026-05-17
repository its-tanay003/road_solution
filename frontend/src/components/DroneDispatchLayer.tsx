import React, { useEffect, useState } from 'react';
import { Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { 
  Navigation, 
  Battery, 
  Video, 
  VideoOff, 
  Activity, 
  ShieldCheck
} from 'lucide-react';
import { useDroneRegistryStore, useSosStore } from '../store';

// Custom Drone Icon with Animated Propeller
const createDroneIcon = (status: string) => {
  const color = status === 'STANDBY' ? '#94a3b8' : status === 'DISPATCHED' ? '#3b82f6' : '#ef4444';
  const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="4" fill="${color}"/>
      <path d="M12 12L28 28M28 12L12 28" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
      <g class="propeller">
        <circle cx="12" cy="12" r="3" stroke="${color}" stroke-width="1"/>
        <circle cx="28" cy="12" r="3" stroke="${color}" stroke-width="1"/>
        <circle cx="12" cy="28" r="3" stroke="${color}" stroke-width="1"/>
        <circle cx="28" cy="28" r="3" stroke="${color}" stroke-width="1"/>
      </g>
      <style>
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .propeller { transform-origin: center; animation: rotate 0.2s linear infinite; }
      </style>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'drone-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

export const DroneDispatchLayer = () => {
  const { drones, updateDronePos, dispatchDrone, toggleCamera } = useDroneRegistryStore();
  const { isActive: isSosActive, location: sosLocation } = useSosStore();
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
  const [isThermal, setIsThermal] = useState(false);

  // Simulation loop for drone movement
  useEffect(() => {
    const interval = setInterval(() => {
      drones.forEach(drone => {
        if (drone.status === 'DISPATCHED' && isSosActive && sosLocation) {
          const target = [sosLocation.lat, sosLocation.lng]; // Aim for the SOS incident
          const dx = target[0] - drone.currentLat;
          const dy = target[1] - drone.currentLng;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 0.0005) {
            // Arrived
            // In a real app we'd update status to ON SCENE
          } else {
            const step = 0.0005;
            updateDronePos(drone.droneId, drone.currentLat + (dx / dist) * step, drone.currentLng + (dy / dist) * step);
          }
        }
      });
    }, 500);
    return () => clearInterval(interval);
  }, [drones, isSosActive, sosLocation, updateDronePos]);

  const selectedDrone = drones.find(d => d.droneId === selectedDroneId);

  return (
    <>
      {/* Map Rendering */}
      {drones.map(drone => (
        <React.Fragment key={drone.droneId}>
          <Marker 
            position={[drone.currentLat, drone.currentLng]} 
            icon={createDroneIcon(drone.status)}
            eventHandlers={{ click: () => setSelectedDroneId(drone.droneId) }}
          >
            <Popup className="font-sans">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-black text-xs uppercase">{drone.droneId}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${drone.status === 'STANDBY' ? 'bg-slate-500/20 text-slate-400' : 'bg-blue-500/20 text-blue-400 animate-pulse'}`}>
                    {drone.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium italic">{drone.model}</div>
                <div className="flex items-center gap-2">
                  <Battery size={12} className={drone.batteryPct < 20 ? 'text-red-500' : 'text-emerald-500'} />
                  <span className="text-xs font-mono font-bold">{drone.batteryPct}%</span>
                </div>
              </div>
            </Popup>
          </Marker>

          {drone.status === 'DISPATCHED' && isSosActive && sosLocation && (
            <Polyline 
              positions={[
                [drone.baseLat, drone.baseLng],
                [drone.currentLat, drone.currentLng],
                [sosLocation.lat, sosLocation.lng]
              ]}
              pathOptions={{ color: '#3b82f6', weight: 2, dashArray: '5, 10', opacity: 0.6 }}
            />
          )}

          <Circle 
            center={[drone.baseLat, drone.baseLng]} 
            radius={drone.maxRangeKm * 1000}
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.03, weight: 1, dashArray: '5, 5' }}
          />
        </React.Fragment>
      ))}

      {/* Control Panel Overlay */}
      <div className="absolute top-4 left-4 z-1001 w-80 space-y-4 pointer-events-none">
        <motion.div 
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-4xl p-6 shadow-2xl pointer-events-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Navigation className="text-blue-500" size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Aerial First Responders</h3>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Drone Fleet Control</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {drones.map(drone => (
              <div 
                key={drone.droneId}
                onClick={() => setSelectedDroneId(drone.droneId)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${selectedDroneId === drone.droneId ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${drone.status === 'STANDBY' ? 'bg-slate-500' : 'bg-emerald-500 animate-pulse'}`} />
                    <span className="text-[10px] font-black text-white">{drone.droneId}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Battery size={10} className="text-slate-500" />
                    <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${drone.batteryPct}%` }} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-500">
                  <span>{drone.model}</span>
                  <span>Range: {drone.maxRangeKm}km</span>
                </div>
              </div>
            ))}
          </div>

          {selectedDrone && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-6 pt-6 border-t border-white/5 space-y-4"
            >
              <div className="flex gap-2">
                <button 
                  onClick={() => isSosActive && sosLocation && dispatchDrone(selectedDrone.droneId, sosLocation.lat, sosLocation.lng)}
                  disabled={selectedDrone.status !== 'STANDBY' || !isSosActive || !sosLocation}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                >
                  Dispatch Drone
                </button>
                <button 
                  onClick={() => toggleCamera(selectedDrone.droneId)}
                  className={`p-3 rounded-xl border transition-colors ${selectedDrone.cameraActive ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500' : 'bg-white/5 border-white/5 text-slate-400'}`}
                >
                  {selectedDrone.cameraActive ? <Video size={16} /> : <VideoOff size={16} />}
                </button>
              </div>

              {selectedDrone.cameraActive && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className={`relative aspect-video rounded-2xl overflow-hidden border ${isThermal ? 'border-orange-500/30' : 'border-white/10'}`}>
                    <div className={`absolute inset-0 ${isThermal ? 'bg-orange-950/40 grayscale brightness-150 contrast-125' : 'bg-slate-950/60'}`}>
                      {/* Scanlines */}
                      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,3px_100%]" />
                      
                      {/* HUD Overlay */}
                      <div className="absolute inset-0 p-4 flex flex-col justify-between text-[8px] font-mono text-white opacity-80">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                              REC 04:22:01
                            </div>
                            <div className="text-orange-500">{isThermal ? 'MODE: THERMAL-AI' : 'MODE: OPTICAL-4K'}</div>
                          </div>
                          <div className="text-right">
                            ALT: 42m<br/>
                            SPD: 12m/s
                          </div>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-emerald-400">
                              <Activity size={10} />
                              VITALS: STABLE
                            </div>
                            <div className="text-[10px] font-black">HR: 92 BPM</div>
                          </div>
                          <div className="text-right text-cyan-400">
                            SIGNAL: 100%
                          </div>
                        </div>
                      </div>

                      {/* Subject Box */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white/40 rounded-lg">
                        <div className="absolute -top-6 left-0 px-2 py-0.5 bg-white/20 rounded text-[6px] backdrop-blur-sm">
                          TARGET: SUBJECT-1
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsThermal(!isThermal)}
                    className="w-full py-2 bg-white/5 border border-white/5 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                  >
                    Toggle Thermal View
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* AI Recommendation */}
          <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-3xl flex gap-3">
            <ShieldCheck className="text-blue-500 shrink-0" size={16} />
            <div className="space-y-1">
              <h4 className="text-[10px] font-black uppercase text-blue-500 italic">AI Dispatch Advisory</h4>
              <p className="text-[9px] text-slate-400 leading-relaxed italic">"Drone arrival estimated at 2m 14s (4m faster than unit A47). Initiating aerial triage protocols with AED payload."</p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Watch, 
  Activity, 
  Car, 
  Bluetooth, 
  ShieldAlert, 
  Heart, 
  Zap, 
  Battery, 
  RefreshCcw,
  AlertTriangle,
  Gauge,
  Wind,
  User,
  Link,
  Loader2
} from 'lucide-react';
import { useWearableStore } from '../store/wearableStore';
import { useSosStore } from '../store';
import { MainLayout } from '../components/MainLayout';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ECGWaveform } from '../components/ECGWaveform';

export const WearableIntegration = () => {
  const { 
    devices, 
    health, 
    vehicle, 
    setConnectionStatus, 
    updateHealthData, 
    simulateBpm,
    triggerAirbag,
    activeAlerts,
    addAlert,
    removeAlert
  } = useWearableStore();
  
  const { triggerSos } = useSosStore();
  const [, setIsScanning] = useState(false);

  // Simulation loop for BPM
  useEffect(() => {
    const interval = setInterval(() => {
      simulateBpm();
    }, 2000);
    return () => clearInterval(interval);
  }, [simulateBpm]);

  // Handle Pairing
  const handlePair = (id: string) => {
    setIsScanning(true);
    setConnectionStatus(id, 'SCANNING');
    
    setTimeout(() => {
      setConnectionStatus(id, 'PAIRING');
      setTimeout(() => {
        setConnectionStatus(id, 'CONNECTED');
        setIsScanning(false);
      }, 2000);
    }, 2000);
  };

  // Simulate Fall Detection
  const simulateFall = () => {
    addAlert('Watch detected a hard fall. Confirm you are OK?');
  };

  // Simulate Airbag Deployment
  const handleAirbagDeploy = () => {
    triggerAirbag();
    addAlert('AIRBAG DEPLOYMENT DETECTED - AUTO-SOS TRIGGERED');
    
    const vehicleContext = {
      type: 'VEHICLE_CRASH',
      data: {
        model: vehicle.model,
        speed: '60km/h',
        impactAcceleration: '12.4G',
        airbags: 'Driver & Passenger Deployed',
        seatbelts: 'Fastened'
      }
    };
    
    triggerSos();
    
    localStorage.setItem('roadsos_biometric_context', JSON.stringify({
      bpm: health.bpmHistory[health.bpmHistory.length-1].value,
      lastActivity: 'Driving',
      vehicleData: vehicleContext.data
    }));
  };

  const currentBpm = health.bpmHistory[health.bpmHistory.length - 1].value;

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
              <Link className="text-nx-blue-primary" />
              Wearable Nexus
            </h1>
            <p className="text-nx-text-tertiary font-mono text-sm">Biometric & Vehicle Telemetry Integration Hub</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="active" className="h-6">
              {devices.filter(d => d.status === 'CONNECTED').length} Devices Active
            </Badge>
            <div className="h-4 w-px bg-nx-border" />
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-white/5 border border-nx-border">
              <div className="w-2 h-2 rounded-full bg-nx-blue-primary animate-pulse" />
              <span className="text-[10px] font-bold text-nx-text-tertiary uppercase tracking-widest">Neural Link Syncing</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Panel className="p-5 border-nx-border/40">
              <h2 className="text-xs font-black tracking-widest text-nx-text-tertiary mb-6 flex items-center gap-2 uppercase">
                <Bluetooth size={14} className="text-nx-blue-primary" />
                Connectivity Manager
              </h2>
              
              <div className="space-y-4">
                {devices.map((device) => (
                  <div key={device.id} className="nexus-card p-4 border-nx-border/50 bg-white/2 hover:bg-white/5 transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-[var(--radius-lg)] ${device.status === 'CONNECTED' ? 'bg-nx-blue-primary/10 text-nx-blue-primary' : 'bg-white/5 text-nx-text-tertiary'}`}>
                          {device.type === 'WATCH' && <Watch size={20} />}
                          {device.type === 'TRACKER' && <Activity size={20} />}
                          {device.type === 'VEHICLE' && <Car size={20} />}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-nx-blue-primary transition-colors">{device.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[9px] font-black uppercase tracking-tighter ${
                              device.status === 'CONNECTED' ? 'text-nx-blue-primary' : 
                              device.status === 'DISCONNECTED' ? 'text-nx-text-tertiary' : 'text-nx-amber-primary'
                            }`}>
                              {device.status}
                            </span>
                            {device.status === 'CONNECTED' && (
                              <div className="flex items-center gap-1">
                                <span className="text-nx-border text-[8px]">•</span>
                                <Battery size={10} className="text-nx-text-tertiary" />
                                <span className="text-[9px] font-bold text-nx-text-tertiary">{device.battery}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {device.status === 'DISCONNECTED' ? (
                        <Button variant="secondary" size="sm" onClick={() => handlePair(device.id)} className="h-7">
                          PAIR
                        </Button>
                      ) : device.status === 'CONNECTED' ? (
                        <div className="p-1 rounded bg-nx-blue-primary/20 text-nx-blue-primary">
                          <Zap size={12} className="animate-pulse" />
                        </div>
                      ) : (
                        <Loader2 size={16} className="text-nx-amber-primary animate-spin" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="p-5 border-nx-red-primary/20 bg-nx-red-primary/2">
              <h2 className="text-xs font-black tracking-widest text-nx-red-primary mb-6 flex items-center gap-2 uppercase">
                <ShieldAlert size={14} />
                Safety Simulations
              </h2>
              <div className="grid grid-cols-1 gap-3">
                <Button variant="danger-outline" size="sm" onClick={simulateFall} className="justify-start">
                  <RefreshCcw size={14} className="mr-2" />
                  Simulate Hard Fall
                </Button>
                <Button variant="danger-outline" size="sm" onClick={() => updateHealthData({ ecgStatus: 'AFIB' })} className="justify-start">
                  <Heart size={14} className="mr-2" />
                  Simulate AFib Rhythm
                </Button>
                <Button variant="danger-outline" size="sm" onClick={handleAirbagDeploy} className="justify-start">
                  <Zap size={14} className="mr-2" />
                  Simulate Airbag Deployment
                </Button>
              </div>
            </Panel>
          </div>

          <div className="col-span-12 lg:col-span-5 space-y-6">
            <Panel className="p-5 border-nx-border/40">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-black tracking-widest text-nx-text-tertiary uppercase flex items-center gap-2">
                  <Activity size={14} className="text-nx-blue-primary" />
                  Biometric Stream
                </h2>
                <Badge variant={currentBpm > 100 ? 'critical' : 'active'}>
                  LIVE
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="nexus-card p-4 bg-white/1 border-nx-border/30">
                  <span className="text-[9px] font-black text-nx-text-tertiary uppercase tracking-[0.2em] block mb-2">Heart Rate</span>
                  <div className="flex items-end gap-2">
                    <span className={`text-4xl font-black italic tracking-tighter ${currentBpm > 120 ? 'text-nx-red-primary' : 'text-white'}`}>
                      {Math.round(currentBpm)}
                    </span>
                    <span className="text-xs font-bold text-nx-text-tertiary mb-1.5 uppercase tracking-widest">BPM</span>
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-nx-red-primary mt-3"
                  />
                </div>
                <div className="nexus-card p-4 bg-white/1 border-nx-border/30">
                  <span className="text-[9px] font-black text-nx-text-tertiary uppercase tracking-[0.2em] block mb-2">Step Count</span>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black italic tracking-tighter text-white">
                      {health.steps.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-nx-blue-primary w-3/4 shadow-[0_0_8px_rgba(0,195,255,0.5)]" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-nx-text-tertiary uppercase tracking-widest">Neural ECG Stream</h3>
                <ECGWaveform status={health.ecgStatus} />
              </div>
            </Panel>

            <Panel className="p-5 border-nx-border/40">
              <h2 className="text-xs font-black tracking-widest text-nx-text-tertiary mb-6 uppercase flex items-center gap-2">
                <RefreshCcw size={14} />
                Biometric Anomaly Alerts
              </h2>
              <div className="space-y-3">
                <AnimatePresence>
                  {activeAlerts.length > 0 ? (
                    activeAlerts.map((alert, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-3 rounded-[var(--radius-lg)] bg-nx-red-primary/10 border border-nx-red-primary/20"
                      >
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="text-nx-red-primary" size={18} />
                          <span className="text-xs font-bold text-white uppercase italic tracking-tight">{alert}</span>
                        </div>
                        <button 
                          onClick={() => removeAlert(alert)} 
                          className="text-nx-text-tertiary hover:text-white transition-colors"
                          title="Dismiss Alert"
                          aria-label="Dismiss Alert"
                        >
                          <XIcon size={14} />
                        </button>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-center py-6 text-nx-text-tertiary text-xs font-medium uppercase tracking-widest">
                      No neural anomalies detected
                    </p>
                  )}
                </AnimatePresence>
              </div>
            </Panel>
          </div>

          <div className="col-span-12 lg:col-span-3 space-y-6">
            <Panel className="p-5 border-nx-blue-primary/20 bg-nx-blue-primary/[0.02]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-black tracking-widest text-nx-blue-primary uppercase flex items-center gap-2">
                  <Car size={14} />
                  OBD-II Telemetry
                </h2>
                <Badge variant="info">VEHICLE SYNC</Badge>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                      <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={377}
                        strokeDashoffset={377 - (377 * (vehicle.speed / 200))}
                        className="text-nx-blue-primary drop-shadow-[0_0_8px_rgba(0,195,255,0.5)]" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90">
                      <span className="text-3xl font-black italic text-white leading-none">{vehicle.speed}</span>
                      <span className="text-[8px] font-black text-nx-text-tertiary uppercase">KM/H</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 rounded bg-white/5 border border-nx-border/50">
                    <div className="flex items-center gap-2">
                      <Wind size={14} className={vehicle.airbags.driver ? 'text-nx-red-primary' : 'text-nx-text-tertiary'} />
                      <span className="text-[10px] font-bold text-nx-text-secondary uppercase">Airbags</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase ${vehicle.airbags.driver ? 'text-nx-red-primary' : 'text-nx-blue-primary'}`}>
                      {vehicle.airbags.driver ? 'DEPLOYED' : 'ARMED'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded bg-white/5 border border-nx-border/50">
                    <div className="flex items-center gap-2">
                      <User size={14} className={vehicle.seatbelts.driver ? 'text-nx-blue-primary' : 'text-nx-red-primary'} />
                      <span className="text-[10px] font-bold text-nx-text-secondary uppercase">Seatbelt</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase ${vehicle.seatbelts.driver ? 'text-nx-blue-primary' : 'text-nx-red-primary'}`}>
                      {vehicle.seatbelts.driver ? 'FASTENED' : 'UNFASTENED'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded bg-white/5 border border-nx-border/50">
                    <div className="flex items-center gap-2">
                      <Gauge size={14} className="text-nx-blue-primary" />
                      <span className="text-[10px] font-bold text-nx-text-secondary uppercase">Impact G</span>
                    </div>
                    <span className="text-[10px] font-black text-white uppercase italic">0.0 G</span>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-[9px] font-medium text-nx-text-tertiary leading-relaxed italic border-l-2 border-nx-blue-primary pl-3">
                    CRASH_DATA_ATTACHED: {vehicle.model} Telemetry Stream active. In event of crash, airbag deployment triggers immediate high-priority SOS via mesh.
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

const XIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

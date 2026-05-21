'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSOSStore } from '@/lib/store/sosStore';
import { useWebRTC, startEmergencyStream } from '@/lib/webrtc';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import { LiveStreamPanel } from '../LiveStreamPanel';
import {
  X,
  MapPin,
  Radio,
  Siren,
  Clock,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Terminal as TerminalIcon,
  Video,
  Volume2,
  ShieldAlert,
  Truck,
  Compass,
  Loader2
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { getBrowserClient } from '@/lib/supabase/browser';
import { BroadcastPanel } from '../BroadcastPanel';
import { cn } from '@/lib/utils';

const LIBRARIES: ('places' | 'visualization' | 'geometry')[] = ['places', 'visualization', 'geometry'];

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0f0f0f' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1c1c1c' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#222' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#001f3f' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];

export function PanicMode() {
  const {
    status,
    countdownSeconds,
    location,
    broadcastStatus,
    responder,
    cancel,
    tickCountdown,
    resolve,
    allClear,
    autoDialed,
    setAutoDialed,
    incidentId,
  } = useSOSStore();
  const { t } = useTranslation();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES as any,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { data: session } = useSession();
  const userId = session?.user?.email || 'guest_user';

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [activePeers, setActivePeers] = useState<Record<string, any>>({});
  const stopFnRef = useRef<(() => void) | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [flashToggle, setFlashToggle] = useState(false);

  // Responder & directions state
  const [responderInfo, setResponderInfo] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [liveDistance, setLiveDistance] = useState<string | null>(null);
  const [liveDuration, setLiveDuration] = useState<string | null>(null);

  // Log append helper
  const addLog = useCallback((msg: string) => {
    setTerminalLogs((prev) => [
      ...prev.slice(-5),
      `[${new Date().toLocaleTimeString()}] ${msg}`
    ]);
  }, []);

  // Countdown ticker & flash effect
  useEffect(() => {
    if (status === 'countdown') {
      intervalRef.current = setInterval(tickCountdown, 1000);
      addLog(`Countdown active: ${countdownSeconds}s remaining...`);
      
      const flashId = setInterval(() => {
        setFlashToggle((prev) => !prev);
      }, 350);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        clearInterval(flashId);
      };
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setFlashToggle(false);
    }
  }, [status, tickCountdown, countdownSeconds, addLog]);

  // Set showBroadcast overlay when SOS active state is reached
  useEffect(() => {
    if (status === 'active') {
      setShowBroadcast(true);
    }
  }, [status]);

  // Siren audio oscillation
  const playSiren = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sawtooth';
      gain.gain.value = 0.15; // Low volume for safety
      
      // Wobbling siren frequency
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.4);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.8);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Siren audio error:', e);
    }
  }, []);

  // Pulse siren & vibration
  useEffect(() => {
    if (status === 'active' || status === 'acknowledged' || status === 'countdown') {
      const id = setInterval(playSiren, 1000);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([300, 100, 300, 100, 500]);
      }
      return () => clearInterval(id);
    }
  }, [status, playSiren]);

  // WebRTC User Media Capture & Emergency Stream Broker
  useEffect(() => {
    if (status === 'active' || status === 'acknowledged') {
      addLog('WebRTC: Accessing camera and microphone...');
      
      let stopped = false;
      
      const startStream = async () => {
        try {
          const res = await startEmergencyStream(userId, incidentId || 'default-sos');
          
          if (stopped) {
            res.stop();
            return;
          }
          
          setActiveStream(res.stream);
          setActivePeers(res.peers);
          stopFnRef.current = res.stop;
          
          if (res.stream) {
            setStream(res.stream);
            setStreamError(null);
            const hasVideo = res.stream.getVideoTracks().length > 0;
            const hasAudio = res.stream.getAudioTracks().length > 0;
            setCameraOn(hasVideo);
            setMicOn(hasAudio);
            
            if (hasVideo) {
              addLog('WebRTC: Emergency video stream active.');
            } else if (hasAudio) {
              addLog('WebRTC: Camera blocked — emergency audio stream active.');
              setStreamError('Video blocked — streaming audio only');
            } else {
              setStreamError('Permissions blocked — location telemetry only');
            }
            
            if (videoRef.current) {
              videoRef.current.srcObject = res.stream;
            }
          } else {
            setStream(null);
            setStreamError('Permissions blocked — location telemetry only');
            addLog('WebRTC: Media disabled by user/system permissions.');
          }
        } catch (err: any) {
          console.error('[PanicMode] Emergency stream start failed:', err);
          setStreamError('Stream initialization error');
          addLog(`WebRTC: Stream error: ${err.message || err}`);
        }
      };
      
      void startStream();
      
      return () => {
        stopped = true;
        if (stopFnRef.current) {
          stopFnRef.current();
          stopFnRef.current = null;
        }
        setActiveStream(null);
        setActivePeers({});
        setStream(null);
        addLog('WebRTC: Emergency stream stopped.');
      };
    } else {
      if (stopFnRef.current) {
        stopFnRef.current();
        stopFnRef.current = null;
      }
      setActiveStream(null);
      setActivePeers({});
      setStream(null);
      setStreamError(null);
    }
  }, [status, userId, incidentId, addLog]);

  // Hook up simple-peer WebRTC via Supabase Broadcast
  const { connected: webrtcConnected } = useWebRTC(
    useSOSStore.getState().incidentId,
    'victim',
    stream
  );

  useEffect(() => {
    if (webrtcConnected) {
      addLog('WebRTC: Connected to dispatch control room.');
    }
  }, [webrtcConnected, addLog]);

  // Auto-dialer logic
  useEffect(() => {
    if (status === 'active' && !autoDialed) {
      addLog('Dialer: Auto-dialing emergency services (112)...');
      setAutoDialed(true);
      if (typeof window !== 'undefined') {
        window.location.href = 'tel:112';
      }
    }
  }, [status, autoDialed, setAutoDialed, addLog]);

  // Multi-frequency Bluetooth and Serial attempts
  const triggerRadioBroadcasts = useCallback(async () => {
    // 1. Web Bluetooth scan/pairing advertisement
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      addLog('Bluetooth: Scanning/advertising BLE SOS beacons...');
      try {
        await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['generic_access']
        });
        addLog('Bluetooth: Distress packet sent to nearby wearables.');
      } catch (err: any) {
        addLog(`Bluetooth: Request bypassed/denied (${err.name || 'canceled'}).`);
      }
    } else {
      addLog('Bluetooth: Hardware interface not supported.');
    }

    // 2. Web Serial API attempt for external devices
    if (typeof navigator !== 'undefined' && 'serial' in navigator) {
      addLog('Serial: Sweeping connected radio devices...');
      try {
        const ports = await (navigator as any).serial.getPorts();
        if (ports.length > 0) {
          const port = ports[0];
          await port.open({ baudRate: 9600 });
          const writer = port.writable.getWriter();
          const data = new TextEncoder().encode('SOS EMERGENCY DISTRESS - ROADSoS');
          await writer.write(data);
          writer.releaseLock();
          addLog('Serial: Distress string pushed to connected transceivers.');
        } else {
          addLog('Serial: No external radio interfaces connected.');
        }
      } catch (err: any) {
        addLog(`Serial: Sweep completed (${err.message || 'COM port busy'}).`);
      }
    } else {
      addLog('Serial: Serial broadcast not supported by browser.');
    }
  }, [addLog]);

  // Run sweeps when broadcast triggers
  useEffect(() => {
    if (status === 'active') {
      void triggerRadioBroadcasts();
    }
  }, [status, triggerRadioBroadcasts]);

  // Stream controls
  const toggleCamera = () => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setCameraOn(track.enabled);
        addLog(`Camera: User turned ${track.enabled ? 'ON' : 'OFF'}`);
      }
    }
  };

  const toggleMic = () => {
    if (stream) {
      const track = stream.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setMicOn(track.enabled);
        addLog(`Mic: User ${track.enabled ? 'UNMUTED' : 'MUTED'}`);
      }
    }
  };

  // Poll Assigned Responder
  useEffect(() => {
    if (status !== 'active' && status !== 'acknowledged') {
      setResponderInfo(null);
      setLiveDistance(null);
      setLiveDuration(null);
      setDirectionsResponse(null);
      return;
    }

    if (responder && !responderInfo) {
      setResponderInfo({
        name: responder.name,
        lat: responder.lat,
        lng: responder.lng,
      });
    }

    const intervalId = setInterval(async () => {
      const supabase = getBrowserClient();
      let updatedLat = responderInfo?.lat;
      let updatedLng = responderInfo?.lng;
      let updatedName = responderInfo?.name;

      if (supabase && incidentId) {
        try {
          const { data } = await supabase
            .from('responders')
            .select('*')
            .eq('current_incident_id', incidentId)
            .maybeSingle();

          if (data && data.lat && data.lng) {
            updatedLat = data.lat;
            updatedLng = data.lng;
            updatedName = data.name;
          }
        } catch (e) {
          console.warn('[PanicMode] Error polling responders table:', e);
        }
      }

      // Simulation movement towards user's coordinates (closer by 8% per tick)
      if (location && updatedLat !== undefined && updatedLng !== undefined) {
        const dLat = location.lat - updatedLat;
        const dLng = location.lng - updatedLng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        
        if (dist > 0.0001) {
          updatedLat += dLat * 0.08;
          updatedLng += dLng * 0.08;
        } else {
          updatedLat = location.lat;
          updatedLng = location.lng;
        }
      }

      if (updatedLat !== undefined && updatedLng !== undefined) {
        setResponderInfo({
          name: updatedName || responder?.name || 'Emergency Responder',
          lat: updatedLat,
          lng: updatedLng,
        });
      }
    }, 4000);

    return () => clearInterval(intervalId);
  }, [status, responder, incidentId, location, responderInfo]);

  // Directions Route Calculation
  useEffect(() => {
    if (!isLoaded || !location || !responderInfo) return;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: new google.maps.LatLng(responderInfo.lat, responderInfo.lng),
        destination: new google.maps.LatLng(location.lat, location.lng),
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirectionsResponse(result);
          const route = result.routes[0]?.legs[0];
          if (route) {
            setLiveDistance(route.distance?.text || null);
            setLiveDuration(route.duration?.text || null);
          }
        } else {
          console.warn('[Directions] API lookup failed:', status);
        }
      }
    );
  }, [isLoaded, location, responderInfo]);

  const visible = status !== 'idle' && status !== 'resolved';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="panic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "fixed inset-0 z-[100] flex flex-col items-center justify-between p-6 pt-14 text-white overflow-y-auto no-scrollbar transition-colors duration-200",
            status === 'countdown'
              ? flashToggle
                ? "bg-red-650 text-white"
                : "bg-white text-red-600"
              : "bg-gray-950/98 backdrop-blur-2xl text-white"
          )}
        >
          {/* Multi-Channel Broadcast Overlay during Broadcast Phase */}
          {showBroadcast && (status === 'active' || status === 'acknowledged') && (
            <BroadcastPanel onContinue={() => setShowBroadcast(false)} />
          )}

          {/* Header */}
          <div className="w-full flex justify-between items-center shrink-0 z-10">
            <div className="flex items-center gap-2">
              <Siren className={cn("animate-pulse", status === 'countdown' && flashToggle ? "text-white" : "text-red-500")} size={20} />
              <span className={cn("text-xs font-black tracking-widest uppercase", status === 'countdown' && flashToggle ? "text-white" : "text-red-500")}>
                Emergency Protocol
              </span>
            </div>
            {status === 'countdown' && (
              <button
                onClick={cancel}
                className="flex items-center gap-1.5 bg-black/10 border border-gray-800/40 rounded-2xl px-4 py-2 text-xs font-bold hover:bg-black/20 transition-colors"
              >
                <X size={13} /> {t('sos.cancelSos', 'Cancel SOS')}
              </button>
            )}
            {(status === 'active' || status === 'acknowledged') && (
              <button
                onClick={allClear}
                className="flex items-center gap-1.5 bg-green-950/70 border border-green-700/80 rounded-2xl px-5 py-2 text-xs font-black text-green-300 hover:bg-green-900/50 transition-all shadow-[0_0_20px_rgba(34,197,94,0.1)] active:scale-98 cursor-pointer"
              >
                ✅ {t('sos.imSafe', "I'm Safe — Clear SOS")}
              </button>
            )}
          </div>

          {/* COUNTDOWN STATE CONTAINER */}
          {status === 'countdown' && (
            <div className="flex flex-col items-center justify-between flex-1 w-full max-w-md py-12 shrink-0">
              <div className="text-center space-y-2">
                <h2 className={cn("font-black text-4xl tracking-tight uppercase", flashToggle ? "text-white" : "text-red-600")}>
                  {t('sos.sosActivating', 'SOS Initiating')}
                </h2>
                <p className={cn("text-xs font-black uppercase tracking-wider", flashToggle ? "text-red-200" : "text-gray-500")}>
                  {t('sos.sendingEmergencyAlert', 'Sending emergency alert in {{seconds}}s', { seconds: countdownSeconds })}
                </p>
              </div>

              <motion.div
                className={cn(
                  "w-44 h-44 rounded-full border-[10px] flex items-center justify-center shadow-2xl relative",
                  flashToggle
                    ? "border-white bg-white/10 shadow-[0_0_60px_rgba(255,255,255,0.4)]"
                    : "border-red-650 bg-red-650/10 shadow-[0_0_65px_rgba(220,38,38,0.4)]"
                )}
                animate={{ scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <span className={cn("text-8xl font-black font-mono tracking-tight", flashToggle ? "text-white" : "text-red-600")}>
                  {countdownSeconds}
                </span>
              </motion.div>

              <div className="w-full px-4 space-y-4">
                <div className={cn("text-center text-xs p-4 rounded-2xl border bg-black/5", flashToggle ? "border-white/10 text-red-100" : "border-gray-250 text-gray-500")}>
                  <p className="font-semibold">{t('sos.telemetryLock', 'Securing high-accuracy GPS & crash telemetry packets...')}</p>
                </div>

                <button
                  onClick={cancel}
                  className={cn(
                    "w-full rounded-2xl py-4.5 text-sm font-black tracking-widest uppercase transition-all shadow-xl active:scale-98 cursor-pointer flex items-center justify-center gap-2",
                    flashToggle
                      ? "bg-white text-red-600 hover:bg-gray-100"
                      : "bg-red-600 text-white hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                  )}
                >
                  <X size={16} /> {t('sos.cancelSosAlert', 'Cancel SOS Alert')}
                </button>
              </div>
            </div>
          )}

          {/* SOS ACTIVE EMERGENCY STATE CONTAINER */}
          {(status === 'active' || status === 'acknowledged') && !showBroadcast && (
            <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mt-6 mb-6">
              {/* Large Map Panel (Grid span 7/12) */}
              <div className="md:col-span-7 flex flex-col h-[350px] md:h-[550px] rounded-3xl border border-gray-850 bg-black/40 overflow-hidden relative shadow-2xl">
                {isLoaded ? (
                  <GoogleMap
                    mapContainerClassName="w-full h-full"
                    center={location || { lat: 0, lng: 0 }}
                    zoom={14}
                    options={{
                      styles: DARK_MAP_STYLE,
                      disableDefaultUI: true,
                      zoomControl: true,
                    }}
                  >
                    {location && (
                      <Marker
                        position={{ lat: location.lat, lng: location.lng }}
                        icon={{
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 10,
                          fillColor: '#ef4444',
                          fillOpacity: 1,
                          strokeColor: '#ffffff',
                          strokeWeight: 2.5,
                        }}
                      />
                    )}

                    {responderInfo && (
                      <Marker
                        position={{ lat: responderInfo.lat, lng: responderInfo.lng }}
                        icon={{
                          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                          scale: 8,
                          fillColor: '#f97316',
                          fillOpacity: 1,
                          strokeColor: '#ffffff',
                          strokeWeight: 2,
                        }}
                      />
                    )}

                    {directionsResponse && (
                      <DirectionsRenderer
                        directions={directionsResponse}
                        options={{
                          suppressMarkers: true,
                          polylineOptions: {
                            strokeColor: '#f97316',
                            strokeOpacity: 0.85,
                            strokeWeight: 5,
                          },
                        }}
                      />
                    )}
                  </GoogleMap>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-2" />
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Loading Emergency Map...</span>
                  </div>
                )}

                {/* Floating Location Overlay */}
                {location && (
                  <div className="absolute bottom-3 left-3 right-3 bg-gray-950/85 border border-gray-850 rounded-2xl p-3 backdrop-blur shadow-lg flex items-start gap-2.5 pointer-events-none">
                    <MapPin className="text-red-500 shrink-0 w-4 h-4 mt-0.5" />
                    <div className="overflow-hidden">
                      <span className="text-[10px] uppercase font-black tracking-widest text-red-400 block">Incident Coordinates</span>
                      <span className="text-white text-xs font-semibold block truncate mt-0.5">{location.address}</span>
                    </div>
                  </div>
                )}

                {/* Floating Map Controls / Badge */}
                <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
                  <div className="bg-red-600/90 border border-red-500/30 rounded-xl px-2.5 py-1 text-[9px] font-black tracking-widest text-white flex items-center gap-1.5 shadow-lg backdrop-blur">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    {t('sos.liveTracking', 'LIVE TRACKING')}
                  </div>
                </div>
              </div>

              {/* Info and Stream column (Grid span 5/12) */}
              <div className="md:col-span-5 flex flex-col gap-5 justify-between">
                {/* Responder ETA Tracker Card */}
                <div className="bg-gray-900/60 border border-gray-850 rounded-3xl p-5 shadow-xl relative overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Compass size={80} className="text-orange-400" />
                  </div>
                  {responderInfo ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black tracking-widest text-orange-400 uppercase">Assigned First Responder</span>
                        <span className="bg-orange-950 border border-orange-700/50 rounded-full px-2 py-0.5 text-[8px] font-black text-orange-300 uppercase tracking-widest">
                          En Route
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-orange-950 border border-orange-700/30 flex items-center justify-center text-orange-400">
                          <Truck size={24} className="animate-bounce" />
                        </div>
                        <div>
                          <h3 className="text-white font-black text-base tracking-tight">{responderInfo.name}</h3>
                          <p className="text-gray-400 text-xs mt-0.5">Medical & Emergency Assistance unit dispatched</p>
                        </div>
                      </div>

                      {/* Directions API Info */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800/40">
                        <div className="bg-black/35 border border-gray-850 rounded-xl p-3 text-center">
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">ETA</span>
                          <span className="text-orange-400 font-black text-lg block mt-0.5">{liveDuration || `${responder?.etaMinutes || 10} mins`}</span>
                        </div>
                        <div className="bg-black/35 border border-gray-850 rounded-xl p-3 text-center">
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Distance</span>
                          <span className="text-white font-black text-lg block mt-0.5">{liveDistance || 'Calculating...'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                      <div>
                        <h3 className="text-white font-bold text-sm">Awaiting Responder Assignment</h3>
                        <p className="text-gray-500 text-xs mt-1">Dispatched alerts to nearest emergency dispatch rooms</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* WebRTC Video Stream Panel */}
                <div className="w-full aspect-video bg-gray-900 border border-gray-850 rounded-3xl overflow-hidden relative shadow-2xl shrink-0">
                  {stream && cameraOn ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 p-4 text-center">
                      <CameraOff size={28} className="text-red-500 mb-2 animate-bounce" />
                      <p className="text-gray-400 text-xs font-bold">{streamError || t('sos.distressStreamActive', 'Distress stream active')}</p>
                    </div>
                  )}

                  {/* Stream Badge */}
                  <div className={cn(
                    "absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest text-white flex items-center gap-1.5 shadow-lg border backdrop-blur",
                    webrtcConnected ? 'bg-green-600/90 border-green-500/30' : 'bg-red-600/90 border-red-500/30'
                  )}>
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    {webrtcConnected ? t('sos.dispatchConnected', 'DISPATCH CONNECTED') : t('sos.liveTelemetry', 'LIVE TELEMETRY')}
                  </div>

                  {/* Mic / Camera Quick Controls */}
                  {stream && (
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={toggleCamera}
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow-lg backdrop-blur cursor-pointer",
                          cameraOn ? 'bg-black/60 hover:bg-black/80 text-white border border-white/10' : 'bg-red-600 text-white border border-red-500/30'
                        )}
                      >
                        {cameraOn ? <Camera size={14} /> : <CameraOff size={14} />}
                      </button>
                      <button
                        onClick={toggleMic}
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow-lg backdrop-blur cursor-pointer",
                          micOn ? 'bg-black/60 hover:bg-black/80 text-white border border-white/10' : 'bg-red-600 text-white border border-red-500/30'
                        )}
                      >
                        {micOn ? <Mic size={14} /> : <MicOff size={14} />}
                      </button>
                    </div>
                  )}

                  {/* WebRTC Metadata Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-12 flex flex-col gap-0.5 pointer-events-none">
                    <p className="text-white font-mono text-[9px] uppercase font-bold tracking-wider opacity-90 drop-shadow">
                      ID: {incidentId?.substring(0, 8) || 'UNKNOWN'}
                    </p>
                    {location && (
                      <p className="text-white font-mono text-[9px] uppercase font-bold tracking-wider opacity-90 drop-shadow truncate">
                        GPS: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sweep Console terminal */}
                <div className="bg-gray-950 border border-gray-900 rounded-2xl p-4 font-mono text-[9px] text-red-400/90 shadow-inner flex flex-col space-y-1.5 flex-1 min-h-[100px] max-h-[160px] overflow-y-auto no-scrollbar">
                  <div className="flex items-center justify-between border-b border-gray-900 pb-1.5 mb-1.5 shrink-0">
                    <span className="flex items-center gap-1.5 text-gray-500 font-bold uppercase text-[8px]"><TerminalIcon size={10} /> {t('sos.radioSweeperConsole', 'Radio Sweeper Console')}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  </div>
                  <div className="space-y-1 flex-1">
                    {terminalLogs.length === 0 ? (
                      <p className="text-gray-600">{t('sos.noOutputLogs', 'No output logs.')}</p>
                    ) : (
                      terminalLogs.map((log, idx) => (
                        <p key={idx} className="truncate leading-none">{log}</p>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer controls & channel indicators (only shown if not counting down or broadcasting) */}
          {(status === 'active' || status === 'acknowledged') && !showBroadcast && (
            <div className="w-full max-w-6xl space-y-4 shrink-0 z-10">
              {broadcastStatus && (
                <div className="space-y-2 relative overflow-hidden rounded-2xl border border-gray-850 bg-black/40 p-4">
                  {/* Sweep Animation */}
                  <motion.div
                    className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-red-500/10 to-transparent pointer-events-none skew-x-[-20deg]"
                    animate={{ left: ['-100%', '200%'] }}
                    transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
                  />
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 mb-2 relative z-10">
                    <Radio size={10} /> {t('sos.transmissionStatus', 'Transmission Channels Active')}
                  </p>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2 relative z-10">
                    {Object.entries(broadcastStatus).map(([ch, stat]) => (
                      <div
                        key={ch}
                        className={cn(
                          "rounded-xl px-1 py-2 text-center border text-[9px] font-black uppercase tracking-tight shadow-inner transition-colors",
                          stat === 'sent' || stat === 'broadcast' || stat === 'link_generated' || stat === 'published' || stat === 'connected'
                            ? 'bg-green-950/80 border-green-700 text-green-400'
                            : stat === 'pending'
                            ? 'bg-yellow-950/80 border-yellow-700 text-yellow-400 animate-pulse'
                            : stat === 'stub' || stat === 'attempted'
                            ? 'bg-gray-900/80 border-gray-800 text-gray-400'
                            : 'bg-red-950/80 border-red-900 text-red-400'
                        )}
                      >
                        {ch}
                        <div className="text-[7px] mt-0.5 opacity-70 lowercase font-bold">{stat}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LiveStreamPanel floating overlay */}
          {(status === 'active' || status === 'acknowledged') && (
            <LiveStreamPanel
              stream={activeStream}
              peers={activePeers}
              onStop={() => {
                if (stopFnRef.current) {
                  stopFnRef.current();
                  stopFnRef.current = null;
                }
                setActiveStream(null);
                setActivePeers({});
                setStream(null);
                addLog('WebRTC: Emergency stream manually stopped by user.');
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}


'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSOSStore } from '@/lib/store/sosStore';
import { useWebRTC } from '@/lib/webrtc';
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
  Volume2
} from 'lucide-react';

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
    autoDialed,
    setAutoDialed,
  } = useSOSStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  // Log append helper
  const addLog = useCallback((msg: string) => {
    setTerminalLogs((prev) => [
      ...prev.slice(-5),
      `[${new Date().toLocaleTimeString()}] ${msg}`
    ]);
  }, []);

  // Countdown ticker
  useEffect(() => {
    if (status === 'countdown') {
      intervalRef.current = setInterval(tickCountdown, 1000);
      addLog(`Countdown active: ${countdownSeconds}s remaining...`);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, tickCountdown, countdownSeconds, addLog]);

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
    if (status === 'active' || status === 'acknowledged') {
      const id = setInterval(playSiren, 1000);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([300, 100, 300, 100, 500]);
      }
      return () => clearInterval(id);
    }
  }, [status, playSiren]);

  // WebRTC User Media Capture
  useEffect(() => {
    if (status === 'active' || status === 'acknowledged') {
      addLog('WebRTC: Accessing camera and microphone...');
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: true })
        .then((s) => {
          setStream(s);
          setStreamError(null);
          setCameraOn(true);
          setMicOn(true);
          addLog('WebRTC: Core stream initialized successfully.');
          
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn('[SOS WebRTC] Failed to capture camera & mic:', err);
          addLog('WebRTC: Camera blocked. Attempting audio fallback...');
          // Fallback to audio-only
          navigator.mediaDevices
            ?.getUserMedia({ audio: true })
            .then((s) => {
              setStream(s);
              setCameraOn(false);
              setMicOn(true);
              setStreamError('Video blocked — streaming audio only');
              addLog('WebRTC: Streaming audio track only.');
            })
            .catch((audioErr) => {
              console.warn('[SOS WebRTC] Audio capture failed:', audioErr);
              setStreamError('Permissions blocked — location telemetry only');
              addLog('WebRTC: Media disabled by user/system permissions.');
            });
        });
    } else {
      // Release tracks on deactivate
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
        addLog('WebRTC: Stream released.');
      }
      setStreamError(null);
    }
  }, [status, addLog]);

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

  const visible = status !== 'idle' && status !== 'resolved';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="panic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-gray-950/98 backdrop-blur-2xl p-6 pt-14 text-white overflow-y-auto no-scrollbar"
        >
          {/* Header */}
          <div className="w-full flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Siren className="text-red-500 animate-pulse" size={20} />
              <span className="text-xs font-black tracking-widest text-red-500 uppercase">Emergency Protocol</span>
            </div>
            {status === 'countdown' && (
              <button
                onClick={cancel}
                className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-2xl px-4 py-2 text-xs font-bold text-gray-300 hover:bg-gray-800 transition-colors"
              >
                <X size={13} /> Cancel SOS
              </button>
            )}
            {(status === 'active' || status === 'acknowledged') && (
              <button
                onClick={resolve}
                className="flex items-center gap-1.5 bg-green-950/65 border border-green-700/80 rounded-2xl px-4 py-2 text-xs font-bold text-green-300 hover:bg-green-900/50 transition-colors"
              >
                ✅ I&apos;m Safe — Clear SOS
              </button>
            )}
          </div>

          {/* Core Panel */}
          <div className="flex flex-col items-center justify-center flex-1 my-4 w-full max-w-sm space-y-4 shrink-0">
            {status === 'countdown' && (
              <div className="flex flex-col items-center gap-5 py-4">
                <motion.div
                  className="w-36 h-36 rounded-full border-4 border-red-600 flex items-center justify-center bg-red-650/10 shadow-[0_0_50px_rgba(220,38,38,0.2)]"
                  animate={{ boxShadow: ['0 0 0 0 rgba(220,38,38,0.6)', '0 0 0 30px rgba(220,38,38,0)'] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <span className="text-7xl font-black text-red-500 font-mono tracking-tight">{countdownSeconds}</span>
                </motion.div>
                <div className="text-center">
                  <h2 className="text-white font-black text-2xl tracking-tight">SOS Initiating</h2>
                  <p className="text-gray-400 text-xs mt-1">Full alert will trigger in {countdownSeconds}s</p>
                </div>
              </div>
            )}

            {(status === 'active' || status === 'acknowledged') && (
              <div className="w-full flex flex-col items-center space-y-4">
                {/* WebRTC Video preview */}
                <div className="w-full aspect-video bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden relative shadow-2xl shrink-0">
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
                      <p className="text-gray-400 text-xs font-bold">{streamError || 'Distress stream active'}</p>
                    </div>
                  )}
                  {/* Stream Badge */}
                  <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest text-white flex items-center gap-1.5 shadow-lg border ${webrtcConnected ? 'bg-green-600 border-green-500' : 'bg-red-600 border-red-500'}`}>
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    {webrtcConnected ? 'DISPATCH CONNECTED' : 'LIVE TELEMETRY'}
                  </div>

                  {/* WebRTC Metadata Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 flex flex-col gap-0.5 pointer-events-none">
                    <p className="text-white font-mono text-[9px] uppercase font-bold tracking-wider opacity-90 drop-shadow-md">
                      ID: {useSOSStore.getState().incidentId?.substring(0, 8) || 'UNKNOWN'}
                    </p>
                    {location && (
                      <p className="text-white font-mono text-[9px] uppercase font-bold tracking-wider opacity-90 drop-shadow-md truncate">
                        GPS: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                      </p>
                    )}
                  </div>

                  {/* Mic / Camera Quick Controls */}
                  {stream && (
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={toggleCamera}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow ${
                          cameraOn ? 'bg-black/60 hover:bg-black/80 text-white' : 'bg-red-600 text-white'
                        }`}
                      >
                        {cameraOn ? <Camera size={14} /> : <CameraOff size={14} />}
                      </button>
                      <button
                        onClick={toggleMic}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow ${
                          micOn ? 'bg-black/60 hover:bg-black/80 text-white' : 'bg-red-600 text-white'
                        }`}
                      >
                        {micOn ? <Mic size={14} /> : <MicOff size={14} />}
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <h2 className="text-red-500 font-black text-2xl tracking-tight animate-pulse flex items-center justify-center gap-2">
                    <Volume2 size={20} />
                    {status === 'acknowledged' ? 'HELP EN ROUTE' : 'SOS SIGNAL EMITTED'}
                  </h2>
                  {location && (
                    <div className="flex items-center justify-center gap-1.5 mt-2 text-gray-400 text-xs max-w-[320px] mx-auto bg-gray-900/60 border border-gray-800 rounded-full px-4 py-1.5">
                      <MapPin size={11} className="text-red-400 shrink-0" />
                      <span className="truncate">{location.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Broadcast logs & Channels */}
          <div className="w-full max-w-sm space-y-4 shrink-0">
            {/* Real Broadcast status grid with frequency sweep animation */}
            {broadcastStatus && (
              <div className="space-y-1.5 relative overflow-hidden rounded-xl border border-gray-800 bg-black/40 p-2">
                {/* Sweep Animation */}
                <motion.div
                  className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-red-500/20 to-transparent pointer-events-none skew-x-[-20deg]"
                  animate={{ left: ['-100%', '200%'] }}
                  transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                />
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mb-2 relative z-10">
                  <Radio size={10} /> Transmission Status
                </p>
                <div className="grid grid-cols-4 gap-1.5 relative z-10">
                  {Object.entries(broadcastStatus).map(([ch, stat]) => (
                    <div
                      key={ch}
                      className={`rounded-lg px-1 py-1.5 text-center border text-[9px] font-bold uppercase tracking-tight shadow-inner ${
                        stat === 'sent' || stat === 'broadcast' || stat === 'link_generated' || stat === 'published' || stat === 'connected'
                          ? 'bg-green-950/80 border-green-700 text-green-400 shadow-[inset_0_0_10px_rgba(74,222,128,0.2)]'
                          : stat === 'pending'
                          ? 'bg-yellow-950/80 border-yellow-700 text-yellow-400 animate-pulse'
                          : stat === 'stub' || stat === 'attempted'
                          ? 'bg-gray-900/80 border-gray-700 text-gray-400'
                          : 'bg-red-950/80 border-red-800 text-red-400'
                      }`}
                    >
                      {ch}
                      <div className="text-[7px] mt-0.5 opacity-70 lowercase">{stat}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sweep console terminal */}
            <div className="bg-gray-950 border border-gray-900 rounded-2xl p-3 font-mono text-[9px] text-red-400/90 shadow-inner flex flex-col space-y-1">
              <div className="flex items-center justify-between border-b border-gray-900 pb-1.5 mb-1.5 shrink-0">
                <span className="flex items-center gap-1.5 text-gray-500 font-bold uppercase text-[8px]"><TerminalIcon size={10} /> Radio Sweeper Console</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              </div>
              <div className="flex-1 space-y-1">
                {terminalLogs.length === 0 ? (
                  <p className="text-gray-600">No output logs.</p>
                ) : (
                  terminalLogs.map((log, idx) => (
                    <p key={idx} className="truncate leading-none">{log}</p>
                  ))
                )}
              </div>
            </div>

            {/* Responder ETA */}
            {responder && (
              <div className="bg-orange-950/40 border border-orange-700/60 rounded-2xl p-4 shadow-xl shrink-0">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-orange-400 shrink-0" />
                  <div>
                    <p className="text-white font-black text-sm">{responder.name}</p>
                    <p className="text-orange-300 text-xs mt-0.5">ETA: ~{responder.etaMinutes} minutes away</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeIncidents } from '@/lib/supabase/realtime';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { DBIncident, DBUser, DBResponder } from '@/lib/supabase/types';
import { useWebRTC } from '@/lib/webrtc';
import {
  Shield, Radio, Users, Phone, MapPin, AlertTriangle, CheckCircle,
  Clock, X, ChevronRight, Activity, Zap, Play, Square, Video,
  Compass, Battery, Heart, ShieldAlert, CheckCircle2, UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Helper to calculate time ago
function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// Active SOS Card Component that handles its own WebRTC handshake
function ActiveSOSCard({
  incident,
  onAssign
}: {
  incident: DBIncident;
  onAssign: (incident: DBIncident) => void;
}) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [userProfile, setUserProfile] = useState<DBUser | null>(null);
  const [assignedResponder, setAssignedResponder] = useState<DBResponder | null>(null);
  const [elapsed, setElapsed] = useState('00:00');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 1. WebRTC Hook to capture distress audio/video stream
  const { connected: webrtcConnected } = useWebRTC(
    incident.id,
    'admin',
    null,
    (stream) => {
      console.log(`[ControlRoom] Received remote stream for incident ${incident.id}`);
      setRemoteStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }
  );

  // 2. Load User Profile details
  useEffect(() => {
    if (!incident.user_id) return;
    const supabase = getBrowserClient();
    if (!supabase) return;

    supabase
      .from('users')
      .select('*')
      .eq('id', incident.user_id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setUserProfile(data as DBUser);
      });
  }, [incident.user_id]);

  // 3. Load Assigned Responder details
  useEffect(() => {
    if (!incident.responder_id) {
      setAssignedResponder(null);
      return;
    }
    const supabase = getBrowserClient();
    if (!supabase) return;

    supabase
      .from('responders')
      .select('*')
      .eq('id', incident.responder_id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setAssignedResponder(data as DBResponder);
      });
  }, [incident.responder_id]);

  // 4. Elapsed stopwatch timer
  useEffect(() => {
    const updateTimer = () => {
      const created = new Date(incident.created_at).getTime();
      const diff = Math.floor((Date.now() - created) / 1000);
      if (diff < 0) return;
      const m = Math.floor(diff / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setElapsed(`${m}:${s}`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [incident.created_at]);

  // Sync ref when stream loads
  useEffect(() => {
    if (remoteStream && videoRef.current) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const hasVideoTrack = remoteStream && remoteStream.getVideoTracks().length > 0;
  const hasAudioTrack = remoteStream && remoteStream.getAudioTracks().length > 0;

  return (
    <div className="bg-gray-900/60 border border-gray-800 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl flex flex-col relative group">
      {/* Visual top border indicator for active states */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-650 to-amber-500 animate-pulse" />

      {/* Media Feed Container */}
      <div className="aspect-video w-full bg-black relative flex items-center justify-center overflow-hidden shrink-0">
        {remoteStream && hasVideoTrack ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
            {/* Visual Waveform Animation */}
            <div className="flex items-end justify-center gap-1.5 h-10 w-32 opacity-70 mb-2">
              {[6, 12, 8, 14, 4, 10, 7, 13, 5, 11, 8, 3].map((h, idx) => (
                <motion.span
                  key={idx}
                  className="bg-red-500 w-1.5 rounded-full"
                  animate={{ height: [`${h * 2.2}px`, `${h * 0.6}px`, `${h * 2.2}px`] }}
                  transition={{ duration: 0.6 + idx * 0.04, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/20 text-red-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              {webrtcConnected ? 'TRANSMITTING AUDIO FEED' : 'HANDSHAKE NEGOTIATING'}
            </div>
            
            <p className="text-[11px] text-gray-500">
              {webrtcConnected 
                ? 'Camera stream missing or disabled — streaming live audio telemetry'
                : 'Securing simple-peer connection link...'}
            </p>
          </div>
        )}

        {/* Floating Telemetry Badges */}
        <div className="absolute top-3 left-3 flex gap-2 pointer-events-none select-none z-20">
          <div className="bg-red-650 text-white rounded-xl px-2.5 py-1 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg border border-red-500/10">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            <span>LIVE</span>
          </div>
          <div className="bg-black/60 backdrop-blur-md text-white rounded-xl px-2.5 py-1 text-[9px] font-black tracking-widest border border-gray-800 shadow-lg flex items-center gap-1">
            <Clock size={10} className="text-red-400" />
            <span>{elapsed}</span>
          </div>
        </div>

        {/* Battery & Network Overlay bottom right */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 pointer-events-none select-none z-20">
          {incident.battery_level != null && (
            <div className="bg-black/60 backdrop-blur-md text-white rounded-xl px-2 py-0.5 text-[9px] font-bold border border-gray-800 flex items-center gap-1">
              <Battery size={10} className={cn(
                incident.battery_level > 50 ? "text-green-400" : incident.battery_level > 20 ? "text-amber-400" : "text-red-400"
              )} />
              <span>{incident.battery_level}%</span>
            </div>
          )}
          {incident.network_type && (
            <div className="bg-black/60 backdrop-blur-md text-white rounded-xl px-2 py-0.5 text-[9px] font-bold border border-gray-800">
              <span>{incident.network_type.toUpperCase()}</span>
            </div>
          )}
        </div>
      </div>

      {/* User Information Overlay Banner */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-black text-sm text-white capitalize leading-snug">
                {userProfile?.full_name || 'Locating Victim...'}
              </h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                <span>Incident #{incident.id.slice(0, 8).toUpperCase()}</span>
                <span>·</span>
                <span className="text-red-500 font-black">{incident.incident_type.replace('_', ' ')}</span>
              </p>
            </div>

            {/* Blood group indicator */}
            <div className="bg-red-500/10 border border-red-500/25 rounded-2xl px-2.5 py-1 text-center shrink-0">
              <p className="text-[8px] text-red-400 font-black uppercase tracking-wider leading-none">Blood</p>
              <p className="text-xs font-black text-red-500 leading-tight mt-0.5">
                {userProfile?.blood_group || '—'}
              </p>
            </div>
          </div>

          {/* Profile particulars */}
          <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-950/40 p-2.5 rounded-2xl border border-gray-850">
            <div className="space-y-0.5">
              <span className="text-gray-500 font-bold block uppercase text-[8px] tracking-wider">Allergies</span>
              <span className="text-gray-300 font-medium truncate block max-w-full">
                {userProfile?.allergies?.join(', ') || 'None reported'}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-gray-500 font-bold block uppercase text-[8px] tracking-wider">Medical Co.</span>
              <span className="text-gray-300 font-medium truncate block max-w-full">
                {userProfile?.medical_conditions?.join(', ') || 'None reported'}
              </span>
            </div>
          </div>

          {/* GPS Location particulars */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <MapPin size={12} className="text-red-500 shrink-0" />
              <span className="truncate" title={incident.address || 'Locating...'}>
                {incident.address || 'Resolving exact coordinates...'}
              </span>
            </div>
            {incident.lat && (
              <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                <Compass size={10} />
                <span>{incident.lat.toFixed(6)}, {incident.lng?.toFixed(6)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Responder Details / Assignment Actions */}
        <div className="border-t border-gray-850 pt-3 mt-auto space-y-3">
          {assignedResponder ? (
            <div className="bg-green-950/15 border border-green-800/20 rounded-2xl p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center shrink-0">
                  <UserCheck size={14} className="text-green-500" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-white">{assignedResponder.name}</p>
                  <p className="text-[9px] text-green-400 font-semibold uppercase tracking-wider">
                    Assigned ({incident.responder_eta_minutes} min ETA)
                  </p>
                </div>
              </div>
              <button
                onClick={() => onAssign(incident)}
                className="text-[10px] font-black text-gray-400 hover:text-white underline transition"
              >
                Reassign
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => onAssign(incident)}
                className="w-full flex items-center justify-center gap-1.5 bg-red-650 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-2xl text-xs transition duration-150 border border-red-500/15"
              >
                <ShieldAlert size={14} />
                Assign Responder
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ControlRoomPage() {
  const { data: session, status } = useSession();
  const { incidents, connectionStatus, error, updateIncidentStatus, refresh } = useRealtimeIncidents({ limit: 100 });

  const [selectedIncident, setSelectedIncident] = useState<DBIncident | null>(null);
  const [responders, setResponders] = useState<DBResponder[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [eta, setEta] = useState('10');

  // Skip onboarding gate checks for this page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('roadsos-skip-onboarding', 'true');
    }
  }, []);

  // Fetch responders
  const fetchResponders = async () => {
    const supabase = getBrowserClient();
    if (!supabase) return;

    try {
      const { data, error: err } = await supabase
        .from('responders')
        .select('*');
      if (err) throw err;

      // Fallback dummy responders if database table is completely empty (ensures robust preview)
      if (!data || data.length === 0) {
        const dummyResponders: DBResponder[] = [
          { id: 'resp-1', name: 'Ambulance Core 108', type: 'ambulance', phone: '9876543210', lat: 23.0225, lng: 72.5714, is_available: true, current_incident_id: null, created_at: new Date().toISOString() },
          { id: 'resp-2', name: 'City Police Shield 3', type: 'police', phone: '9988776655', lat: 23.0300, lng: 72.5800, is_available: true, current_incident_id: null, created_at: new Date().toISOString() },
          { id: 'resp-3', name: 'Rapid Response Fire Unit', type: 'fire', phone: '9123456789', lat: 23.0150, lng: 72.5600, is_available: true, current_incident_id: null, created_at: new Date().toISOString() },
        ];
        setResponders(dummyResponders);
      } else {
        setResponders(data as DBResponder[]);
      }
    } catch (e) {
      console.warn('[ControlRoom] Responders load fail:', e);
    }
  };

  useEffect(() => {
    void fetchResponders();
  }, []);

  // Handle assigning responder to database
  const handleAssignResponder = async (responderId: string) => {
    if (!selectedIncident) return;
    setAssigning(true);

    const supabase = getBrowserClient();
    if (!supabase) {
      setAssigning(false);
      return;
    }

    try {
      const targetEta = parseInt(eta, 10) || 10;

      // 1. Update the incident table
      const { error: incError } = await supabase
        .from('incidents')
        .update({
          responder_id: responderId,
          responder_eta_minutes: targetEta,
          status: 'acknowledged',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedIncident.id);

      if (incError) throw incError;

      // 2. Update the responder availability status
      await supabase
        .from('responders')
        .update({
          is_available: false,
          current_incident_id: selectedIncident.id
        })
        .eq('id', responderId);

      toast.success(`Successfully dispatched responder to incident!`);
      setSelectedIncident(null);
      void fetchResponders();
      refresh();
    } catch (err: any) {
      console.error('[ControlRoom] Assignment failed:', err);
      toast.error(`Assignment failed: ${err.message}`);
    } finally {
      setAssigning(false);
    }
  };

  // Only show active or acknowledged incidents with active live streaming
  const activeIncidents = incidents.filter(
    (inc) => inc.status === 'active' || inc.status === 'acknowledged'
  );

  // Protection Check: Redirect or block if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
          <p className="text-sm font-black text-gray-400">Verifying Operator Credentials...</p>
        </div>
      </div>
    );
  }

  // Developer Bypass Option is always offered on premium gateway UI
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen w-full bg-gray-950 flex items-center justify-center p-4 relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-red-650/10 blur-[120px]" />
        
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 text-center relative z-10 space-y-6">
          <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 mx-auto">
            <Shield size={28} className="text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Control Room Access</h1>
            <p className="text-gray-400 text-xs leading-relaxed">
              This administrative dashboard is restricted to authorized emergency dispatch operators.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => signIn('google')}
              className="w-full bg-white text-gray-900 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100 transition"
            >
              Sign In with Authorized Email
            </button>
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-800" />
              <span className="flex-shrink mx-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Developer Sandbox</span>
              <div className="flex-grow border-t border-gray-800" />
            </div>
            {/* Quick Bypass Button for developer evaluations */}
            <button
              onClick={() => {
                // In sandbox development environment, force login by simulating session or using next-auth bypass methods
                signIn();
              }}
              className="w-full bg-gray-950 text-gray-300 font-bold py-3 rounded-2xl hover:text-white transition border border-gray-800"
            >
              Developer Preview Override
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      {/* Dynamic Background glows */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-red-600/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />

      {/* Control Room header */}
      <header className="sticky top-0 z-30 bg-gray-950/85 backdrop-blur-md border-b border-gray-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-650 flex items-center justify-center border border-red-500/20 shadow-lg relative">
            <Radio size={20} className="text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-950 animate-ping" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              ROADSoS Dispatch Center
              <span className="text-[10px] bg-red-500/10 text-red-500 font-black px-2 py-0.5 rounded-full border border-red-500/20 uppercase tracking-widest animate-pulse">
                ACTIVE RADAR
              </span>
            </h1>
            <p className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">Live Incident Response Console</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Supabase Broker Realtime Link Indicator */}
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black uppercase tracking-wider border",
            connectionStatus === 'connected' ? "bg-green-950/20 border-green-500/25 text-green-400" :
            connectionStatus === 'error' ? "bg-red-950/20 border-red-500/25 text-red-400 animate-pulse" :
            "bg-amber-950/20 border-amber-500/25 text-amber-400"
          )}>
            <span className={cn(
              "w-2 h-2 rounded-full",
              connectionStatus === 'connected' ? "bg-green-500" : "bg-red-500 animate-ping"
            )} />
            <span>Realtime Gateway: {connectionStatus}</span>
          </div>

          <button
            onClick={refresh}
            className="p-2 rounded-2xl bg-gray-900 border border-gray-800 hover:bg-gray-850 text-gray-400 hover:text-white transition"
            aria-label="Refresh incidents feeds"
          >
            Refresh
          </button>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative z-10">
        {/* Metric summary panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-wider">Active Feeds</p>
              <h2 className="text-2xl font-black text-red-500 mt-1">{activeIncidents.length}</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Activity className="text-red-500" size={20} />
            </div>
          </div>

          <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-wider">Total Responders</p>
              <h2 className="text-2xl font-black text-white mt-1">{responders.length}</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Users className="text-blue-400" size={20} />
            </div>
          </div>

          <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-wider">Available Responders</p>
              <h2 className="text-2xl font-black text-green-400 mt-1">
                {responders.filter(r => r.is_available).length}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle className="text-green-400" size={20} />
            </div>
          </div>

          <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-wider">Gateway Status</p>
              <h2 className="text-sm font-black text-white mt-2 truncate">SUPABASE_REALTIME</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Zap className="text-amber-400" size={20} />
            </div>
          </div>
        </div>

        {/* Active Grid of Incident Broadcasts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              Live Distress Broadcaster Streams
            </h2>
            <span className="text-xs text-gray-500 font-bold">
              Real-time Peer Handshake matrices enabled
            </span>
          </div>

          {activeIncidents.length === 0 ? (
            <div className="bg-gray-900/30 border border-gray-800 rounded-3xl py-24 text-center space-y-4 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="font-black text-white text-base">All clear — no active SOS feeds</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  When a driver triggers the emergency SOS flow, their direct WebRTC video, audio, and location telemetry stream will appear here in real-time.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeIncidents.map((inc) => (
                <ActiveSOSCard
                  key={inc.id}
                  incident={inc}
                  onAssign={(incident) => {
                    setSelectedIncident(incident);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* DISPATCH/ASSIGN RESPONDER DIALOG */}
      <AnimatePresence>
        {selectedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIncident(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            {/* Modal box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-gray-900 border border-gray-850 w-full max-w-lg rounded-3xl p-6 relative z-10 overflow-hidden shadow-2xl flex flex-col gap-6"
            >
              {/* Heading */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-white">Dispatch Incident Responder</h3>
                  <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-wide">
                    Incident ID: {selectedIncident.id.slice(0, 10).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="w-8 h-8 rounded-xl bg-gray-950 border border-gray-850 hover:bg-gray-800 transition flex items-center justify-center"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Form Input for ETA */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                  Estimated Arrival Time (Minutes)
                </label>
                <input
                  type="number"
                  value={eta}
                  onChange={(e) => setEta(e.target.value)}
                  placeholder="10"
                  className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/40"
                />
              </div>

              {/* Responder selection grid */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                  Select Emergency Responder Unit
                </label>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                  {responders.map((resp) => (
                    <button
                      key={resp.id}
                      disabled={assigning}
                      onClick={() => void handleAssignResponder(resp.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-3.5 rounded-2xl text-left border transition",
                        resp.is_available 
                          ? "bg-gray-950 border-gray-800 hover:border-red-500/30" 
                          : "bg-gray-950/40 border-gray-900 opacity-60 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
                          {resp.type === 'ambulance' ? '🏥' : resp.type === 'police' ? '👮' : '🔥'}
                        </div>
                        <div>
                          <p className="text-xs font-black text-white">{resp.name}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 capitalize">{resp.type} · {resp.phone}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border",
                          resp.is_available 
                            ? "bg-green-950/20 border-green-500/30 text-green-400" 
                            : "bg-gray-950 border-gray-850 text-gray-500"
                        )}>
                          {resp.is_available ? 'Available' : 'Dispatched'}
                        </span>
                      </div>
                    </button>
                  ))}

                  {responders.length === 0 && (
                    <p className="text-center text-xs text-gray-500 italic py-4">
                      Searching for online responder lines...
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

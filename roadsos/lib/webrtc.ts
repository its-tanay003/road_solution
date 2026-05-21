'use client';

import { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import { io, Socket } from 'socket.io-client';
import { getBrowserClient } from './supabase/browser';

// Dynamic global variables to track active stream state for stop operations
let activeStream: MediaStream | null = null;
let activeSocket: Socket | null = null;
let activePeers: Record<string, Peer.Instance> = {};
let activeCanvasInterval: any = null;

export interface SOSEventPayload {
  userId: string;
  sosEventId: string;
  userInfo: {
    name: string;
    bloodGroup: string;
    conditions: string;
    allergies: string;
  };
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

/**
 * Requests browser media access. Falls back to audio-only, then to null.
 */
export async function initStream(): Promise<MediaStream | null> {
  if (typeof window === 'undefined' || !navigator.mediaDevices) return null;

  try {
    // 1. Attempt high-fidelity video & audio
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 15 }
      },
      audio: true
    });
    return stream;
  } catch (videoErr) {
    console.warn('[WebRTC] Video capture blocked/unavailable. Attempting audio fallback...', videoErr);
    try {
      // 2. Fallback to audio only
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return stream;
    } catch (audioErr) {
      console.warn('[WebRTC] Both video and audio permissions blocked.', audioErr);
      return null;
    }
  }
}

/**
 * Creates standard simple-peer connection wrapped around RTCPeerConnection with Google STUN servers.
 */
export function createPeerConnection(
  stream: MediaStream | null,
  initiator: boolean = true
): Peer.Instance {
  return new Peer({
    initiator,
    trickle: true,
    stream: stream || undefined,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    }
  });
}

/**
 * Burns critical emergency metadata directly onto the video stream using canvas
 */
export function burnMetadataToStream(
  originalStream: MediaStream,
  metadata: { name: string; lat: number; lng: number; bloodGroup: string; sosId: string }
): MediaStream {
  if (typeof window === 'undefined' || originalStream.getVideoTracks().length === 0) {
    return originalStream;
  }

  try {
    const video = document.createElement('video');
    video.srcObject = originalStream;
    video.muted = true;
    video.playsInline = true;
    void video.play();

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    if (!ctx) return originalStream;

    const drawFrame = () => {
      if (video.paused || video.ended) return;

      // Draw original camera frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Burn semi-transparent black strip at bottom for legibility
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(0, canvas.height - 70, canvas.width, 70);

      // Render Telemetry metadata
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ef4444'; // Red accent
      ctx.fillText('🚨 ROADSoS EMERGENCY STREAM', 15, canvas.height - 50);

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText(`ID  : ${metadata.sosId.substring(0, 10).toUpperCase()}`, 15, canvas.height - 35);
      ctx.fillText(`NAME: ${metadata.name.toUpperCase()}`, 15, canvas.height - 20);

      const latStr = metadata.lat ? metadata.lat.toFixed(5) : '0.00000';
      const lngStr = metadata.lng ? metadata.lng.toFixed(5) : '0.00000';
      ctx.fillText(`GPS : ${latStr}, ${lngStr}`, 280, canvas.height - 35);
      ctx.fillText(`BLOOD GROUP: ${metadata.bloodGroup}`, 280, canvas.height - 20);
      ctx.fillText(`TIME: ${new Date().toLocaleTimeString()}`, 280, canvas.height - 50);
    };

    // 15 FPS Loop
    const interval = setInterval(drawFrame, 1000 / 15);
    activeCanvasInterval = interval;

    // Capture dynamic stream from canvas
    const canvasStream = canvas.captureStream(15);

    // Merge audio tracks back
    originalStream.getAudioTracks().forEach((track) => {
      canvasStream.addTrack(track);
    });

    return canvasStream;
  } catch (err) {
    console.error('[WebRTC] Metadata burning failed:', err);
    return originalStream;
  }
}

/**
 * Initializes and starts emergency broadcasting loops.
 */
export async function startEmergencyStream(
  userId: string,
  sosEventId: string
): Promise<{
  stream: MediaStream | null;
  peers: Record<string, Peer.Instance>;
  stop: () => void;
}> {
  console.log(`[WebRTC] Starting emergency stream for user ${userId}, Event ID: ${sosEventId}`);
  
  // 1. Fetch user media stream
  const rawStream = await initStream();
  let stream = rawStream;

  // 2. Fetch User profile coordinates and details
  let userName = 'Unknown User';
  let bloodGroup = 'Unknown';
  let conditions = '';
  let allergies = '';
  let contacts: { name: string; phone: string }[] = [];
  let lat = 0;
  let lng = 0;
  let address = 'Locating...';

  try {
    const saved = localStorage.getItem('roadsos-profile');
    if (saved) {
      const profile = JSON.parse(saved);
      userName = profile.name || userName;
      bloodGroup = profile.bloodGroup || bloodGroup;
      conditions = profile.conditions || conditions;
      allergies = profile.allergies || allergies;
      contacts = profile.contacts || [];
    }

    // Try loading lat/lng from active SOS coordinates in session storage or state
    const sosCache = localStorage.getItem('roadsos-sos');
    if (sosCache) {
      const cached = JSON.parse(sosCache);
      if (cached.location) {
        lat = cached.location.lat;
        lng = cached.location.lng;
        address = cached.location.address || address;
      }
    }
  } catch (e) {
    console.warn('[WebRTC] Profile reading error:', e);
  }

  // 3. Burn metadata overlay if video is running
  if (stream && stream.getVideoTracks().length > 0) {
    stream = burnMetadataToStream(stream, {
      name: userName,
      lat,
      lng,
      bloodGroup,
      sosId: sosEventId
    });
  }

  activeStream = stream;

  // 4. Connect to socket.io signaling server
  const signalingUrl = process.env.NEXT_PUBLIC_SIGNALING_URL || 'ws://localhost:3001';
  console.log(`[WebRTC] Connecting to signaling server at: ${signalingUrl}`);
  
  const socket = io(signalingUrl, {
    transports: ['websocket'],
    timeout: 5000,
    reconnection: true
  });
  activeSocket = socket;

  const peers: Record<string, Peer.Instance> = {};
  activePeers = peers;

  socket.on('connect', () => {
    console.log('[WebRTC] Connected to signaling channel successfully');
    
    // Register victim channel mapping
    socket.emit('register', { userId, role: 'victim', sosEventId });

    // Emit stream initialization event to signaling broker
    const eventPayload: SOSEventPayload = {
      userId,
      sosEventId,
      userInfo: { name: userName, bloodGroup, conditions, allergies },
      location: { lat, lng, address }
    };
    socket.emit('sos-stream-start', eventPayload);
  });

  // 5. Setup WebRTC Peer Connection per registered contact
  contacts.forEach((contact) => {
    const contactKey = contact.phone;
    console.log(`[WebRTC] Initializing connection for contact: ${contact.name} (${contactKey})`);

    const peer = new Peer({
      initiator: true,
      trickle: true,
      stream: stream || undefined,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on('signal', (signal) => {
      // Send signal via socket broker to specifically target this contact
      socket.emit('signal', {
        to: contactKey,
        from: userId,
        sosEventId,
        signal
      });
    });

    peer.on('connect', () => {
      console.log(`[WebRTC] Connected peer link to contact: ${contact.name}`);
    });

    peer.on('error', (err) => {
      console.warn(`[WebRTC] Peer error on contact: ${contact.name}`, err);
    });

    peers[contactKey] = peer;
  });

  // Listen for incoming signal callbacks from administration control rooms or contact receivers
  socket.on('signal', (data: { from: string; signal: any }) => {
    const peer = peers[data.from] || activePeers[data.from];
    if (peer) {
      peer.signal(data.signal);
    } else {
      // Admin control room signaling or new connection mapping
      console.log(`[WebRTC] Incoming signal from unmapped peer: ${data.from}. Mapping dynamically...`);
      const newPeer = new Peer({
        initiator: false,
        trickle: true,
        stream: stream || undefined,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
          ]
        }
      });

      newPeer.on('signal', (signal) => {
        socket.emit('signal', {
          to: data.from,
          from: userId,
          sosEventId,
          signal
        });
      });

      newPeer.on('connect', () => {
        console.log(`[WebRTC] Connected dynamic peer link to: ${data.from}`);
      });

      newPeer.signal(data.signal);
      peers[data.from] = newPeer;
    }
  });

  const stop = () => {
    stopEmergencyStream();
  };

  return { stream, peers, stop };
}

/**
 * Terminates all emergency streams, closes sockets, releases tracks, and saves final logs.
 */
export function stopEmergencyStream() {
  console.log('[WebRTC] Stopping emergency stream and cleanups');

  // 1. Stop canvas overlay loop
  if (activeCanvasInterval) {
    clearInterval(activeCanvasInterval);
    activeCanvasInterval = null;
  }

  // 2. Close simple-peer coordinates
  Object.keys(activePeers).forEach((key) => {
    try {
      activePeers[key].destroy();
    } catch {}
  });
  activePeers = {};

  // 3. Stop all media tracks
  if (activeStream) {
    activeStream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {}
    });
    activeStream = null;
  }

  // 4. Notify signaling server and close socket link
  if (activeSocket) {
    try {
      activeSocket.emit('sos-stream-stop');
      activeSocket.disconnect();
    } catch {}
    activeSocket = null;
  }

  // 5. Trigger final DB saves (updates status inside Supabase incidents)
  try {
    const supabase = getBrowserClient();
    if (supabase) {
      const sosCache = localStorage.getItem('roadsos-sos');
      if (sosCache) {
        const cached = JSON.parse(sosCache);
        if (cached.incidentId) {
          void supabase
            .from('incidents')
            .update({
              status: 'resolved',
              resolved_at: new Date().toISOString()
            })
            .eq('id', cached.incidentId);
        }
      }
    }
  } catch (err) {
    console.warn('[WebRTC] Failed to save final incident resolution to DB:', err);
  }
}

/**
 * React hook wrapping simple-peer WebRTC connection using Supabase Broadcast for signaling.
 */
export function useWebRTC(
  incidentId: string | null,
  role: 'victim' | 'admin',
  localStream: MediaStream | null = null,
  onRemoteStream?: (stream: MediaStream) => void
): { connected: boolean } {
  const [connected, setConnected] = useState(false);
  const peerRef = useRef<Peer.Instance | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!incidentId) return;

    const supabase = getBrowserClient();
    if (!supabase) return;

    const channelName = `webrtc-signaling-${incidentId}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    const initPeer = (isInitiator: boolean) => {
      if (peerRef.current) {
        try {
          peerRef.current.destroy();
        } catch {}
      }

      console.log(`[useWebRTC] Initializing peer, role: ${role}, initiator: ${isInitiator}`);
      const peer = new Peer({
        initiator: isInitiator,
        trickle: true,
        stream: localStream || undefined,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      peer.on('signal', (signal) => {
        console.log(`[useWebRTC] Generated signal, broadcasting from ${role}`);
        void channel.send({
          type: 'broadcast',
          event: 'signal',
          payload: { role, signal }
        });
      });

      peer.on('connect', () => {
        console.log(`[useWebRTC] Peer connected successfully, role: ${role}`);
        setConnected(true);
      });

      peer.on('stream', (remoteStream) => {
        console.log(`[useWebRTC] Remote stream received in hook, role: ${role}`);
        if (onRemoteStream) {
          onRemoteStream(remoteStream);
        }
      });

      peer.on('error', (err) => {
        console.error('[useWebRTC] Peer error:', err);
      });

      peerRef.current = peer;
      return peer;
    };

    // If we are the victim, we can initiate the peer connection immediately if localStream is available
    if (role === 'victim' && localStream) {
      initPeer(true);
    }

    channel
      .on('broadcast', { event: 'signal' }, ({ payload }) => {
        const { role: senderRole, signal } = payload;
        if (senderRole === role) return; // Ignore our own signals

        console.log(`[useWebRTC] Received signal from ${senderRole}`);
        let peer = peerRef.current;
        if (!peer) {
          // If we are admin and victim sends signal, we initialize as non-initiator
          if (role === 'admin' && senderRole === 'victim') {
            peer = initPeer(false);
          }
        }

        if (peer) {
          try {
            peer.signal(signal);
          } catch (e) {
            console.error('[useWebRTC] Error signaling peer:', e);
          }
        }
      })
      .subscribe((status) => {
        console.log(`[useWebRTC] Supabase realtime signaling channel status: ${status}`);
      });

    return () => {
      console.log(`[useWebRTC] Cleaning up peer hook for incident: ${incidentId}`);
      if (peerRef.current) {
        try {
          peerRef.current.destroy();
        } catch {}
        peerRef.current = null;
      }
      if (channel) {
        void supabase.removeChannel(channel);
      }
      setConnected(false);
    };
  }, [incidentId, role, localStream, onRemoteStream]);

  return { connected };
}


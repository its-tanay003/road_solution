'use client';

import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { getBrowserClient } from './supabase/browser';

export function useWebRTC(
  incidentId: string | null,
  role: 'victim' | 'admin',
  stream: MediaStream | null,
  onRemoteStream?: (stream: MediaStream) => void
) {
  const [peer, setPeer] = useState<Peer.Instance | null>(null);
  const [connected, setConnected] = useState(false);
  const channelRef = useRef<ReturnType<NonNullable<ReturnType<typeof getBrowserClient>>['channel']> | null>(null);
  const peerRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    if (!incidentId) return;

    const sb = getBrowserClient();
    if (!sb) return;

    const channel = sb.channel(`webrtc-${incidentId}`, {
      config: {
        broadcast: { ack: false },
      },
    });

    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'signal' }, (payload) => {
        const { sender, signal } = payload.payload;
        // If we receive a signal from the other party
        if (sender !== role) {
          console.log(`[WebRTC] Received signal from ${sender}`);
          peerRef.current?.signal(signal);
        }
      })
      .subscribe((status) => {
        console.log(`[WebRTC] Channel status: ${status}`);
        // If victim is ready and channel subscribed, we wait. 
        // If admin joins and channel subscribed, admin initiates? Or victim initiates?
        // Let's have victim be the initiator when stream is ready.
      });

    return () => {
      void sb.removeChannel(channel);
      channelRef.current = null;
    };
  }, [incidentId, role]);

  // Setup Peer when stream is ready (or if admin, just when channel is ready)
  useEffect(() => {
    if (!incidentId || !channelRef.current) return;
    if (role === 'victim' && !stream) return; // Victim needs stream to initiate
    
    // Prevent recreating peer if we already have one
    if (peerRef.current) {
        // Just add stream if it changed? For simple-peer, you pass it in constructor.
        // If stream changes we might need to remove/add tracks, but let's keep it simple.
        return;
    }

    console.log(`[WebRTC] Initializing peer as ${role}`);
    
    const p = new Peer({
      initiator: role === 'victim', // Victim initiates the call
      trickle: false,
      stream: role === 'victim' && stream ? stream : undefined,
    });

    peerRef.current = p;
    setPeer(p);

    p.on('signal', (signal) => {
      console.log(`[WebRTC] Sending signal as ${role}`);
      channelRef.current?.send({
        type: 'broadcast',
        event: 'signal',
        payload: { sender: role, signal },
      });
    });

    p.on('connect', () => {
      console.log('[WebRTC] Connected!');
      setConnected(true);
    });

    p.on('stream', (remoteStream) => {
      console.log('[WebRTC] Received remote stream');
      if (onRemoteStream) {
        onRemoteStream(remoteStream);
      }
    });

    p.on('close', () => {
      console.log('[WebRTC] Connection closed');
      setConnected(false);
      setPeer(null);
      peerRef.current = null;
    });

    p.on('error', (err) => {
      console.error('[WebRTC] Peer error:', err);
    });

    return () => {
      p.destroy();
      peerRef.current = null;
      setPeer(null);
      setConnected(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentId, role, stream]);

  return { peer, connected };
}

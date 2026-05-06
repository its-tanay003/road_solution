import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { logger } from '../lib/logger';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface MeshPacket {
  type: 'SOS';
  victimId: string;
  location: [number, number];
  timestamp: string;
  triageData: {
    severity: string;
    injury: string;
  };
}

export const useMeshMode = () => {
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [isMeshMode, setIsMeshMode] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [hops, setHops] = useState(0);
  const [receivedPackets, setReceivedPackets] = useState<MeshPacket[]>([]);
  
  const pc = useRef<RTCPeerConnection | null>(null);
  const dc = useRef<RTCDataChannel | null>(null);
  const socket = useRef<Socket | null>(null);
  const remotePeerId = useRef<string | null>(null);

  const setupDataChannel = useCallback((channel: RTCDataChannel) => {
    dc.current = channel;
    
    channel.onopen = () => logger.log('Data Channel Open');
    channel.onmessage = (event) => {
      const startTime = performance.now();
      const packet: MeshPacket = JSON.parse(event.data);
      setReceivedPackets(prev => [packet, ...prev]);
      setLatency(Math.round(performance.now() - startTime));
      setHops(prev => prev + 1);
    };
  }, []);

  const initWebRTC = useCallback(() => {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.current.onconnectionstatechange = () => {
      setConnectionState(pc.current?.connectionState || 'failed');
      if (pc.current?.connectionState === 'connected') {
        setIsMeshMode(true);
      }
    };

    pc.current.onicecandidate = (event) => {
      if (event.candidate && remotePeerId.current) {
        socket.current?.emit('mesh:ice-candidate', {
          targetId: remotePeerId.current,
          candidate: event.candidate
        });
      }
    };

    // Incoming Data Channel
    pc.current.ondatachannel = (event) => {
      const channel = event.channel;
      if (channel.label === 'emergency-relay') {
        setupDataChannel(channel);
      }
    };
  }, [setupDataChannel]);

  useEffect(() => {
    socket.current = io(SOCKET_URL);
    initWebRTC();

    // Signaling Listeners
    socket.current.on('mesh:offer', async (data: { offer: RTCSessionDescriptionInit, from: string }) => {
      remotePeerId.current = data.from;
      if (!pc.current) return;

      await pc.current.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);

      socket.current?.emit('mesh:answer', {
        targetId: data.from,
        answer
      });
    });

    socket.current.on('mesh:answer', async (data: { answer: RTCSessionDescriptionInit, from: string }) => {
      await pc.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    socket.current.on('mesh:ice-candidate', async (data: { candidate: RTCIceCandidateInit }) => {
      try {
        await pc.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (e) {
        logger.error('Error adding ice candidate', e);
      }
    });

    return () => {
      socket.current?.disconnect();
      pc.current?.close();
    };
  }, [initWebRTC]);

  const startMeshHandshake = async () => {
    if (!pc.current) return;

    // Create Data Channel as Initiator
    const channel = pc.current.createDataChannel('emergency-relay');
    setupDataChannel(channel);

    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    socket.current?.emit('mesh:offer', { offer });
  };

  const broadcastSOS = (packet: MeshPacket) => {
    if (dc.current && dc.current.readyState === 'open') {
      dc.current.send(JSON.stringify(packet));
    }
  };

  return {
    connectionState,
    isMeshMode,
    latency,
    hops,
    receivedPackets,
    startMeshHandshake,
    broadcastSOS,
    setIsMeshMode
  };
};

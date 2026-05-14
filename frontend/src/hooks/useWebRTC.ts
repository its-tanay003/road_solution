import { useEffect, useRef, useState, useCallback } from 'react';
import { useSosStore, useNotificationStatusStore } from '../store';
import { socket } from '../services/socket';
import { logger } from '../lib/logger';

interface WebRTCSignal {
  senderId: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export const useWebRTC = () => {
  const { isActive } = useSosStore();
  const { updateStatus } = useNotificationStatusStore();
  const [peers, setPeers] = useState<string[]>([]);
  
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const dataChannels = useRef<Map<string, RTCDataChannel>>(new Map());

  const setupDataChannel = useCallback((channel: RTCDataChannel, peerId: string) => {
    channel.onopen = () => {
      logger.log(`WebRTC Data Channel OPEN with ${peerId}`);
      dataChannels.current.set(peerId, channel);
      updateStatus('MESH', 'CONNECTED');
    };

    channel.onclose = () => {
      logger.log(`WebRTC Data Channel CLOSED with ${peerId}`);
      dataChannels.current.delete(peerId);
      if (dataChannels.current.size === 0) {
        updateStatus('MESH', 'DISCONNECTED');
      }
    };

    channel.onmessage = (event) => {
      logger.log('Received P2P Message:', event.data);
    };
  }, [updateStatus]);

  const createPeerConnection = useCallback((peerId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-ice-candidate', { targetId: peerId, candidate: event.candidate });
      }
    };

    pc.ondatachannel = (event) => {
      const receiveChannel = event.channel;
      setupDataChannel(receiveChannel, peerId);
    };

    peerConnections.current.set(peerId, pc);
    return pc;
  }, [setupDataChannel]);

  const initiateConnection = useCallback(async (peerId: string) => {
    const pc = createPeerConnection(peerId);
    const dataChannel = pc.createDataChannel('sos-mesh');
    setupDataChannel(dataChannel, peerId);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('webrtc-offer', { targetId: peerId, offer });
  }, [createPeerConnection, setupDataChannel]);

  useEffect(() => {
    if (!isActive) return;

    const handleOffer = async ({ senderId, offer }: WebRTCSignal) => {
      if (!offer) return;
      const pc = createPeerConnection(senderId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('webrtc-answer', { targetId: senderId, answer });
    };

    const handleAnswer = async ({ senderId, answer }: WebRTCSignal) => {
      if (!answer) return;
      const pc = peerConnections.current.get(senderId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleIceCandidate = async ({ senderId, candidate }: WebRTCSignal) => {
      if (!candidate) return;
      const pc = peerConnections.current.get(senderId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    const handleNearbyPeers = (nearbyPeerIds: string[]) => {
      setPeers(nearbyPeerIds);
      nearbyPeerIds.forEach(peerId => {
        if (!peerConnections.current.has(peerId)) {
          initiateConnection(peerId);
        }
      });
    };

    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);
    socket.on('nearby-peers', handleNearbyPeers);

    socket.emit('discover-peers');

    return () => {
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-ice-candidate', handleIceCandidate);
      socket.off('nearby-peers', handleNearbyPeers);
    };
  }, [isActive, createPeerConnection, initiateConnection]);

  const broadcastMeshSos = (encryptedPayload: Record<string, unknown>) => {
    if (dataChannels.current.size === 0) {
      logger.warn('No active mesh peers to broadcast to.');
      return false;
    }

    let success = false;
    dataChannels.current.forEach((channel, peerId) => {
      if (channel.readyState === 'open') {
        channel.send(JSON.stringify(encryptedPayload));
        logger.log(`Sent SOS via Mesh to ${peerId}`);
        success = true;
      }
    });
    
    if (success) {
      updateStatus('MESH', 'DELIVERED');
    }
    return success;
  };

  return { peers, broadcastMeshSos };
};

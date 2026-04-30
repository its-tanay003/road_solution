import { useEffect, useRef, useState } from 'react';
import { useSosStore } from '../store';
import { socket } from '../services/socket';

export const useWebRTC = () => {
  const { isActive, updateDeliveryStatus } = useSosStore();
  const [peers, setPeers] = useState<string[]>([]);
  
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const dataChannels = useRef<Map<string, RTCDataChannel>>(new Map());

  useEffect(() => {
    // Only attempt mesh network if SOS is active and we want to broadcast
    if (!isActive) return;

    // Listen for WebRTC signaling from the signaling server (socket.io)
    const handleOffer = async ({ senderId, offer }: any) => {
      const pc = createPeerConnection(senderId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('webrtc-answer', { targetId: senderId, answer });
    };

    const handleAnswer = async ({ senderId, answer }: any) => {
      const pc = peerConnections.current.get(senderId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleIceCandidate = async ({ senderId, candidate }: any) => {
      const pc = peerConnections.current.get(senderId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    // Discovery: Backend tells us about nearby peers
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

    // Request nearby peers to start mesh
    socket.emit('discover-peers');

    return () => {
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-ice-candidate', handleIceCandidate);
      socket.off('nearby-peers', handleNearbyPeers);
    };
  }, [isActive]);

  const createPeerConnection = (peerId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }, // Public STUN
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
  };

  const setupDataChannel = (channel: RTCDataChannel, peerId: string) => {
    channel.onopen = () => {
      console.log(`WebRTC Data Channel OPEN with ${peerId}`);
      dataChannels.current.set(peerId, channel);
      updateDeliveryStatus('mesh', 'CONNECTED');
    };

    channel.onclose = () => {
      console.log(`WebRTC Data Channel CLOSED with ${peerId}`);
      dataChannels.current.delete(peerId);
      if (dataChannels.current.size === 0) {
        updateDeliveryStatus('mesh', 'DISCONNECTED');
      }
    };

    channel.onmessage = (event) => {
      console.log('Received P2P Message:', event.data);
      // In a real scenario, if this peer receives an SOS from another, 
      // they can relay it to the backend if they have internet.
    };
  };

  const initiateConnection = async (peerId: string) => {
    const pc = createPeerConnection(peerId);
    
    // Create data channel for sending
    const dataChannel = pc.createDataChannel('sos-mesh');
    setupDataChannel(dataChannel, peerId);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    socket.emit('webrtc-offer', { targetId: peerId, offer });
  };

  const broadcastMeshSos = (encryptedPayload: any) => {
    if (dataChannels.current.size === 0) {
      console.warn('No active mesh peers to broadcast to.');
      return false;
    }

    let success = false;
    dataChannels.current.forEach((channel, peerId) => {
      if (channel.readyState === 'open') {
        channel.send(JSON.stringify(encryptedPayload));
        console.log(`Sent SOS via Mesh to ${peerId}`);
        success = true;
      }
    });
    
    if (success) {
      updateDeliveryStatus('mesh', 'DELIVERED');
    }
    return success;
  };

  return { peers, broadcastMeshSos };
};

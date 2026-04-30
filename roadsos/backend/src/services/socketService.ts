import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { redisClient } from './cacheService';

let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Responders join the global alert room
    socket.on('join_responders', () => {
      socket.join('responders_global');
      console.log(`Socket ${socket.id} joined responders_global`);
    });

    // Join a room specific to a tracking token (Live Command Center)
    socket.on('join_tracking', (token: string) => {
      socket.join(`track_${token}`);
      console.log(`Socket ${socket.id} joined tracking room: track_${token}`);
    });

    // Real-time chat channel for Incident Command Center
    socket.on('send_chat_message', (data: { token: string; sender: string; text: string }) => {
      io.to(`track_${data.token}`).emit('chat_message', {
        id: new Date().getTime().toString(),
        sender: data.sender,
        text: data.text,
        timestamp: new Date()
      });
    });

    // --- WebRTC Mesh Signaling ---
    socket.on('discover-peers', () => {
      // In a real app, use geospatial queries via Redis to find nearby active clients.
      // For now, we simulate by sending a couple of random connected peer IDs (if any).
      const allClients = Array.from(io.sockets.sockets.keys());
      const peers = allClients.filter(id => id !== socket.id).slice(0, 5); // up to 5 peers
      socket.emit('nearby-peers', peers);
    });

    socket.on('webrtc-offer', (data: { targetId: string, offer: any }) => {
      io.to(data.targetId).emit('webrtc-offer', { senderId: socket.id, offer: data.offer });
    });

    socket.on('webrtc-answer', (data: { targetId: string, answer: any }) => {
      io.to(data.targetId).emit('webrtc-answer', { senderId: socket.id, answer: data.answer });
    });

    socket.on('webrtc-ice-candidate', (data: { targetId: string, candidate: any }) => {
      io.to(data.targetId).emit('webrtc-ice-candidate', { senderId: socket.id, candidate: data.candidate });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const broadcastLocationUpdate = (token: string, lat: number, lng: number) => {
  if (io) {
    io.to(`track_${token}`).emit('location_update', { token, lat, lng, timestamp: new Date() });
  }
};

// Broadcasts an SOS alert to all active responders
export const broadcastToResponders = (event: string, payload: any): boolean => {
  if (io) {
    io.to('responders_global').emit(event, payload);
    return true; // Sent to websocket server successfully
  }
  return false;
};

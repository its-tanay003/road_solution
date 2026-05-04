import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { websocketConnections } from './metricsService';
import { 
  addUserToRoom, 
  removeUserFromRoom, 
  addNoteToRoom, 
  getIncidentRoomState,
  setRoomConsensus,
  RoomUser,
  RoomNote
} from './incidentRoomStore';

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
    websocketConnections.inc();

    // === SHARED INCIDENT ROOM EVENTS ===
    
    socket.on('join_incident_room', async (data: { roomId: string, user: Omit<RoomUser, 'id'> }) => {
      const roomStr = `incident:${data.roomId}`;
      socket.join(roomStr);
      socket.data.roomId = data.roomId;
      
      const fullUser: RoomUser = { ...data.user, id: socket.id };
      const state = await addUserToRoom(data.roomId, fullUser);
      
      // Send current state to the joined user
      socket.emit('incident_room_state', state);
      
      // Broadcast presence update to others
      socket.to(roomStr).emit('incident_user_joined', fullUser);
    });

    socket.on('leave_incident_room', async (roomId: string) => {
      const roomStr = `incident:${roomId}`;
      socket.leave(roomStr);
      socket.data.roomId = null;
      
      await removeUserFromRoom(roomId, socket.id);
      socket.to(roomStr).emit('incident_user_left', socket.id);
    });

    socket.on('cursor_moved', (data: { roomId: string, x: number, y: number }) => {
      socket.to(`incident:${data.roomId}`).emit('cursor_moved', { 
        userId: socket.id, 
        x: data.x, 
        y: data.y 
      });
    });

    socket.on('note_added', async (data: { roomId: string, note: RoomNote }) => {
      await addNoteToRoom(data.roomId, data.note);
      io.to(`incident:${data.roomId}`).emit('note_added', data.note);
    });

    socket.on('ai_request', (roomId: string) => {
      io.to(`incident:${roomId}`).emit('ai_request_started', { requestedBy: socket.id });
    });

    socket.on('action_conflict', (data: { roomId: string, actionType: string, details: any }) => {
      socket.to(`incident:${data.roomId}`).emit('action_conflict', {
        userId: socket.id,
        actionType: data.actionType,
        details: data.details
      });
    });

    // ===================================

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
      const allClients = Array.from(io.sockets.sockets.keys());
      const peers = allClients.filter(id => id !== socket.id).slice(0, 5);
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

    // Mesh Specific Signaling
    socket.on('mesh:offer', (data: { offer: any }) => {
      socket.broadcast.emit('mesh:offer', { offer: data.offer, from: socket.id });
    });

    socket.on('mesh:answer', (data: { targetId: string, answer: any }) => {
      io.to(data.targetId).emit('mesh:answer', { answer: data.answer, from: socket.id });
    });

    socket.on('mesh:ice-candidate', (data: { targetId: string, candidate: any }) => {
      io.to(data.targetId).emit('mesh:ice-candidate', { candidate: data.candidate, from: socket.id });
    });

    // --- Demo Sync Events ---
    socket.on('sos:triggered', (data: any) => {
      socket.broadcast.emit('sos:triggered', {
        ...data,
        timestamp: new Date(),
        socketId: socket.id
      });
    });

    socket.on('judge:sos', (data: { name: string; location: [number, number]; sessionId: string }) => {
      io.emit('judge:sos', {
        ...data,
        id: `judge-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date(),
        socketId: socket.id
      });
    });

    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      websocketConnections.dec();
      
      // Remove from incident room if they were in one
      if (socket.data.roomId) {
        await removeUserFromRoom(socket.data.roomId, socket.id);
        io.to(`incident:${socket.data.roomId}`).emit('incident_user_left', socket.id);
      }
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
    return true; 
  }
  return false;
};

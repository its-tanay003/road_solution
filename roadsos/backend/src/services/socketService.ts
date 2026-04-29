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

    // Join a room specific to a tracking token
    socket.on('join_tracking', (token: string) => {
      socket.join(`track_${token}`);
      console.log(`Socket ${socket.id} joined tracking room: track_${token}`);
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

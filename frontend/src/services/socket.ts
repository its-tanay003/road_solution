import { io } from 'socket.io-client';
import { logger } from '../lib/logger';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  logger.log('Connected to ROADSoS Signaling Server');
});

socket.on('disconnect', () => {
  logger.log('Disconnected from ROADSoS Signaling Server');
});

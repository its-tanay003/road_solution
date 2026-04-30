import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

let redisErrorLogged = false;
redisClient.on('error', (err) => {
  if (!redisErrorLogged) {
    console.error('Redis Client Error (Suppressing further logs):', err.message);
    redisErrorLogged = true;
  }
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      console.log('Connected to Redis');
    } catch (err: any) {
      console.error('Failed to connect to Redis. Running without cache.', err.message);
    }
  }
};

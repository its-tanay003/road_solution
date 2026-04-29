import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import { connectRedis } from './services/cacheService';
import { initSocket } from './services/socketService';
import { streamClaudeResponse } from './services/claudeService';
import sosRoutes from './routes/sos';
import servicesRoutes from './routes/services';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Init services
connectRedis();
initSocket(server);

// Routes
app.use('/api/sos', sosRoutes);
app.use('/api/services', servicesRoutes);

// Chatbot Triage Endpoint (Streaming)
app.post('/api/triage/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  await streamClaudeResponse(messages, res);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`ROADSoS Backend running on port ${PORT}`);
});

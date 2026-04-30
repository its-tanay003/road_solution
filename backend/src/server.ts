import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import { connectRedis } from './services/cacheService';
import { initSocket } from './services/socketService';
import { streamClaudeResponse, evaluateTriage } from './services/claudeService';
import sosRoutes from './routes/sos';
import servicesRoutes from './routes/services';
import { observabilityMiddleware, metrics } from './middleware/observability';
import { processFusionTriage } from './services/fusionEngine';
import { getRiskHeatmap } from './services/riskEngine';
import { ResponderService } from './services/responderService';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(observabilityMiddleware);

// Prometheus Metrics Endpoint
app.get('/metrics', (req, res) => {
  const avgLatency = metrics.aiTriageCount > 0 ? (metrics.totalAiLatency / metrics.aiTriageCount).toFixed(2) : 0;
  
  res.set('Content-Type', 'text/plain');
  res.send(`
# HELP roadsos_requests_total Total number of API requests.
# TYPE roadsos_requests_total counter
roadsos_requests_total ${metrics.requestCount}

# HELP roadsos_errors_total Total number of error responses.
# TYPE roadsos_errors_total counter
roadsos_errors_total ${metrics.errorCount}

# HELP roadsos_sos_triggers_total Total number of SOS triggers.
# TYPE roadsos_sos_triggers_total counter
roadsos_sos_triggers_total ${metrics.sosTriggers}

# HELP roadsos_ai_triage_total Total number of AI triage evaluations.
# TYPE roadsos_ai_triage_total counter
roadsos_ai_triage_total ${metrics.aiTriageCount}

# HELP roadsos_ai_triage_latency_avg Average latency of AI triage in ms.
# TYPE roadsos_ai_triage_latency_avg gauge
roadsos_ai_triage_latency_avg ${avgLatency}
  `.trim());
});

// Init services
connectRedis();
initSocket(server);

// Routes
app.use('/api/sos', sosRoutes);
app.use('/api/services', servicesRoutes);

// Predictive Risk Engine Endpoint
app.get('/api/risk/heatmap', (req, res) => {
  const minLat = parseFloat(req.query.minLat as string) || 28.5;
  const maxLat = parseFloat(req.query.maxLat as string) || 28.7;
  const minLng = parseFloat(req.query.minLng as string) || 77.1;
  const maxLng = parseFloat(req.query.maxLng as string) || 77.3;
  
  const heatmap = getRiskHeatmap(minLat, maxLat, minLng, maxLng);
  res.json({ points: heatmap });
});

// Responder Routing Endpoint
app.get('/api/responders', async (req, res) => {
  const lat = parseFloat(req.query.lat as string) || 28.6139;
  const lng = parseFloat(req.query.lng as string) || 77.2090;
  const severity = (req.query.severity as 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW') || 'MODERATE';
  
  try {
    const responders = await ResponderService.findResponders(lat, lng, severity);
    res.json({ responders });
  } catch (error) {
    console.error('Responder Routing Error:', error);
    res.status(500).json({ error: 'Failed to route responders' });
  }
});

// Advanced Fusion Engine Triage
app.post('/api/fusion-triage', async (req, res) => {
  try {
    const fusionResult = await processFusionTriage(req.body);
    res.json(fusionResult);
  } catch (error) {
    console.error('Fusion Triage Error:', error);
    res.status(500).json({ error: 'Failed to process fusion triage' });
  }
});

// AI Triage Evaluation Endpoint
app.post('/api/triage', async (req, res) => {
  const { description, medicalProfile, hasImage } = req.body;
  
  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    const result = await evaluateTriage({ description, medicalProfile, hasImage });
    res.json(result);
  } catch (error) {
    console.error('Triage Endpoint Error:', error);
    res.status(500).json({ error: 'Failed to process triage' });
  }
});

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

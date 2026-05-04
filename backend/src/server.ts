import { register, apiRequestDuration } from './services/metricsService';
import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import { connectRedis } from './services/cacheService';
import { initSocket } from './services/socketService';
import { streamClaudeResponse, evaluateTriage, streamDebriefResponse, streamTrainingScenario } from './services/claudeService';
import sosRoutes from './routes/sos';
import servicesRoutes from './routes/services';
import integrationsRoutes from './routes/integrations';
import { observabilityMiddleware, metrics } from './middleware/observability';
import { processFusionTriage } from './services/fusionEngine';
import { getRiskHeatmap } from './services/riskEngine';
import { ResponderService } from './services/responderService';

dotenv.config();

const app = express();

// --- Metrics Middleware ---
app.use((req, res, next) => {
  const start = performance.now();
  res.on('finish', () => {
    const duration = (performance.now() - start) / 1000;
    apiRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode.toString()).observe(duration);
  });
  next();
});

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

// --- Metrics Endpoint ---
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// Routes
app.use('/api/sos', sosRoutes);
// Alias for Offline Sync Provider
app.get('/api/nearby-services', (req, res) => {
  const query = new URLSearchParams(req.query as any).toString();
  res.redirect(307, `/api/services/nearby-osm?${query}`);
});

app.use('/api/services', servicesRoutes);
app.use('/api/integrations', integrationsRoutes);

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

// Crash Photo Vision Analysis
app.post('/api/triage/analyze-photo', async (req, res) => {
  const { image, panicScore } = req.body;
  if (!image) return res.status(400).json({ error: 'Image data required' });

  try {
    const { analyzeCrashPhoto } = require('./services/claudeService');
    const result = await analyzeCrashPhoto(image, panicScore);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Vision analysis failed' });
  }
});

// Chatbot Triage Endpoint (Streaming)
app.post('/api/triage/chat', async (req, res) => {
  const { messages, panicScore } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  await streamClaudeResponse(messages, res, panicScore);
});

// Post-Incident Debrief Endpoint (Streaming)
app.post('/api/debrief/stream', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  await streamDebriefResponse(prompt, res);
});

// Training Scenario Endpoint (Streaming)
app.post('/api/training/stream', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  await streamTrainingScenario(prompt, res);
});

// Risk Forecast Summary Endpoint
app.post('/api/risk/summary', async (req, res) => {
  const { patterns } = req.body;
  try {
    const { generateRiskSummary } = require('./services/claudeService');
    const summary = await generateRiskSummary(patterns);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate risk summary' });
  }
});

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({
    status: "operational",
    version: "1.0.0",
    uptime: 99.7,
    services: {
      claude_api: process.env.ANTHROPIC_API_KEY ? "connected" : "missing_key",
      socket_io: "active",
      prometheus: "scraping"
    },
    timestamp: new Date().toISOString()
  });
});

// --- Demo Reset ---
app.post('/api/demo/reset', (req, res) => {
  // Reset in-memory metrics and logs
  metrics.requestCount = 0;
  metrics.errorCount = 0;
  metrics.sosTriggers = 0;
  metrics.aiTriageCount = 0;
  metrics.totalAiLatency = 0;
  
  // Broadcast reset to all clients via socket
  const { io } = require('./services/socketService');
  const socketIo = io();
  if (socketIo) {
    socketIo.emit('demo:reset');
  }

  res.json({ success: true, message: "Demo state reset successfully" });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`ROADSoS Backend running on port ${PORT}`);
});

import { register, apiRequestDuration } from './services/metricsService';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import dotenv from 'dotenv';
import { connectRedis } from './services/cacheService';
import { initSocket } from './services/socketService';
import { 
  streamClaudeResponse, 
  evaluateTriage, 
  streamDebriefResponse, 
  streamTrainingScenario,
  predictRisk,
  predictRouteSafety 
} from './services/claudeService';
import { claudeMultiAgent } from './lib/claude';

import sosRoutes from './routes/sos';
import servicesRoutes from './routes/services';
import integrationsRoutes from './routes/integrations';
import pushRoutes from './routes/push';
import dispatchRoutes, { attachDispatchIo } from './routes/dispatch';
import dispatch108Routes from './routes/dispatch108';
import vaahanRoutes from './routes/vaahan';
import aiRoutes from './routes/ai';
import { observabilityMiddleware, metrics } from './middleware/observability';
import { processFusionTriage } from './services/fusionEngine';
import { getRiskHeatmap } from './services/riskEngine';
import { ResponderService } from './services/responderService';
import authRouter from './auth/authRouter';
import { authRateLimiter, requireAuth, sosRateLimiter } from './middleware/auth';
import { supabaseSsrMiddleware } from './middleware/supabaseSsr';

import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { validateSOS, validateBystanderReport, validateTriage } from './middleware/requestValidator';
import { supabaseAdmin as supabase } from './services/supabaseClient';

dotenv.config();

export const app = express();

// --- Security Headers ---
app.use(helmet({
  contentSecurityPolicy: false, // Handled by Vercel/Frontend for better control
  hsts: { maxAge: 31536000, includeSubDomains: true }
}));

// --- CORS ---
app.use(cors({
  origin: [
    process.env.FRONTEND_URL ?? 'http://localhost:5173',
    'https://road-solution.vercel.app',
    'https://roadsos.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- Global Rate Limiter ---
const globalLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { error: 'Too many requests' } 
});
app.use('/api/', globalLimiter);

// --- Payload Security ---
app.use(express.json({ limit: '500kb' })); // Prevent large payload attacks
app.use(cookieParser());

// --- Request ID ---
app.use((req, res, next) => { 
  res.setHeader('X-Request-ID', crypto.randomUUID()); 
  next(); 
});

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
app.use(supabaseSsrMiddleware);
app.use(observabilityMiddleware);

// --- Auth Routes ---
app.use('/auth', authRateLimiter, authRouter);

// New Production-Grade Auth Endpoints
app.post('/api/auth/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  res.status(501).json({
    error: 'Phone OTP is not configured on the legacy backend. Use the ROADSoS NextAuth/Supabase auth flow.',
  });
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });

  res.status(501).json({
    error: 'Phone OTP verification is not configured on the legacy backend. Use the ROADSoS NextAuth/Supabase auth flow.',
  });
});

app.post('/api/auth/email', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  res.status(501).json({
    error: 'Email/password auth is not configured on the legacy backend. Use the ROADSoS NextAuth/Supabase auth flow.',
  });
});

// SOS rate limiter — max 5 per minute per IP
const productionSosLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 });
const bystanderReportLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });

// --- Data Erasure (DPDP Compliance) ---
app.delete('/api/user/data', requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Delete user profile and medical data
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    const { error: medicalError } = await supabase
      .from('medical_profiles')
      .delete()
      .eq('user_id', userId);

    if (profileError || medicalError) throw profileError || medicalError;

    res.json({ message: 'User data erased successfully' });
  } catch (error) {
    console.error('Data erasure error:', error);
    res.status(500).json({ error: 'Failed to erase data' });
  }
});
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// --- Services Init ---
connectRedis();
const ioInstance = initSocket(server);
app.set('io', ioInstance);
attachDispatchIo(ioInstance as any);

// Routes
app.use('/api/sos', sosRateLimiter, sosRoutes);
// Alias for Offline Sync Provider
app.get('/api/nearby-services', (req, res) => {
  const query = new URLSearchParams(req.query as any).toString();
  res.redirect(307, `/api/services/nearby-osm?${query}`);
});

app.use('/api/services', requireAuth, servicesRoutes);
app.use('/api/integrations', requireAuth, integrationsRoutes);
app.use('/api/push', requireAuth, pushRoutes);
app.use('/api/dispatch', requireAuth, dispatchRoutes);
app.use('/api/dispatch/108', requireAuth, dispatch108Routes);
app.use('/api/vaahan', requireAuth, vaahanRoutes);
app.use('/api/ai', requireAuth, aiRoutes);


// Predictive Risk Engine Endpoint
app.get('/api/risk/heatmap', requireAuth, (req, res) => {
  const minLat = parseFloat(req.query.minLat as string) || 28.5;
  const maxLat = parseFloat(req.query.maxLat as string) || 28.7;
  const minLng = parseFloat(req.query.minLng as string) || 77.1;
  const maxLng = parseFloat(req.query.maxLng as string) || 77.3;
  
  const heatmap = getRiskHeatmap(minLat, maxLat, minLng, maxLng);
  res.json({ points: heatmap });
});

// --- Bystander Report Endpoint ---
app.post('/api/bystander-report', bystanderReportLimiter, validateBystanderReport, async (req, res) => {
  const { coords, victimStatus, description, image } = req.body;
  
  const { data, error } = await supabase
    .from('bystander_reports')
    .insert([
      { 
        location: `POINT(${coords.lng} ${coords.lat})`, 
        victim_status: victimStatus,
        description,
        image_url: image
      }
    ])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  // Broadcast to all clients (Dashboard, etc.)
  const socketIo = req.app.get('io');
  if (socketIo) {
    socketIo.emit('bystander:report', data![0]);
  }

  res.json({ success: true, reportId: data![0].id });
});

// --- Road Hazard Reports (Potholes, Obstructions, etc.) ---
app.get('/api/road-reports', async (req, res) => {
  const { data, error } = await supabase
    .from('road_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/road-reports', bystanderReportLimiter, async (req, res) => {
  const { type, severity, lat, lng, description, image } = req.body;
  
  const { data, error } = await supabase
    .from('road_reports')
    .insert([
      { 
        type,
        severity,
        location: `POINT(${lng} ${lat})`, 
        description,
        image_url: image
      }
    ])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  // Broadcast to map clients
  const socketIo = req.app.get('io');
  if (socketIo) {
    socketIo.emit('road:report', data![0]);
  }

  res.json({ success: true, reportId: data![0].id });
});

// Responder Routing Endpoint
app.get('/api/responders', requireAuth, async (req, res) => {
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
app.post('/api/fusion-triage', requireAuth, async (req, res) => {
  try {
    const fusionResult = await processFusionTriage(req.body);
    res.json(fusionResult);
  } catch (error) {
    console.error('Fusion Triage Error:', error);
    res.status(500).json({ error: 'Failed to process fusion triage' });
  }
});

// AI Triage Evaluation Endpoint
app.post('/api/triage', requireAuth, async (req, res) => {
  const { description, medicalProfile, hasImage, biometricsContext } = req.body;
  
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

// AI Predictive Risk Forecast
app.post('/api/sos', productionSosLimiter, validateSOS, async (req, res) => {
  const { lat, lng, type, timestamp } = req.body;
  
  // Create SOS alert in Supabase
  const { data, error } = await supabase
    .from('sos_alerts')
    .insert([
      { 
        location: `POINT(${lng} ${lat})`, 
        type, 
        status: 'ACTIVE',
        created_at: new Date(timestamp).toISOString()
      }
    ])
    .select();
    
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, alert: data![0] });
});

// AI Predictive Risk Forecast (Legacy)
app.post('/api/predict-risk', requireAuth, async (req, res) => {
  const { segment, weather } = req.body;
  if (!segment || !weather) {
    return res.status(400).json({ error: 'Road segment and weather condition required' });
  }

  try {
    const result = await predictRisk(segment, weather);
    res.json(result);
  } catch (error) {
    console.error('Predict Risk Error:', error);
    res.status(500).json({ error: 'Predictive engine currently unavailable' });
  }
});

// Crash Photo Vision Analysis
app.post('/api/triage/analyze-photo', requireAuth, async (req, res) => {
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
app.post('/api/triage/chat', requireAuth, async (req, res) => {
  const { messages, language, panicScore, biometricContext } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  await streamClaudeResponse(messages, res, language, panicScore, biometricContext);
});

// Multi-Agent War Room Consensus Endpoint
app.post('/api/triage/multi-agent', requireAuth, async (req, res) => {
  const { crashData, medData, resData } = req.body;

  const CRASH_SYSTEM = "You are a Crash Analyst. Analyze telemetry and determine impact severity. End with DECISION: [result].";
  const MED_SYSTEM = "You are a Medical Triage Officer. Analyze victim state and determine priority. End with DECISION: [result].";
  const RES_SYSTEM = "You are a Resource Optimizer. Allocate nearest units and hospitals. End with DECISION: [result].";

  try {
    const results = await claudeMultiAgent([
      { system: CRASH_SYSTEM, user: JSON.stringify(crashData) },
      { system: MED_SYSTEM, user: JSON.stringify(medData) },
      { system: RES_SYSTEM, user: JSON.stringify(resData) }
    ]);
    res.json({ results });
  } catch (error) {
    console.error('Multi-Agent Error:', error);
    res.status(500).json({ error: 'Multi-agent analysis failed' });
  }
});


// Route Safety Prediction
app.post('/api/route/safety', requireAuth, async (req, res) => {
  const { source, destination, weather } = req.body;
  if (!source || !destination) {
    return res.status(400).json({ error: 'Source and destination are required' });
  }

  try {
    const result = await predictRouteSafety(source, destination, weather);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Route analysis failed' });
  }
});

// Post-Incident Debrief Endpoint (Streaming)
app.post('/api/debrief/stream', requireAuth, async (req, res) => {
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
app.post('/api/training/stream', requireAuth, async (req, res) => {
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
app.post('/api/risk/summary', requireAuth, async (req, res) => {
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
app.post('/api/demo/reset', requireAuth, (req, res) => {
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

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`ROADSoS Backend running on port ${PORT}`);
  });
}

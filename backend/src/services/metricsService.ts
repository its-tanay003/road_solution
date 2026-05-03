import { Registry, Counter, Gauge, Histogram, collectDefaultMetrics } from 'prom-client';

export const register = new Registry();

// Default metrics (CPU, Memory, etc)
collectDefaultMetrics({ register });

// --- Custom Metrics ---

export const activeIncidents = new Gauge({
  name: 'active_incidents_total',
  help: 'Total number of active emergency incidents currently in the system',
  registers: [register],
});

export const aiTriageResponseTime = new Histogram({
  name: 'ai_triage_response_seconds',
  help: 'Duration of AI triage analysis',
  buckets: [0.5, 1, 2, 5, 10],
  registers: [register],
});

export const websocketConnections = new Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active websocket connections (clients + responders)',
  registers: [register],
});

export const sosTriggers = new Counter({
  name: 'sos_triggers_total',
  help: 'Total number of SOS events triggered',
  registers: [register],
});

export const dispatchConfirmations = new Counter({
  name: 'dispatch_confirmations_total',
  help: 'Total number of emergency dispatches confirmed',
  registers: [register],
});

export const apiRequestDuration = new Histogram({
  name: 'api_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

import { Request, Response, NextFunction } from 'express';

// Simple in-memory metrics store for demonstration
export const metrics = {
  requestCount: 0,
  errorCount: 0,
  sosTriggers: 0,
  aiTriageCount: 0,
  totalAiLatency: 0,
};

export const observabilityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  metrics.requestCount++;

  // Track SOS triggers specifically
  if (req.path === '/api/sos/trigger' && req.method === 'POST') {
    metrics.sosTriggers++;
  }

  // Intercept response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    if (res.statusCode >= 400) {
      metrics.errorCount++;
    }

    if (req.path === '/api/fusion-triage' || req.path === '/api/triage') {
      metrics.aiTriageCount++;
      metrics.totalAiLatency += duration;
    }

    console.log(`[OBSERVABILITY] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
};

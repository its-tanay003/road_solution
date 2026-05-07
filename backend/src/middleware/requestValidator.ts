/**
 * requestValidator.ts
 * Middleware to validate incoming POST payloads.
 */
import { Request, Response, NextFunction } from 'express';

export const validateSOS = (req: Request, res: Response, next: NextFunction) => {
  const { lat, lng, timestamp } = req.body;
  if (typeof lat !== 'number' || typeof lng !== 'number' || typeof timestamp !== 'number') {
    return res.status(400).json({ error: 'Valid lat (number), lng (number), and timestamp (number) are required' });
  }
  next();
};

export const validateBystanderReport = (req: Request, res: Response, next: NextFunction) => {
  const { coords, victimStatus } = req.body;
  if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
    return res.status(400).json({ error: 'Valid coords {lat, lng} required' });
  }
  const allowedStatus = ['CRITICAL', 'STABLE', 'UNKNOWN', 'MINOR'];
  if (!victimStatus || !allowedStatus.includes(victimStatus)) {
    return res.status(400).json({ error: `victimStatus must be one of: ${allowedStatus.join(', ')}` });
  }
  next();
};

export const validateTriage = (req: Request, res: Response, next: NextFunction) => {
  const { description } = req.body;
  if (typeof description !== 'string' || description.length > 2000) {
    return res.status(400).json({ error: 'Description string (max 2000 chars) is required' });
  }
  next();
};

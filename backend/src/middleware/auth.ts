import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

export interface AuthRequest extends Request {
  userId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'roadsos_dev_secret_change_in_production';

/**
 * Middleware: Require a valid Bearer JWT to access a route.
 */
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Rate limiter for auth endpoints: 10 requests per 15 minutes per IP.
 * Prevents brute-force login/register attempts.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
});

/**
 * Rate limiter for OTP send endpoint: 3 requests per minute per IP.
 * Prevents OTP farming.
 */
export const otpRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many OTP requests. Wait 1 minute.' },
});

/**
 * Rate limiter for SOS dispatch: 5 requests per minute per IP.
 */
export const sosRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many SOS requests. Please wait.' },
});

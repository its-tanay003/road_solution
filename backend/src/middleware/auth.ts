import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../services/supabaseClient';
import rateLimit from 'express-rate-limit';

export interface AuthRequest extends Request {
  userId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'roadsos_dev_secret_change_in_production';

/**
 * Middleware: Require a valid Bearer JWT to access a route.
 */
export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const token = auth.slice(7);
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.userId = user.id;
    next();
  } catch {
    res.status(401).json({ error: 'Authentication check failed' });
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

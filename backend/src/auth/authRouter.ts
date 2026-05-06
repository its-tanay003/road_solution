import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'roadsos_dev_secret_change_in_production';
const JWT_EXPIRES = '30d';

interface StoredUser {
  id: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  name: string;
  provider: string;
  avatar?: string;
}

// In-memory store for demo — swap for MongoDB/PostgreSQL in production
const users = new Map<string, StoredUser>();
const otpStore = new Map<string, { otp: string; expiry: number }>();

const generateToken = (userId: string): string =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

const makeUser = (u: StoredUser) => ({
  id: u.id, email: u.email, phone: u.phone, name: u.name, provider: u.provider, avatar: u.avatar,
});

// POST /auth/register — email + password
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'email, password, name are required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (users.has(email)) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const id = `u_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    users.set(email, { id, email, passwordHash, name, provider: 'email' });

    const token = generateToken(id);
    return res.status(201).json({ token, user: makeUser(users.get(email)!) });
  } catch {
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /auth/login — email + password
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = users.get(email);
    if (!user?.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user.id);
    return res.json({ token, user: makeUser(user) });
  } catch {
    return res.status(500).json({ error: 'Login failed' });
  }
});

// POST /auth/phone/send-otp
router.post('/phone/send-otp', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body; // format: +91XXXXXXXXXX
    if (!phone) return res.status(400).json({ error: 'phone required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phone, { otp, expiry: Date.now() + 10 * 60 * 1000 }); // 10 min TTL

    // Production: send via Twilio/MSG91
    // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    // await client.messages.create({ body: `ROADSoS OTP: ${otp}`, from: process.env.TWILIO_FROM, to: phone });

    console.log(`[AUTH] OTP for ${phone}: ${otp}`); // dev only

    // Return OTP in dev so frontend can pre-fill
    const response: Record<string, string> = { message: 'OTP sent' };
    if (process.env.NODE_ENV !== 'production') response.otp = otp;
    return res.json(response);
  } catch {
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// POST /auth/phone/verify-otp
router.post('/phone/verify-otp', (req: Request, res: Response) => {
  const { phone, otp, name } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'phone and otp required' });

  const record = otpStore.get(phone);
  if (!record) return res.status(401).json({ error: 'OTP not found or expired — request a new one' });
  if (record.otp !== otp) return res.status(401).json({ error: 'Invalid OTP' });
  if (Date.now() > record.expiry) return res.status(401).json({ error: 'OTP expired' });

  otpStore.delete(phone);

  let user = [...users.values()].find(u => u.phone === phone);
  if (!user) {
    const id = `u_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    user = { id, phone, name: (name as string) ?? 'User', provider: 'phone' };
    users.set(phone, user);
  }

  const token = generateToken(user.id);
  return res.json({ token, user: makeUser(user) });
});

// POST /auth/oauth/google
router.post('/oauth/google', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential required' });

    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!googleRes.ok) return res.status(401).json({ error: 'Invalid Google token' });

    const profile = await googleRes.json() as { email: string; name: string; picture?: string; aud: string };

    // Verify audience matches our client ID
    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && profile.aud !== expectedClientId) {
      return res.status(401).json({ error: 'Token audience mismatch' });
    }

    const email = profile.email;
    let user = users.get(email) ?? [...users.values()].find(u => u.email === email);
    if (!user) {
      const id = `u_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      user = { id, email, name: profile.name, provider: 'google', avatar: profile.picture };
      users.set(email, user);
    }

    const token = generateToken(user.id);
    return res.json({ token, user: makeUser(user) });
  } catch {
    return res.status(500).json({ error: 'Google auth failed' });
  }
});

// POST /auth/refresh — extend a valid token
router.post('/refresh', (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: string };
    const token = generateToken(decoded.userId);
    return res.json({ token });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../services/supabaseClient';

const router = Router();

// Helper to format user response
const makeUser = (supabaseUser: any) => ({
  id: supabaseUser.id,
  email: supabaseUser.email,
  phone: supabaseUser.phone,
  name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'User',
  provider: supabaseUser.app_metadata?.provider || 'email',
  avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
});

// POST /auth/register — email + password
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'email, password, name are required' });

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: name },
      email_confirm: true
    });

    if (error) return res.status(400).json({ error: error.message });

    // Sync to public.profiles table
    await supabaseAdmin.from('profiles').insert({
      id: data.user.id,
      email: data.user.email,
      name: name
    });

    return res.status(201).json({ user: makeUser(data.user) });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /auth/login — Handled by Supabase on the frontend usually, 
// but we can provide a proxy if needed. Here we assume frontend uses supabase directly 
// for login, but this endpoint can be used for server-side auth.
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return res.status(401).json({ error: error.message });

    return res.json({ session: data.session, user: makeUser(data.user) });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

// POST /auth/phone/send-otp
router.post('/phone/send-otp', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'phone required' });

    const { error } = await supabaseAdmin.auth.signInWithOtp({
      phone,
    });

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ message: 'OTP sent' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// POST /auth/phone/verify-otp
router.post('/phone/verify-otp', async (req: Request, res: Response) => {
  const { phone, otp, name } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'phone and otp required' });

  try {
    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms'
    });

    if (error) return res.status(401).json({ error: error.message });

    // If it's a new user, update their metadata
    if (name && data.user && !data.user.user_metadata?.full_name) {
      await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
        user_metadata: { full_name: name }
      });
      
      // Ensure profile exists
      await supabaseAdmin.from('profiles').upsert({
        id: data.user.id,
        phone: data.user.phone,
        name: name
      });
    }

    return res.json({ session: data.session, user: makeUser(data.user) });
  } catch (err) {
    return res.status(500).json({ error: 'Verification failed' });
  }
});

// POST /auth/oauth/google
router.post('/oauth/google', async (req: Request, res: Response) => {
  // In Supabase, Google OAuth is typically handled on the frontend.
  // This endpoint might be used for mobile or specific flows.
  return res.status(501).json({ error: 'Use frontend Supabase client for Google OAuth' });
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });
  
  try {
    const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token });
    if (error) return res.status(401).json({ error: error.message });
    return res.json({ session: data.session });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

type Tab = 'phone' | 'email' | 'social';

export function LoginPage() {
  const [tab, setTab] = useState<Tab>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 52, borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff', padding: '0 16px', fontSize: 15,
    marginBottom: 12, boxSizing: 'border-box', outline: 'none',
  };

  const btnPrimary: React.CSSProperties = {
    width: '100%', height: 52, borderRadius: 12,
    background: '#FF1744', border: 'none',
    color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer',
  };

  const handleSendOTP = async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API}/auth/phone/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}` }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? 'Failed to send OTP');
      setOtpSent(true);
      // In dev mode backend returns the OTP — pre-fill it
      if (data.otp) setOtp(data.otp);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API}/auth/phone/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}`, otp, name: name || 'User' }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? 'Invalid OTP');
      login(data.token, data.user);
      navigate('/');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    setLoading(false);
  };

  const handleEmailAuth = async () => {
    setLoading(true); setError('');
    try {
      const endpoint = isRegister ? 'register' : 'login';
      const body = isRegister ? { email, password, name } : { email, password };
      const r = await fetch(`${API}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? 'Auth failed');
      login(data.token, data.user);
      navigate('/');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    setLoading(false);
  };

  const handleDemoLogin = () => {
    // Judge-friendly bypass — creates a demo token
    login('demo-token-judges', {
      id: 'demo-user', name: 'Demo User',
      email: 'demo@roadsos.in', provider: 'demo',
    });
    navigate('/');
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'phone', label: 'Phone OTP' },
    { id: 'email', label: 'Email' },
    { id: 'social', label: 'Social' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-primary, #050A14)', padding: 20,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%', maxWidth: 420,
          background: 'var(--bg-secondary, #0A1628)',
          borderRadius: 24, padding: '2rem',
          border: '1px solid rgba(0,229,255,0.1)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: '#FF1744', letterSpacing: 2, margin: 0 }}>
            ROADSoS
          </h1>
          <p style={{ fontSize: 13, opacity: 0.5, marginTop: 6 }}>India's Emergency Intelligence OS</p>
        </div>

        {/* Demo bypass button — visible to judges */}
        <button
          onClick={handleDemoLogin}
          style={{
            width: '100%', height: 48, borderRadius: 12, marginBottom: 20,
            background: 'rgba(255,152,0,0.15)', border: '1px solid rgba(255,152,0,0.4)',
            color: '#FFB300', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          ⚡ Continue as Demo User (Judge Mode)
        </button>

        {/* Tab selector */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.05)',
          borderRadius: 12, padding: 4, marginBottom: 24, gap: 4,
        }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setError(''); }}
              style={{
                flex: 1, height: 40, borderRadius: 10, border: 'none',
                background: tab === t.id ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'phone' && (
            <motion.div key="phone"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {!otpSent ? (
                <>
                  <input
                    placeholder="Your name (optional)"
                    value={name} onChange={e => setName(e.target.value)}
                    style={inputStyle}
                  />
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <div style={{
                      width: 60, height: 52, borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 14, fontWeight: 500, flexShrink: 0,
                    }}>+91</div>
                    <input
                      type="tel"
                      placeholder="10-digit phone number"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      style={{ ...inputStyle, borderRadius: 12, marginBottom: 0 }}
                    />
                  </div>
                  <button onClick={handleSendOTP} disabled={phone.length !== 10 || loading} style={{
                    ...btnPrimary,
                    opacity: phone.length !== 10 ? 0.5 : 1,
                    cursor: phone.length !== 10 ? 'not-allowed' : 'pointer',
                  }}>
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <p style={{ textAlign: 'center', fontSize: 13, opacity: 0.6, marginBottom: 16 }}>
                    OTP sent to +91 {phone}
                  </p>
                  <input
                    type="text" placeholder="6-digit OTP"
                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{
                      ...inputStyle,
                      letterSpacing: 10, textAlign: 'center', fontSize: 22,
                      border: '1px solid rgba(0,229,255,0.3)',
                      background: 'rgba(0,229,255,0.05)',
                    }}
                  />
                  <button onClick={handleVerifyOTP} disabled={otp.length !== 6 || loading}
                    style={{ ...btnPrimary, background: '#1D9E75' }}>
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </button>
                  <button onClick={() => { setOtpSent(false); setOtp(''); }}
                    style={{ width: '100%', height: 40, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginTop: 8 }}>
                    ← Change number
                  </button>
                </>
              )}
            </motion.div>
          )}

          {tab === 'email' && (
            <motion.div key="email"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {isRegister && (
                <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
              )}
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} />
              <button onClick={handleEmailAuth} disabled={!email || !password || loading} style={btnPrimary}>
                {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Login'}
              </button>
              <button onClick={() => setIsRegister(!isRegister)}
                style={{ width: '100%', height: 40, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginTop: 8, fontSize: 13 }}>
                {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
              </button>
            </motion.div>
          )}

          {tab === 'social' && (
            <motion.div key="social"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ textAlign: 'center', padding: '1rem', opacity: 0.6, fontSize: 13, lineHeight: 1.6 }}>
                <p>Google and Facebook OAuth require API keys set in <code>.env</code>.</p>
                <p style={{ marginTop: 8 }}>For the demo, use Phone OTP or Email above, or the Demo User button.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 10,
              background: 'rgba(255,23,68,0.12)', border: '1px solid rgba(255,23,68,0.3)',
              color: '#FF6B7A', fontSize: 13, textAlign: 'center',
            }}
          >
            {error}
          </motion.div>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, opacity: 0.3, marginTop: 20, lineHeight: 1.6 }}>
          By continuing, you agree to our Privacy Policy.
          Your medical data stays encrypted on your device.
        </p>
      </motion.div>
    </div>
  );
}

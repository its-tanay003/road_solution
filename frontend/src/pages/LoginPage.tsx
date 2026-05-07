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
    <div className="min-h-screen flex items-center justify-center bg-background p-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-secondary rounded-[24px] p-8 border border-white/5 shadow-2xl backdrop-blur-xl"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-[36px] font-bold text-emergency tracking-widest m-0 leading-none">
            ROADSoS
          </h1>
          <p className="text-[13px] opacity-50 mt-2 font-mono uppercase tracking-tighter">India's Emergency Intelligence OS</p>
        </div>

        {/* Demo bypass button — visible to judges */}
        <button
          onClick={handleDemoLogin}
          className="w-full h-12 rounded-xl mb-5 bg-warning/10 border border-warning/30 text-warning text-sm font-semibold cursor-pointer hover:bg-warning/20 transition-all"
        >
          ⚡ Continue as Demo User (Judge Mode)
        </button>

        {/* Tab selector */}
        <div className="flex bg-white/5 rounded-xl p-1 mb-6 gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setError(''); }}
              className={`flex-1 h-10 rounded-lg border-none text-[13px] transition-all cursor-pointer ${
                tab === t.id 
                  ? 'bg-white/10 text-white font-semibold' 
                  : 'bg-transparent text-white/50 hover:text-white/80'
              }`}
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
                    className="w-full h-[52px] rounded-xl border border-white/15 bg-white/5 text-white px-4 text-[15px] mb-3 outline-none focus:border-emergency/50 transition-all"
                  />
                  <div className="flex gap-2 mb-4">
                    <div className="w-[60px] h-[52px] rounded-xl border border-white/15 bg-white/5 flex items-center justify-center text-white text-sm font-medium shrink-0 font-mono">
                      +91
                    </div>
                    <input
                      type="tel"
                      placeholder="10-digit phone number"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full h-[52px] rounded-xl border border-white/15 bg-white/5 text-white px-4 text-[15px] outline-none focus:border-emergency/50 transition-all font-mono"
                    />
                  </div>
                  <button 
                    onClick={handleSendOTP} 
                    disabled={phone.length !== 10 || loading}
                    className={`w-full h-[52px] rounded-xl bg-emergency text-white text-base font-semibold transition-all shadow-lg shadow-emergency/20 ${
                      phone.length !== 10 || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'
                    }`}
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-center text-[13px] opacity-60 mb-4">
                    OTP sent to +91 {phone}
                  </p>
                  <input
                    type="text" placeholder="6-digit OTP"
                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full h-[52px] rounded-xl text-white px-4 text-2xl mb-4 outline-none tracking-[0.5em] text-center font-bold border border-cyan/30 bg-cyan/5 focus:border-cyan/50 transition-all font-mono"
                  />
                  <button 
                    onClick={handleVerifyOTP} 
                    disabled={otp.length !== 6 || loading}
                    className={`w-full h-[52px] rounded-xl bg-safe text-white text-base font-semibold transition-all shadow-lg shadow-safe/20 ${
                      otp.length !== 6 || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'
                    }`}
                  >
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </button>
                  <button 
                    onClick={() => { setOtpSent(false); setOtp(''); }}
                    className="w-full h-10 bg-transparent border-none text-white/50 text-sm cursor-pointer mt-2 hover:text-white transition-colors"
                  >
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
                <input 
                  placeholder="Full name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full h-[52px] rounded-xl border border-white/15 bg-white/5 text-white px-4 text-[15px] mb-3 outline-none focus:border-emergency/50 transition-all"
                />
              )}
              <input 
                type="email" 
                placeholder="Email address" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full h-[52px] rounded-xl border border-white/15 bg-white/5 text-white px-4 text-[15px] mb-3 outline-none focus:border-emergency/50 transition-all"
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full h-[52px] rounded-xl border border-white/15 bg-white/5 text-white px-4 text-[15px] mb-4 outline-none focus:border-emergency/50 transition-all"
              />
              <button 
                onClick={handleEmailAuth} 
                disabled={!email || !password || loading}
                className={`w-full h-[52px] rounded-xl bg-emergency text-white text-base font-semibold transition-all shadow-lg shadow-emergency/20 ${
                  !email || !password || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'
                }`}
              >
                {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Login'}
              </button>
              <button 
                onClick={() => setIsRegister(!isRegister)}
                className="w-full h-10 bg-transparent border-none text-white/50 text-[13px] cursor-pointer mt-2 hover:text-white transition-colors"
              >
                {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
              </button>
            </motion.div>
          )}

          {tab === 'social' && (
            <motion.div key="social"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center p-4 opacity-60 text-[13px] leading-relaxed font-mono">
                <p>Google and Facebook OAuth require API keys set in <code className="bg-white/10 px-1 rounded">.env</code>.</p>
                <p className="mt-2">For the demo, use Phone OTP or Email above, or the Demo User button.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 rounded-xl bg-emergency/10 border border-emergency/30 text-emergency text-[13px] text-center"
          >
            {error}
          </motion.div>
        )}

        <p className="text-center text-[11px] opacity-30 mt-5 leading-relaxed font-mono">
          By continuing, you agree to our Privacy Policy.<br />
          Your medical data stays encrypted on your device.
        </p>
      </motion.div>
    </div>
  );
}

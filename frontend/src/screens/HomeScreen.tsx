import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ── Store ────────────────────────────────────────────────────────
import { useAuthStore }          from '../store/authStore';
import { useSocket }             from '../hooks/useSocket';

// ── Components ───────────────────────────────────────────────────
import { ParticleNetworkBackground } from '../components/ParticleNetworkBackground';
import { SOSHeroButton }             from '../components/SOSHeroButton';
import { QuickActionsGrid }          from '../components/QuickActionsGrid';
import { IndiaStatsTicker }          from '../components/IndiaStatsTicker';
import { NearbyServicesStrip }       from '../components/NearbyServicesStrip';
import { WearableStatusBar }         from '../components/WearableStatusBar';
import { PanicButton }               from '../components/PanicButton';
import { WeatherAlertBanner }        from '../components/WeatherAlertBanner';

// ══════════════════════════════════════════════════════════════════
// Status badges bar
// ══════════════════════════════════════════════════════════════════
interface BadgeProps { dot?: string; children: React.ReactNode }
function Badge({ dot, children }: BadgeProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      background: 'var(--bg-raised)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-full)', padding: '5px 10px',
      flexShrink: 0,
    }}>
      {dot && (
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0 }} />
      )}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </div>
  );
}

function StatusBadgesRow({ connected }: { connected: boolean }) {
  const [battery, setBattery] = useState<number | null>(null);

  useEffect(() => {
    // Web Battery API
    (navigator as any).getBattery?.().then((b: any) => {
      setBattery(Math.round(b.level * 100));
      b.addEventListener('levelchange', () => setBattery(Math.round(b.level * 100)));
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', padding: '0 var(--sp-5)' }}
      aria-label="Device status"
    >
      <Badge dot={connected ? 'var(--green)' : 'var(--amber)'}>
        {connected ? 'ONLINE' : 'MESH'}
      </Badge>
      <Badge>📍 GPS: ±4m</Badge>
      {battery !== null && <Badge>🔋 {battery}%</Badge>}
      <Badge dot="var(--amber)">⌚ Searching…</Badge>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════
// Offline banner
// ══════════════════════════════════════════════════════════════════
function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on  = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (!offline) return null;
  return (
    <div role="alert" style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(255,153,51,0.15)', borderBottom: '1px solid rgba(255,153,51,0.3)',
      padding: '8px 20px', textAlign: 'center',
      fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--amber)',
      fontWeight: 600, letterSpacing: '0.05em',
    }}>
      📡 OFFLINE — Mesh mode active
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// Greeting
// ══════════════════════════════════════════════════════════════════
const GREETINGS: Record<string, string> = {
  en: 'Hello',
  hi: 'नमस्ते',
  ta: 'வணக்கம்',
  mr: 'नमस्कार',
};

// ══════════════════════════════════════════════════════════════════
// HomeScreen — main export
// ══════════════════════════════════════════════════════════════════
const HomeScreen: React.FC = () => {
  const { user }          = useAuthStore();
  const { connected }     = useSocket();
  const scrollRef         = useRef<HTMLDivElement>(null);
  const [sosActive, setSosActive] = useState(false);
  const lang = (user as any)?.language ?? 'en';

  // Shake detector → voice assistant
  useEffect(() => {
    let lastShake = 0;
    let lastX = 0, lastY = 0, lastZ = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.acceleration;
      if (!acc) return;
      const dx = Math.abs((acc.x ?? 0) - lastX);
      const dy = Math.abs((acc.y ?? 0) - lastY);
      const dz = Math.abs((acc.z ?? 0) - lastZ);
      lastX = acc.x ?? 0; lastY = acc.y ?? 0; lastZ = acc.z ?? 0;
      if (dx + dy + dz > 30 && Date.now() - lastShake > 2000) {
        lastShake = Date.now();
        // Trigger voice assistant
        document.dispatchEvent(new CustomEvent('roadsosVoiceActivate'));
      }
    };

    window.addEventListener('devicemotion', handleMotion, { passive: true });
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);

  const greeting = GREETINGS[lang] ?? GREETINGS.en;
  const firstName = (user as any)?.name?.split(' ')[0] ?? null;

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {/* Offline bar */}
      <OfflineBanner />

      {/* ── ZONE 1: HERO (60vh) ───────────────────────────────── */}
      <section
        aria-label="Emergency SOS"
        style={{
          position: 'relative',
          height: '60vh',
          minHeight: 380,
          maxHeight: 650,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Three.js background */}
        <ParticleNetworkBackground sosActive={sosActive} />

        {/* Gradient overlay — fades 3D into page bg at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 80,
          background: 'linear-gradient(to bottom, transparent, var(--bg-base))',
          zIndex: 2, pointerEvents: 'none',
        }} />

        {/* Hero content layer */}
        <div style={{
          position: 'relative', zIndex: 3,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 20, width: '100%',
          padding: '0 20px',
        }}>
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ textAlign: 'center' }}
          >
            <h1 style={{
              margin: 0,
              fontFamily: 'var(--font-display)', fontWeight: 600,
              fontSize: 22, color: 'var(--text-primary)',
              letterSpacing: '-0.01em', lineHeight: 1.2,
            }}>
              {firstName
                ? <>{greeting}, <span style={{ color: 'var(--saffron)' }}>{firstName}</span></>
                : 'Welcome to ROADSoS'
              }
            </h1>
          </motion.div>

          {/* Status badges */}
          <StatusBadgesRow connected={connected} />

          {/* SOS button */}
          <SOSHeroButton lang={lang} onActivate={() => setSosActive(true)} />
        </div>
      </section>

      {/* ── ZONE 2: QUICK ACTIONS ─────────────────────────────── */}
      <section style={{
        paddingTop: 'var(--sp-6)',
        display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)',
      }}>
        <WeatherAlertBanner />
        <QuickActionsGrid />
      </section>

      {/* ── ZONE 3: LIVE STATUS ───────────────────────────────── */}
      <section style={{
        paddingTop: 'var(--sp-6)',
        paddingBottom: 'var(--sp-8)',
        display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)',
      }}>
        {/* Wearable vitals */}
        <WearableStatusBar />

        {/* India stats */}
        <IndiaStatsTicker />

        {/* Nearby hospitals */}
        <NearbyServicesStrip />

        {/* Footer space */}
        <div style={{ height: 8 }} />
      </section>

      {/* ── FLOATING: Panic button ────────────────────────────── */}
      <PanicButton />
    </div>
  );
};

export default HomeScreen;

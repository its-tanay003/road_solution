import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
    <div className="flex items-center gap-[5px] bg-(--bg-raised) border border-(--border) rounded-full px-[10px] py-[5px] shrink-0">
      {dot && (
        <span 
          className="w-[7px] h-[7px] rounded-full shrink-0" 
          style={{ background: dot }} // Keeping dynamic background color as inline style is acceptable for dynamic values, but since it's a fixed token often, we check.
        />
      )}
      <span className="font-mono text-[11px] text-(--text-secondary) whitespace-nowrap uppercase tracking-wider">
        {children}
      </span>
    </div>
  );
}

function StatusBadgesRow({ connected }: { connected: boolean }) {
  const [battery, setBattery] = useState<number | null>(null);

  useEffect(() => {
    // Web Battery API
    // @ts-expect-error - navigator.getBattery is not in all browser types
    navigator.getBattery?.().then((b: { level: number; addEventListener: (t: string, cb: () => void) => void }) => {
      setBattery(Math.round(b.level * 100));
      b.addEventListener('levelchange', () => setBattery(Math.round(b.level * 100)));
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="flex gap-2 overflow-x-auto scrollbar-none px-0 py-0 mx-(--sp-5)"
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
    <div role="alert" className="sticky top-0 z-40 bg-orange-500/15 border-b border-orange-500/30 px-5 py-2 text-center font-mono text-[12px] text-(--amber) font-semibold tracking-wider">
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
  const [sosActive, setSosActive] = useState(false);
  const lang = user?.language ?? 'en';

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

  const greeting = GREETINGS[lang as keyof typeof GREETINGS] ?? GREETINGS.en;
  const firstName = user?.name?.split(' ')[0] ?? null;

  return (
    <div className="relative min-h-full">
      {/* Offline bar */}
      <OfflineBanner />

      {/* ── ZONE 1: HERO (60vh) ───────────────────────────────── */}
      <section
        aria-label="Emergency SOS"
        className="relative h-[60vh] min-h-[380px] max-h-[650px] flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Three.js background */}
        <ParticleNetworkBackground sosActive={sosActive} />

        {/* Gradient overlay — fades 3D into page bg at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-(--bg-base) z-2 pointer-events-none" />

        {/* Hero content layer */}
        <div className="relative z-3 flex flex-col items-center gap-5 w-full px-5">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="text-center"
          >
            <h1 className="m-0 font-(--font-display) font-semibold text-[22px] text-(--text-primary) tracking-tight leading-tight">
              {firstName
                ? <>{greeting}, <span className="text-(--saffron)">{firstName}</span></>
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
      <section className="pt-(--sp-6) flex flex-col gap-(--sp-6)">
        <WeatherAlertBanner />
        <QuickActionsGrid />
      </section>

      {/* ── ZONE 3: LIVE STATUS ───────────────────────────────── */}
      <section className="pt-(--sp-6) pb-(--sp-8) flex flex-col gap-(--sp-6)">
        {/* Wearable vitals */}
        <WearableStatusBar />

        {/* India stats */}
        <IndiaStatsTicker />

        {/* Nearby hospitals */}
        <NearbyServicesStrip />

        {/* Footer space */}
        <div className="h-2" />
      </section>

      {/* ── FLOATING: Panic button ────────────────────────────── */}
      <PanicButton />
    </div>
  );
};

export default HomeScreen;

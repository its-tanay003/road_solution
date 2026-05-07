import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IndiaStatsTicker } from '../components/IndiaStatsTicker';
import { Settings, Shield, Activity, Monitor, Globe, Navigation2, BookOpen, X, Building2, ShieldCheck } from 'lucide-react';
import { RoadSafetyAwareness } from '../components/RoadSafetyAwareness';
import { useSocket } from '../hooks/useSocket';

// --- Particle Canvas Background ---
const ParticleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = canvas!.width;
        if (this.x > canvas!.width) this.x = 0;
        if (this.y < 0) this.y = canvas!.height;
        if (this.y > canvas!.height) this.y = 0;
      }

      draw() {
        ctx!.fillStyle = 'rgba(41, 121, 255, 0.35)';
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: 150 }, () => new Particle());
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.update();
        p.draw();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.strokeStyle = `rgba(41, 121, 255, ${0.35 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    window.addEventListener('resize', init);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', init);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-50" />;
};

import { SOSButton } from '../components/SOSButton';

// --- Main HomeScreen Component ---
const HomeScreen: React.FC = () => {
  const { connected } = useSocket();
  const navigate = useNavigate();
  const [gForce, setGForce] = useState(0.9);
  const [showAwareness, setShowAwareness] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGForce(0.9 + (Math.random() - 0.5) * 0.2);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen flex flex-col bg-(--clr-bg) text-(--clr-text) overflow-hidden">
      <ParticleCanvas />

      {/* Top Bar */}
      <header className="h-12 border-b border-(--clr-border) flex items-center justify-between px-4 z-20 bg-(--clr-bg)/80 backdrop-blur-md">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold hologram-text leading-none">ROADSoS</h1>
          <span className="text-[10px] font-mono text-(--clr-saffron) tracking-widest mt-0.5">
            EMERGENCY INTELLIGENCE PLATFORM
          </span>
        </div>

        <div className="flex-1 max-w-xl mx-8">
          <IndiaStatsTicker />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {['EN', 'हि', 'த'].map(lang => (
              <button key={lang} className="w-8 h-6 flex items-center justify-center text-[10px] font-bold border border-(--clr-border) hover:border-(--clr-blue) transition-colors rounded">
                {lang}
              </button>
            ))}
          </div>
          <button 
            title="System Settings"
            className="p-1.5 border border-(--clr-border) rounded hover:bg-white/5 transition-colors"
          >
            <Settings size={16} className="text-(--clr-text-2)" />
          </button>
          <div className="flex gap-1.5 ml-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-(--clr-green)' : 'bg-amber-500'} pulse-dot`} />
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-(--clr-blue)' : 'bg-white/10'}`} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 pb-20">
        {/* G-Force Display */}
        <motion.div 
          className="font-mono text-sm text-(--clr-text-2) mb-8 flex flex-col items-center"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-[10px] tracking-[0.3em] opacity-50 mb-1">IMPACT TELEMETRY</span>
          <span className="text-xl tracking-tighter">
            G: <span className="text-(--clr-text)">{gForce.toFixed(1)}G</span> ±0.1
          </span>
        </motion.div>

        <SOSButton />

      {/* Action Cards */}
        <div className="mt-16 flex flex-wrap justify-center gap-4">
          {[
            { id: 'report', label: 'BYSTANDER REPORT', icon: Shield, path: '/report/new' },
            { id: 'profile', label: 'MEDICAL PROFILE', icon: Activity, path: '/profile' },
            { id: 'dashboard', label: 'COMMAND CENTER', icon: Monitor, path: '/dashboard' },
            { id: 'impact', label: 'IMPACT ANALYSIS', icon: Activity, path: '/impact', color: 'text-(--clr-blue)' },
            { id: 'governance', label: 'GOV INTELLIGENCE', icon: Building2, path: '/governance', color: 'text-(--clr-blue)' },
            { id: 'eval', label: 'SIH EVALUATION', icon: ShieldCheck, path: '/roadmap', color: 'text-(--clr-green)' },
            { id: 'awareness', label: 'ROAD SAFETY IQ', icon: BookOpen, path: '#', color: 'text-(--clr-saffron)' }
          ].map((card) => (
            <motion.button
              key={card.id}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.03)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (card.id === 'awareness') setShowAwareness(true);
                else navigate(card.path);
              }}
              className="w-[140px] h-[88px] border border-(--clr-border) rounded-lg flex flex-col items-center justify-center gap-2 group transition-all"
            >
              <card.icon size={20} className={`${card.color || 'text-(--clr-blue)'} group-hover:text-(--clr-text) transition-colors`} />
              <span className="text-[9px] font-mono tracking-widest text-(--clr-text-2)">{card.label}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {showAwareness && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-(--clr-bg) border border-(--clr-border) rounded-[2.5rem] p-8 relative shadow-2xl"
              >
                <button 
                  onClick={() => setShowAwareness(false)}
                  title="Open Road Safety IQ Hub"
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
                <RoadSafetyAwareness />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Status Bar */}
      <footer className="h-9 border-t border-(--clr-border) bg-(--clr-bg)/80 backdrop-blur-md flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2 py-0.5 bg-(--clr-green)/10 border border-(--clr-green)/20 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-(--clr-green)" />
            <span className="text-[9px] font-mono font-bold text-(--clr-green) tracking-wider">MESH READY / ONLINE</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-(--clr-text-2)">
            <Globe size={12} />
            <span>CHENNAI_DC_01</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-[10px] font-mono text-(--clr-text-2)">
          <div className="flex items-center gap-2">
            <Navigation2 size={12} className="rotate-45" />
            <span>ACCURACY: <span className="text-(--clr-text)">±2.4M</span></span>
          </div>
          <div className="flex items-center gap-2 border-l border-(--clr-border) pl-6">
            <span className="opacity-50">LAST SYNC:</span>
            <span className="text-(--clr-text)">14:02:55.042</span>
          </div>
        </div>
      </footer>

      {/* CRT Scanline Texture Layer */}
      <div className="fixed inset-0 pointer-events-none z-10001 opacity-[0.03] bg-[url('/noise.svg')] blend-multiply" />
    </div>
  );
};

export default HomeScreen;

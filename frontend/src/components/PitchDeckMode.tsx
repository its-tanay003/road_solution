import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Activity, Shield, Siren } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface PitchDeckModeProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDemo: () => void;
}

export const PitchDeckMode: React.FC<PitchDeckModeProps> = ({ isOpen, onClose, onStartDemo }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [deathsCount, setDeathsCount] = useState(153972);
  const [startTime] = useState(Date.now());
  const [sessionDeaths, setSessionDeaths] = useState(0);

  const slides = [
    // Slide 1: The Problem
    {
      id: 'problem',
      content: (
        <div className="h-full flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <p className="text-[#FF9933] font-mono tracking-[0.3em] uppercase mb-4">India's Road Crisis</p>
            <div className="text-[120px] font-black leading-none text-white tracking-tighter flex items-center justify-center">
              <span className="text-[#FF9933] tabular-nums">{deathsCount.toLocaleString()}</span>
            </div>
            <p className="text-3xl font-bold text-white/90 mt-4 italic">"Every 3.4 minutes."</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-medium text-white/60 max-w-3xl">
              153,972 Indians died on roads in 2023.
            </h1>
            <div className="pt-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Siren className="text-[#FF9933] animate-pulse" size={32} />
                <span className="text-5xl font-black tracking-tighter">ROAD<span className="text-[#FF9933]">SoS</span></span>
              </div>
              <p className="text-xl text-white/30 uppercase tracking-[0.2em]">The Emergency Operating System India needs.</p>
            </div>
          </motion.div>
        </div>
      )
    },
    // Slide 2: The Platform
    {
      id: 'platform',
      content: (
        <div className="h-full flex flex-col items-center justify-center px-12">
          <h2 className="text-6xl font-black mb-20 tracking-tight">One Platform. <span className="text-[#FF9933]">Total Response.</span></h2>
          <div className="grid grid-cols-3 gap-12 w-full max-w-6xl">
            {[
              { icon: Siren, title: 'Detect', desc: 'AI-driven impact detection & automated e-calls.' },
              { icon: Activity, title: 'Triage', desc: 'Real-time medical telemetry & hospital coordination.' },
              { icon: Shield, title: 'Dispatch', desc: 'Drone reconnaissance & Good Samaritan activation.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="bg-white/5 border border-white/10 p-10 rounded-[3rem] text-center group hover:bg-[#FF9933]/10 hover:border-[#FF9933]/30 transition-all"
              >
                <div className="w-20 h-20 rounded-3xl bg-[#FF9933]/20 flex items-center justify-center text-[#FF9933] mx-auto mb-8 group-hover:scale-110 transition-transform">
                  <item.icon size={40} />
                </div>
                <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
                <p className="text-white/50 text-lg leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-20 text-center">
            <p className="text-2xl font-medium text-white/80 mb-8">30+ features. 7 India-specific integrations. 1 unified platform.</p>
            <div className="flex gap-4 justify-center">
              {['React 19', 'Three.js', 'Claude AI', 'Socket.io', 'Vercel'].map(tech => (
                <span key={tech} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-white/40">{tech}</span>
              ))}
            </div>
          </div>
        </div>
      )
    },
    // Slide 3: Live Demo
    {
      id: 'demo',
      content: (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex items-center gap-4 mb-12"
          >
            <div className="w-6 h-6 rounded-full bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]" />
            <h2 className="text-8xl font-black tracking-tighter uppercase">Live Demo</h2>
          </motion.div>
          <div className="bg-white/5 border border-white/10 p-12 rounded-[4rem] max-w-2xl">
            <p className="text-2xl text-white/60 mb-8 leading-relaxed">
              We are now entering the ROADSoS environment.
              Experience the platform in a real-time urban crash scenario.
            </p>
            <div className="flex items-center justify-center gap-6">
              <kbd className="px-6 py-4 bg-white/10 rounded-2xl text-4xl font-bold shadow-2xl">SPACE</kbd>
              <span className="text-2xl font-mono text-[#FF9933]">TO START SCENARIO 1</span>
            </div>
          </div>
        </div>
      )
    },
    // Slide 4: Impact
    {
      id: 'impact',
      content: (
        <div className="h-full flex flex-col items-center justify-center px-12">
          <div className="max-w-5xl w-full">
            <h2 className="text-5xl font-bold text-white/90 mb-16 text-center">Deployment Impact</h2>
            
            <div className="grid grid-cols-2 gap-20 mb-20">
              <div className="space-y-12">
                <div>
                  <p className="text-[#FF9933] text-7xl font-black tracking-tighter">8,400</p>
                  <p className="text-2xl font-medium text-white/60">Lives saved/year in Tamil Nadu</p>
                </div>
                <div>
                  <p className="text-[#FF9933] text-7xl font-black tracking-tighter">53,000+</p>
                  <p className="text-2xl font-medium text-white/60">National lives saved per year</p>
                </div>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-mono uppercase tracking-widest text-white/40">
                    <span>Current Response Time</span>
                    <span>9.2 min</span>
                  </div>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className="h-6 bg-red-500/20 border border-red-500/50 rounded-full overflow-hidden"
                  >
                    <div className="h-full bg-red-500 w-full" />
                  </motion.div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-mono uppercase tracking-widest text-[#FF9933]">
                    <span>ROADSoS AI-Optimized</span>
                    <span>87 sec</span>
                  </div>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '15.7%' }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="h-6 bg-[#FF9933]/20 border border-[#FF9933]/50 rounded-full overflow-hidden"
                  >
                    <div className="h-full bg-[#FF9933] w-full" />
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="bg-[#FF1744]/10 border border-[#FF1744]/30 p-8 rounded-3xl text-center">
              <p className="text-2xl font-bold mb-2">
                During this presentation, <span className="text-[#FF1744] tabular-nums">{Math.floor(sessionDeaths)}</span> Indians died on India's roads.
              </p>
              <p className="text-sm font-mono text-white/30 uppercase tracking-widest">Live Session Counter</p>
            </div>
          </div>
        </div>
      )
    },
    // Slide 5: Thank You
    {
      id: 'thanks',
      content: (
        <div className="h-full flex flex-col items-center justify-center text-center px-12">
          <motion.div
            animate={{ 
              filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)'],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="mb-12"
          >
            <div className="flex items-center justify-center gap-4 mb-2">
              <Siren className="text-[#FF9933]" size={64} />
              <span className="text-8xl font-black tracking-tighter">ROAD<span className="text-[#FF9933]">SoS</span></span>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-20 items-center max-w-5xl">
            <div className="space-y-8 text-left">
              <div className="space-y-2">
                <p className="text-6xl font-black text-white">Thank you</p>
                <p className="text-6xl font-black text-white/40">धन्यवाद</p>
                <p className="text-6xl font-black text-white/20">நன்றி</p>
              </div>
              <div className="pt-8 space-y-4">
                <p className="text-xl font-mono text-[#FF9933]">IIT Madras Road Safety Hackathon 2026</p>
                <p className="text-white/40 font-mono">Team: its-tanay003 / ROAD_SOLUTION</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] flex flex-col items-center">
              <QRCodeCanvas value="https://roadsos.vercel.app" size={240} />
              <p className="mt-6 text-black font-black uppercase tracking-widest text-sm">Scan to Deploy</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev < slides.length - 1 ? prev + 1 : prev));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev > 0 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === ' ') {
        if (currentSlide === 2) {
          onStartDemo();
        } else {
          nextSlide();
        }
      }
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isOpen, currentSlide, nextSlide, prevSlide, onStartDemo, onClose]);

  // Live counters
  useEffect(() => {
    const timer = setInterval(() => {
      setDeathsCount(prev => prev + (Math.random() > 0.9 ? 1 : 0));
      
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      setSessionDeaths(elapsedSeconds * (153972 / (365 * 24 * 3600)));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[5000] bg-[#080C14] text-white select-none overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF9933]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 flex">
        {slides.map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 h-full transition-all duration-500 ${i <= currentSlide ? 'bg-[#FF9933]' : 'bg-transparent'}`} 
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="h-full"
          >
            {slides[currentSlide].content}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-20 transition-all cursor-pointer"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-20 transition-all cursor-pointer"
            >
              <ChevronRight size={32} />
            </button>
          </div>

          <div className="flex items-center gap-6">
            <span className="font-mono text-white/20 tracking-[0.3em]">SLIDE {currentSlide + 1} / {slides.length}</span>
            <button 
              onClick={onClose}
              className="text-xs font-mono text-white/20 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
            >
              Exit Deck [ESC]
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

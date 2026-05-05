import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ARNavigationView: React.FC = () => {
  const navigate = useNavigate();
  const [distance, setDistance] = useState(340);
  const [speed, setSpeed] = useState(42);

  useEffect(() => {
    const dTimer = setInterval(() => {
      setDistance(prev => Math.max(0, prev - 1));
    }, 100);

    const sTimer = setInterval(() => {
      setSpeed(prev => Math.max(38, Math.min(48, prev + (Math.random() - 0.5) * 4)));
    }, 2000);

    return () => {
      clearInterval(dTimer);
      clearInterval(sTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#080C14] text-white overflow-hidden font-ui">
      {/* 3D Ground Grid Simulation */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          perspective: '800px',
          perspectiveOrigin: '50% 100%'
        }}
      >
        <div 
          className="absolute inset-0"
          style={{
            transform: 'rotateX(60deg) translateY(0%)',
            background: 'linear-gradient(rgba(59, 130, 246, 0.2) 2px, transparent 2px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 2px, transparent 2px)',
            backgroundSize: '100px 100px',
            maskImage: 'linear-gradient(to bottom, transparent, black)'
          }}
        />
      </div>

      {/* Main AR HUD */}
      <div className="relative h-full flex flex-col p-8">
        {/* Top HUD */}
        <div className="flex justify-between items-start">
          <div className="p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl">
            <p className="text-[10px] font-mono text-white/40 uppercase mb-1">Current Speed</p>
            <p className="text-3xl font-mono font-black italic">
              {Math.floor(speed)} <span className="text-sm">KM/H</span>
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-mono text-(--clr-amber) uppercase font-bold mb-1">Golden Hour Timer</p>
            <p className="text-3xl font-mono font-black text-(--clr-amber) italic">44:12</p>
          </div>
        </div>

        {/* Central AR Elements */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Main Directional Arrow */}
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-8"
          >
            <svg width="120" height="120" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
              </defs>
              <path 
                d="M60 20L100 80H80V100H40V80H20L60 20Z" 
                fill="url(#arrowGrad)"
                filter="drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))"
              />
            </svg>
          </motion.div>

          <p className="text-6xl font-black italic mb-2 tracking-tighter">
            {distance} <span className="text-2xl not-italic">M</span>
          </p>
          <p className="text-sm font-black uppercase text-white/60 tracking-[0.3em] mb-12">Straight Ahead</p>

          {/* Floating AR Overlay Labels */}
          <div className="absolute top-1/4 right-0 transform translate-x-4">
            <div className="p-4 bg-blue-600/20 backdrop-blur-md border border-blue-500/40 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <div className="flex items-center gap-3">
                <Shield className="text-blue-400" />
                <div>
                  <p className="text-[8px] font-black uppercase opacity-60">Hospital ETA 4m</p>
                  <p className="text-sm font-black uppercase italic">Apollo Hospital — Turn Right 200m</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-1/4 left-0 transform -translate-x-4">
            <motion.div 
              animate={{ borderColor: ['rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.4)'] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="p-4 bg-red-600/20 backdrop-blur-md border border-red-500/40 rounded-2xl shadow-[0_0_20px_rgba(239, 68, 68, 0.2)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <div>
                  <p className="text-[8px] font-black uppercase text-red-400">Incident Detected</p>
                  <p className="text-sm font-black uppercase italic">Incident Zone — Straight Ahead {distance}m</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono text-white/40 uppercase tracking-widest">
            <Activity size={14} /> AR PROTOTYPE — WebXR Ready
          </div>
          
          <button 
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] active:scale-95"
          >
            End AR Navigation
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-20 text-[8px] font-mono text-center uppercase pointer-events-none">
        Full WebXR AR ready for ARCore Android and ARKit iOS deployment.
      </div>
    </div>
  );
};

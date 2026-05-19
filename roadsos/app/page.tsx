'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Map, MessageSquare, BookOpen, Phone, Wifi, WifiOff, ChevronRight } from 'lucide-react';
import { SOSButton } from '@/components/sos/SOSButton';
import { useSOSStore } from '@/lib/store/sosStore';
import { useEffect, useState } from 'react';

const QUICK_LINKS = [
  { href: '/map', icon: Map, label: 'Emergency Map', desc: 'Nearby hospitals & services', color: '#3b82f6' },
  { href: '/chat', icon: MessageSquare, label: 'AI Assistant', desc: 'Claude · Gemini · ChatGPT', color: '#d97706' },
  { href: '/first-aid', icon: BookOpen, label: 'First Aid', desc: 'Step-by-step guides', color: '#10b981' },
  { href: '/directory', icon: Phone, label: 'Directory', desc: 'Emergency numbers', color: '#8b5cf6' },
];

const EMERGENCY_NUMBERS = [
  { number: '112', label: 'Universal Emergency', color: '#ef4444' },
  { number: '108', label: 'Ambulance', color: '#f97316' },
  { number: '100', label: 'Police', color: '#3b82f6' },
  { number: '101', label: 'Fire', color: '#ef4444' },
];

export default function HomePage() {
  const { status, location } = useSOSStore();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    window.addEventListener('online', () => setOnline(true));
    window.addEventListener('offline', () => setOnline(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      {/* Offline banner */}
      {!online && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-yellow-800 text-yellow-100 py-2 text-sm font-medium">
          <WifiOff size={14} />
          Offline — Limited features available
        </div>
      )}

      {/* Header */}
      <header className="px-5 pt-14 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Shield size={20} className="text-red-500" />
            <h1 className="text-xl font-black tracking-tight text-white">ROADSoS</h1>
          </div>
          <p className="text-gray-500 text-xs">Emergency Response Platform</p>
        </div>
        <div className="flex items-center gap-1.5">
          {online ? (
            <span className="flex items-center gap-1 text-green-400 text-xs"><Wifi size={12} /> Live</span>
          ) : (
            <span className="flex items-center gap-1 text-yellow-400 text-xs"><WifiOff size={12} /> Offline</span>
          )}
        </div>
      </header>

      {/* SOS Hero */}
      <section className="flex flex-col items-center pt-4 pb-8 px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="flex flex-col items-center gap-5"
        >
          {/* Status card */}
          {status !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`w-full max-w-[320px] rounded-2xl px-4 py-3 border text-center ${
                status === 'acknowledged' ? 'bg-orange-950/50 border-orange-700 text-orange-200' :
                status === 'resolved' ? 'bg-green-950/50 border-green-700 text-green-200' :
                'bg-red-950/50 border-red-700 text-red-200'
              }`}
            >
              <p className="font-bold text-sm">
                {status === 'countdown' ? '🚨 SOS Activating…' :
                 status === 'active' ? '🔴 SOS ACTIVE — Help notified' :
                 status === 'acknowledged' ? '🚑 Help is on the way' :
                 status === 'resolved' ? '✅ All clear — You are safe' : ''}
              </p>
              {location && <p className="text-xs mt-1 opacity-80 truncate">{location.address}</p>}
            </motion.div>
          )}

          <SOSButton />

          <div className="text-center">
            <p className="text-gray-400 text-sm font-medium">Hold 3 seconds or triple-press</p>
            <p className="text-gray-600 text-xs mt-0.5">Or say &quot;Hey Emergency, send SOS&quot;</p>
          </div>
        </motion.div>
      </section>

      {/* Emergency Numbers */}
      <section className="px-5 mb-6">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Quick Dial</h2>
        <div className="grid grid-cols-4 gap-2">
          {EMERGENCY_NUMBERS.map((num) => (
            <a
              key={num.number}
              href={`tel:${num.number}`}
              className="flex flex-col items-center gap-1 bg-gray-900 border border-gray-800 rounded-2xl py-3 hover:border-gray-600 transition-colors active:scale-95"
            >
              <span className="font-black text-2xl" style={{ color: num.color }}>{num.number}</span>
              <span className="text-[9px] text-gray-500 text-center leading-tight">{num.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-5">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Features</h2>
        <div className="space-y-2">
          {QUICK_LINKS.map(({ href, icon: Icon, label, desc, color }) => (
            <Link key={href} href={href}>
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}22` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{label}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
                <ChevronRight size={16} className="text-gray-600 shrink-0" />
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Map, MessageSquare, BookOpen, Phone, Wifi, WifiOff, ChevronRight } from 'lucide-react';
import { SOSButton } from '@/components/sos/SOSButton';
import { HeaderControls } from '@/components/nav/HeaderControls';
import { useSOSStore } from '@/lib/store/sosStore';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const EMERGENCY_NUMBERS = [
  { number: '112', label: 'Universal Emergency', cls: 'text-red-500' },
  { number: '108', label: 'Ambulance',           cls: 'text-orange-500' },
  { number: '100', label: 'Police',              cls: 'text-blue-500' },
  { number: '101', label: 'Fire',                cls: 'text-red-500' },
];

export default function HomePage() {
  const { t } = useTranslation();
  const { status, location } = useSOSStore();
  const [online, setOnline] = useState(true);
  const [isCarMode, setIsCarMode] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  const quickLinksTranslated = [
    { href: '/map',       icon: Map,           label: t('map.title', 'Emergency Map'),  desc: t('map.nearbyHospitals', 'Nearby hospitals & services'), iconCls: 'text-blue-400',    bgCls: 'bg-blue-500/10'    },
    { href: '/chat',      icon: MessageSquare, label: t('chat.title', 'AI Assistant'),   desc: t('chat.desc', 'Claude · Gemini · ChatGPT'),  iconCls: 'text-amber-400',   bgCls: 'bg-amber-500/10'   },
    { href: '/first-aid', icon: BookOpen,      label: t('emergency.firstAid', 'First Aid'),      desc: t('emergency.firstAidDesc', 'Step-by-step guides'),        iconCls: 'text-emerald-400', bgCls: 'bg-emerald-500/10' },
    { href: '/directory', icon: Phone,         label: t('emergency.services', 'Emergency Numbers'),      desc: t('emergency.servicesDesc', 'Direct emergency lines'),          iconCls: 'text-violet-400',  bgCls: 'bg-violet-500/10'  },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkCarMode = () => {
        const ua = navigator.userAgent.toLowerCase();
        const hasCarAgent =
          ua.includes('carplay') ||
          ua.includes('androidauto') ||
          ua.includes('android auto') ||
          ua.includes('car-mode');
        const searchParams = new URLSearchParams(window.location.search);
        const hasCarQuery = searchParams.get('mode') === 'car';
        
        // landscape wide screen and small height: typical console dimension
        const isCarSizing = window.innerWidth > 600 && window.innerHeight < 550;
        
        setIsCarMode(hasCarAgent || hasCarQuery || isCarSizing);
      };
      
      checkCarMode();
      window.addEventListener('resize', checkCarMode);
      return () => window.removeEventListener('resize', checkCarMode);
    }
  }, []);

  useEffect(() => {
    const checkOnline = () => {
      setOnline(navigator.onLine);
    };
    
    const timer = setTimeout(checkOnline, 0);

    window.addEventListener('online', checkOnline);
    window.addEventListener('offline', checkOnline);
    
    // Battery check
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', checkOnline);
      window.removeEventListener('offline', checkOnline);
    };
  }, []);

  if (isCarMode) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex flex-col justify-between">
        {/* Top car status */}
        <div className="flex items-center justify-between border-b border-gray-900 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <h1 className="text-sm font-black tracking-widest text-white uppercase">{t('carMode.connected', 'Automotive Deck Connected')}</h1>
          </div>
          <button 
            onClick={() => setIsCarMode(false)}
            className="text-[10px] bg-gray-900 border border-gray-800 text-gray-400 px-3 py-1.5 rounded-xl font-bold hover:text-white transition-colors"
          >
            {t('carMode.switchToMobile', 'Switch to Mobile View')}
          </button>
        </div>

        {/* Big screen grid layout */}
        <div className="grid grid-cols-2 gap-6 flex-1 items-center py-4 min-h-0">
          {/* Big SOS button block */}
          <div className="flex flex-col items-center justify-center bg-red-950/15 border-2 border-red-900/40 rounded-3xl p-6 h-full space-y-4 shadow-2xl">
            <SOSButton />
            <div className="text-center">
              <p className="text-red-400 font-black text-lg tracking-tight uppercase">{t('carMode.holdForSos', 'HOLD FOR SOS')}</p>
              <p className="text-gray-500 text-[10px] leading-relaxed">{t('carMode.triggerTip', 'Triple press volume keys or shake to trigger crash alert')}</p>
            </div>
          </div>

          {/* Large touch targets */}
          <div className="grid grid-rows-3 gap-3 h-full">
            <Link href="/map" className="flex items-center justify-between bg-gray-900 border border-gray-850 rounded-2xl px-6 py-4 hover:border-gray-650 transition-colors active:scale-98 shadow">
              <div className="flex items-center gap-4">
                <Map size={28} className="text-blue-400" />
                <span className="text-base font-black tracking-wider uppercase">{t('map.title', 'Emergency Map')}</span>
              </div>
              <ChevronRight size={18} className="text-gray-600" />
            </Link>

            <a href="tel:112" className="flex items-center justify-between bg-gray-900 border border-gray-850 rounded-2xl px-6 py-4 hover:border-gray-650 transition-colors active:scale-98 shadow">
              <div className="flex items-center gap-4">
                <Phone size={28} className="text-emerald-400" />
                <span className="text-base font-black tracking-wider uppercase">{t('carMode.callHelp', 'Call 112 Help')}</span>
              </div>
              <ChevronRight size={18} className="text-gray-600" />
            </a>

            <Link href="/chat" className="flex items-center justify-between bg-gray-900 border border-gray-850 rounded-2xl px-6 py-4 hover:border-gray-650 transition-colors active:scale-98 shadow">
              <div className="flex items-center gap-4">
                <MessageSquare size={28} className="text-amber-400" />
                <span className="text-base font-black tracking-wider uppercase">{t('carMode.voiceChatbot', 'Voice Chatbot')}</span>
              </div>
              <ChevronRight size={18} className="text-gray-600" />
            </Link>
          </div>
        </div>

        {/* Footer warning bar */}
        <div className="bg-yellow-950/15 border border-yellow-900/30 rounded-2xl px-4 py-2.5 text-center text-[10px] text-yellow-500 font-bold uppercase tracking-tight shrink-0">
          {t('carMode.safetyWarning', '⚠️ Say "Hey Emergency" anytime for hand-free safety. Focus on driving.')}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      {/* Offline banner */}
      {!online && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-yellow-800 text-yellow-100 py-2 text-sm font-medium">
          <WifiOff size={14} />
          {t('errors.offlineBanner', 'Offline — Limited features available')}
        </div>
      )}

      {/* Header */}
      <header className="px-5 pt-14 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Shield size={20} className="text-red-500" />
            <h1 className="text-xl font-black tracking-tight text-white">{t('appName', 'ROADSoS')}</h1>
          </div>
          <p className="text-gray-500 text-xs">{t('appSubtitle', 'AI Emergency Response & SOS')}</p>
        </div>
        <div className="flex items-center gap-2.5">
          {online ? (
            <span className="flex items-center gap-1 text-green-400 text-xs"><Wifi size={12} /> {t('status.live', 'Live')}</span>
          ) : (
            <span className="flex items-center gap-1 text-yellow-400 text-xs"><WifiOff size={12} /> {t('status.offline', 'Offline')}</span>
          )}
          <HeaderControls />
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
                {status === 'countdown' ? t('sos.sosActivating') :
                 status === 'active' ? t('sos.sosActive') :
                 status === 'acknowledged' ? t('sos.helpOnWay') :
                 status === 'resolved' ? t('sos.allClear') : ''}
              </p>
              {location && <p className="text-xs mt-1 opacity-80 truncate">{location.address}</p>}
            </motion.div>
          )}

          <SOSButton />

          <div className="text-center">
            <p className="text-gray-400 text-sm font-medium">{t('sos.holdToActivate', 'Hold 3 seconds or triple-press')}</p>
            <p className="text-gray-600 text-xs mt-0.5">{t('sos.orVoiceCommand', 'Or say "Hey Emergency, send SOS"')}</p>
          </div>
        </motion.div>
      </section>

      {/* Emergency Numbers */}
      <section className="px-5 mb-6">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('quickDial', 'Quick Dial')}</h2>
        <div className="grid grid-cols-4 gap-2">
          {EMERGENCY_NUMBERS.map((num) => (
            <a
              key={num.number}
              href={`tel:${num.number}`}
              className="flex flex-col items-center gap-1 bg-gray-900 border border-gray-800 rounded-2xl py-3 hover:border-gray-600 transition-colors active:scale-95"
            >
              <span className={`font-black text-2xl ${num.cls}`}>{num.number}</span>
              <span className="text-[9px] text-gray-500 text-center leading-tight">{t(`emergency.numbers.${num.number}`, num.label)}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Quick Links 2x2 Grid */}
      <section className="px-5 mb-8">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('features', 'Features')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickLinksTranslated.map(({ href, icon: Icon, label, desc, iconCls, bgCls }) => (
            <Link key={href} href={href}>
              <motion.div
                whileTap={{ scale: 0.96 }}
                className="flex flex-col gap-3 bg-gray-900 border border-gray-800 rounded-[20px] p-4 hover:border-gray-700 transition-colors h-full"
              >
                <div className="flex justify-between items-start">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgCls}`}>
                    <Icon size={18} className={iconCls} />
                  </div>
                  <ChevronRight size={16} className="text-gray-600 shrink-0 mt-1" />
                </div>
                <div className="mt-1">
                  <p className="font-bold text-white text-sm tracking-tight">{label}</p>
                  <p className="text-gray-500 text-[10px] leading-tight mt-0.5">{desc}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Live Status Bar */}
      <div className="px-5 mt-auto pb-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3 flex items-center justify-between shadow-lg">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">GPS</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${location ? 'bg-emerald-500' : 'bg-gray-600'}`} />
              <span className={`text-xs font-bold ${location ? 'text-emerald-400' : 'text-gray-500'}`}>
                {location ? 'SYNCED' : 'OFF'}
              </span>
            </div>
          </div>
          
          <div className="w-px h-6 bg-gray-800" />
          
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Battery</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${!batteryLevel ? 'bg-gray-600' : batteryLevel > 50 ? 'bg-emerald-500' : batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className={`text-xs font-bold ${!batteryLevel ? 'text-gray-500' : batteryLevel > 50 ? 'text-emerald-400' : batteryLevel > 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                {batteryLevel ? `${batteryLevel}%` : '---'}
              </span>
            </div>
          </div>

          <div className="w-px h-6 bg-gray-800" />
          
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Network</span>
            <div className="flex items-center gap-1.5">
              <Wifi size={10} className={online ? 'text-blue-400' : 'text-gray-500'} />
              <span className={`text-xs font-bold ${online ? 'text-blue-400' : 'text-gray-500'}`}>
                {online ? 'LIVE' : 'OFF'}
              </span>
            </div>
          </div>
          
          <div className="w-px h-6 bg-gray-800" />
          
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Speed</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">
                {location?.speed ? Math.round(location.speed * 3.6) : '0'} <span className="text-[9px] text-gray-500">km/h</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

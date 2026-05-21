'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  MessageCircle,
  Mail,
  Bell,
  Bluetooth,
  Cpu,
  Database,
  Radio,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSOSStore, BroadcastStatus } from '@/lib/store/sosStore';

interface BroadcastPanelProps {
  onContinue: () => void;
}

const CHANNEL_CONFIG = {
  sms: { label: 'Twilio SMS Dispatch', icon: MessageSquare, desc: 'Direct secure SMS to emergency contacts' },
  whatsapp: { label: 'WhatsApp Deep Link', icon: MessageCircle, desc: 'Pre-populated WhatsApp message link' },
  email: { label: 'Resend HTML Email', icon: Mail, desc: 'High-accuracy bento-grid email report' },
  push: { label: 'Web Push Service', icon: Bell, desc: 'Real-time alert on contact devices' },
  bluetooth: { label: 'Web Bluetooth Beacon', icon: Bluetooth, desc: 'Hardware SOS packet advertisement' },
  serial: { label: 'Web Serial COM Sweeper', icon: Cpu, desc: 'Emergency broadcast string to transceivers' },
  websocket: { label: 'Supabase Realtime', icon: Database, desc: 'Pushes live incident coordinate pins' },
  mqtt: { label: 'HiveMQ Public Broker', icon: Radio, desc: 'MQTT secure topic pub/sub transmission' }
};

export function BroadcastPanel({ onContinue }: BroadcastPanelProps) {
  const { t } = useTranslation();
  const { broadcastStatus } = useSOSStore();
  const [resolvedChannels, setResolvedChannels] = useState<string[]>([]);
  const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sineWaveRef = useRef<SVGPathElement | null>(null);

  // Parse the current broadcast status
  const currentStatus = broadcastStatus || {
    sms: 'pending',
    whatsapp: 'pending',
    email: 'pending',
    push: 'pending',
    bluetooth: 'pending',
    serial: 'pending',
    websocket: 'pending',
    mqtt: 'pending'
  };

  const channelKeys = Object.keys(CHANNEL_CONFIG) as (keyof typeof CHANNEL_CONFIG)[];

  // Track how many channels are completed/resolved
  const allResolved = channelKeys.every((k) => currentStatus[k] !== 'pending');

  // Trigger auto-dismiss when all resolve
  useEffect(() => {
    if (allResolved) {
      autoDismissTimerRef.current = setTimeout(() => {
        onContinue();
      }, 8000);
    }
    return () => {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }
    };
  }, [allResolved, onContinue]);

  // Frequency Sweep Sine Wave Animation
  useEffect(() => {
    let animationFrameId: number;
    let phase = 0;

    const animateWave = () => {
      phase += 0.15;
      if (sineWaveRef.current) {
        let points = [];
        const width = 300;
        const height = 40;
        for (let x = 0; x <= width; x += 2) {
          // Alter frequency and amplitude to simulate sweeping through bandwidths
          const freq = 0.04 + Math.sin(phase * 0.2) * 0.02;
          const amp = 10 + Math.sin(phase * 0.1) * 6;
          const y = height / 2 + Math.sin(x * freq + phase) * amp;
          points.push(`${x},${y}`);
        }
        sineWaveRef.current.setAttribute('d', `M ${points.join(' L ')}`);
      }
      animationFrameId = requestAnimationFrame(animateWave);
    };

    animateWave();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'broadcast':
      case 'link_generated':
      case 'published':
      case 'connected':
        return <CheckCircle2 className="w-5 h-5 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />;
      case 'unavailable':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      case 'pending':
      default:
        return <Loader2 className="w-5 h-5 text-red-500 animate-spin" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent':
      case 'broadcast':
      case 'link_generated':
      case 'published':
      case 'connected':
        return t('sos.sent', 'Sent');
      case 'failed':
        return t('sos.failed', 'Failed');
      case 'unavailable':
        return t('sos.unavailable', 'Unavailable');
      case 'pending':
      default:
        return t('sos.transmitting', 'Transmitting...');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-gray-950/96 backdrop-blur-xl p-6 text-white overflow-y-auto">
      <div className="w-full max-w-md bg-gray-900/80 border border-gray-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Animated Sweep Ambient Light */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Frequency Sweep Header */}
        <div className="flex flex-col items-center border-b border-gray-800/60 pb-6 mb-6">
          <div className="w-full max-w-[300px] h-[50px] flex items-center justify-center bg-black/40 rounded-2xl mb-4 border border-gray-800/40 relative">
            <svg className="w-full h-full" viewBox="0 0 300 40">
              <path
                ref={sineWaveRef}
                fill="none"
                stroke="url(#glowing-red)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="glowing-red" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7f1d1d" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#7f1d1d" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute text-[8px] font-black tracking-widest text-red-500/80 uppercase bottom-1">
              {t('sos.frequencySweep', 'Frequency Sweep Active')}
            </span>
          </div>

          <h2 className="text-white font-black text-xl tracking-tight text-center">
            {t('sos.broadcastingDistress', 'Broadcasting Distress Signals')}
          </h2>
          <p className="text-gray-400 text-xs mt-1.5 text-center px-4">
            {t('sos.allChannelsActive', 'Emitting distress packets through all wireless and IP channels simultaneously')}
          </p>
        </div>

        {/* 8 Channel Transmission Status List */}
        <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
          {channelKeys.map((key) => {
            const config = CHANNEL_CONFIG[key];
            const Icon = config.icon;
            const stat = currentStatus[key];
            
            return (
              <div
                key={key}
                className="flex items-center justify-between bg-black/30 border border-gray-800/40 rounded-2xl p-3 hover:border-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-800/50 border border-gray-700/30">
                    <Icon className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white tracking-tight">{config.label}</h3>
                    <p className="text-[10px] text-gray-500 font-medium leading-none mt-0.5">{config.desc}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    {getStatusText(stat)}
                  </span>
                  {getStatusIcon(stat)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Interactive Zone */}
        <div className="mt-6 pt-4 border-t border-gray-800/60 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {allResolved ? (
              <motion.button
                key="btn-continue"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                onClick={onContinue}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-sm tracking-widest uppercase rounded-2xl py-4 shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <span>{t('buttons.continue', 'Continue to Dashboard')}</span>
              </motion.button>
            ) : (
              <motion.div
                key="loading-msg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 py-2"
              >
                <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  {t('sos.waitingForChannels', 'Synthesizing channel outcomes...')}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

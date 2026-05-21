'use client';

import { useEffect, useRef } from 'react';
import { useVoiceStore } from '@/lib/store/voiceStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Compass, ShieldAlert, PhoneCall, Bot, Moon, Globe, HelpCircle } from 'lucide-react';

const COMMAND_CATEGORIES = [
  {
    title: 'SOS / Crisis Action',
    icon: ShieldAlert,
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    commands: [
      { trigger: '"Send SOS" / "Emergency"', desc: 'Immediately broadcasts telemetry and maps active emergency alerts.' },
      { trigger: '"Activate SOS"', desc: 'Triggers local SOS beacon transmitters.' }
    ]
  },
  {
    title: 'Navigation & Locating',
    icon: Compass,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    commands: [
      { trigger: '"Open Map" / "Show Map"', desc: 'Brings up the interactive hospital and service layers.' },
      { trigger: '"Find Hospital" / "Nearest Hospital"', desc: 'Filters and centers coordinates on the nearest medical care.' }
    ]
  },
  {
    title: 'Urgent Phone Hotlines',
    icon: PhoneCall,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    commands: [
      { trigger: '"Call 108" / "Call Ambulance"', desc: 'Instantly redirects browser dialer to ambulance lines.' },
      { trigger: '"Call 112"', desc: 'Triggers mobile dialer connection to global helpline systems.' }
    ]
  },
  {
    title: 'AI Companion Assistant',
    icon: Bot,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    commands: [
      { trigger: '"Open Chat" / "Talk to AI"', desc: 'Launches bottom drawer model selectors.' }
    ]
  },
  {
    title: 'System Preferences',
    icon: Moon,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    commands: [
      { trigger: '"Dark Mode" / "Light Mode"', desc: 'Changes color contrast scheme across all viewports.' }
    ]
  },
  {
    title: 'Language Translation',
    icon: Globe,
    color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    commands: [
      { trigger: '"Switch to Hindi" / "Switch to Gujarati"', desc: 'Adapts standard navigation context localization.' },
      { trigger: '"Change language to English"', desc: 'Swaps UI translations back to default English.' }
    ]
  }
];

export function VoiceCommandsOverlay() {
  const { isOverlayOpen, setOverlayOpen } = useVoiceStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOverlayOpen(false);
      }
    };
    if (isOverlayOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOverlayOpen, setOverlayOpen]);

  // Prevent scroll when overlay is open
  useEffect(() => {
    if (isOverlayOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOverlayOpen]);

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
      setOverlayOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isOverlayOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOutsideClick}
          className="fixed inset-0 z-[9999] bg-gray-950/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            ref={overlayRef}
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-gray-950 border border-gray-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-900 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                  <Mic size={20} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                    Voice Assistant Commands
                  </h2>
                  <p className="text-xs text-gray-400">
                    Continuous listening is active. Wake up commands using <span className="text-red-400 font-bold">"Hey Emergency"</span>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOverlayOpen(false)}
                className="p-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition-all"
                aria-label="Close commands help"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Info Card */}
              <div className="bg-gradient-to-r from-red-950/20 to-amber-950/20 border border-red-500/10 rounded-2xl p-4 flex gap-3">
                <HelpCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                <div className="text-xs leading-relaxed text-gray-300">
                  To invoke a command, first verify the bottom-left microphone indicator is active (pulsing). Then speak a trigger phrase clearly. If you are far from the microphone, speak <strong className="text-white">"Hey Emergency"</strong> or <strong className="text-white">"SOS Help"</strong> first to trigger high-sensitivity listening for 5 seconds.
                </div>
              </div>

              {/* Grid of commands */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COMMAND_CATEGORIES.map((cat) => {
                  const CatIcon = cat.icon;
                  return (
                    <div
                      key={cat.title}
                      className="border border-gray-900 bg-gray-900/20 rounded-2xl p-4 space-y-3 hover:border-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${cat.color}`}>
                          <CatIcon size={16} />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-300">
                          {cat.title}
                        </h3>
                      </div>
                      
                      <div className="space-y-2">
                        {cat.commands.map((cmd) => (
                          <div key={cmd.trigger} className="text-xs">
                            <div className="font-mono font-bold text-white bg-gray-900/60 border border-gray-850 px-2 py-1.5 rounded-lg inline-block select-all">
                              {cmd.trigger}
                            </div>
                            <p className="text-gray-400 mt-1 text-[11px] leading-relaxed">
                              {cmd.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900/40 border-t border-gray-900 px-6 py-4 flex justify-between items-center text-[10px] text-gray-500 shrink-0">
              <span>Press <kbd className="bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">ESC</kbd> or click outside to dismiss</span>
              <span>Say <span className="font-semibold text-gray-400">"Cancel"</span> to close overlay via voice</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

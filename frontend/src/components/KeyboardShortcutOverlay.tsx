import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Siren, Zap, Shield, Pause, Play, X, Clock, HelpCircle } from 'lucide-react';

interface KeyboardShortcutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isPaused: boolean;
}

export const KeyboardShortcutOverlay: React.FC<KeyboardShortcutOverlayProps> = ({ isOpen, onClose, isPaused }) => {
  const shortcuts = [
    { key: 'Shift + P', label: 'Presentation Mode', icon: Monitor, color: 'text-[#FF9933]' },
    { key: '1', label: 'Urban Crash Scenario', icon: Siren, color: 'text-red-500' },
    { key: '2', label: 'Mesh Network Failover', icon: Zap, color: 'text-yellow-400' },
    { key: '3', label: 'Bystander Intervention', icon: Shield, color: 'text-blue-400' },
    { key: '4', label: 'Hospital Surge Scenario', icon: Clock, color: 'text-purple-400' },
    { key: 'R', label: 'Reset All Scenarios', icon: X, color: 'text-white/40' },
    { key: 'Q', label: 'Q&A Pause Mode', icon: isPaused ? Play : Pause, color: 'text-white' },
    { key: 'S', label: 'Toggle Speed (1x/2x)', icon: Clock, color: 'text-white' },
    { key: 'Esc', label: 'Return to Home / Close', icon: X, color: 'text-white/40' },
    { key: '?', label: 'This Help Menu', icon: HelpCircle, color: 'text-[#FF9933]' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-6000 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="bg-[#080C14] border border-white/10 rounded-[3rem] p-12 max-w-2xl w-full relative shadow-[0_0_100px_rgba(0,0,0,0.5)]"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all cursor-pointer"
              title="Close shortcuts"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 rounded-2xl bg-[#FF9933]/20 flex items-center justify-center text-[#FF9933]">
                <Monitor size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight">KEYBOARD SHORTCUTS</h2>
                <p className="text-xs font-mono text-[#FF9933] uppercase tracking-[0.3em]">Operational Command Center</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {shortcuts.map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 border border-white/5 bg-white/2 rounded-2xl hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-[var(--radius-lg)] bg-black/40 group-hover:scale-110 transition-transform ${item.color}`}>
                      <item.icon size={18} />
                    </div>
                    <span className="text-sm font-medium text-white/70">{item.label}</span>
                  </div>
                  <kbd className="px-3 py-1.5 bg-white/10 border border-white/10 rounded-xl text-white font-mono text-xs font-bold shadow-lg">
                    {item.key}
                  </kbd>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 flex justify-between items-center text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">
              <span>ROADSoS v4.0.0-PRO</span>
              <span>IIT Madras 2026</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

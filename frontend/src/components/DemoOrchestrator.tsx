import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, FastForward, Info, Camera, X, Zap, Shield, Siren, Share2, CloudOff, Monitor } from 'lucide-react';
import { useDemoStore, useChaosStore } from '../store';
import { ShareCardGenerator } from './ShareCardGenerator';

/**
 * DemoOrchestrator
 * High-impact command center for hackathon presentations.
 * Allows judges/presenters to control time, trigger scenarios, and toggle HUD.
 */
export const DemoOrchestrator = () => {
  const { isPaused, playbackSpeed, isScreenshotMode, togglePause, setSpeed, toggleScreenshot, togglePresentationMode, toggleShortcuts, showShortcuts } = useDemoStore();
  const { internetKilled, killInternet } = useChaosStore();
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);

  const scenarioLogs = {
    urban: [
      "CRASH DETECTED: OMR Road, Chennai",
      "VAAHAN: Querying TN 09 AZ 4521...",
      "VAAHAN: Maruti Swift | Insured: YES",
      "G-Force: 14.2G | E-Call Initiated",
      "Triage: CRITICAL - ALS Unit Dispatched",
      "Golden Hour Timer: 59:58",
      "SYSTEM: AI API OFFLINE - FAILOVER ACTIVE"
    ],
    mesh: [
      "MESH ALERT: Cellular Tower #442 Down",
      "Protocol: Switching to P2P Mesh",
      "Nodes Connected: 14 Nodes",
      "Relay Status: STABLE"
    ],
    bystander: [
      "BYSTANDER REPORT: Video Feed Received",
      "AI Scene Analysis: Single Vehicle Crash",
      "Hazard Detected: Fuel Leakage",
      "Broadcast: Nearby responders alerted"
    ]
  };

  const triggerScenario = (type: 'urban' | 'mesh' | 'bystander') => {
    setActiveScenario(type);
    setTimeout(() => setActiveScenario(null), 5000);
  };

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === '?') toggleShortcuts();
      if (e.key === 'p') togglePause();
      if (e.key === '[') setSpeed(0.5);
      if (e.key === ']') setSpeed(2);
      if (e.key === '1') triggerScenario('urban');
      if (e.key === '2') triggerScenario('mesh');
      if (e.key === '3') triggerScenario('bystander');
      if (e.key === '\\') toggleScreenshot();
      if (e.key === 's') setShowShareCard(true);
      if (e.key === '0') killInternet();
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [togglePause, setSpeed, toggleScreenshot, killInternet, toggleShortcuts]);

  if (isScreenshotMode) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-1000 flex flex-col items-end gap-3 pointer-events-none">
        {/* Active Scenario Notification */}
        <AnimatePresence>
          {activeScenario && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`bg-[#0D1321] border p-4 shadow-2xl w-72 rounded-xl transition-colors pointer-events-auto ${internetKilled ? 'border-red-500' : 'border-[#FF9933]'}`}
            >
              <div className={`flex items-center gap-2 mb-2 ${internetKilled ? 'text-red-500' : 'text-[#FF9933]'}`}>
                <Siren size={16} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Scenario Active</span>
              </div>
              <div className="space-y-1">
                {scenarioLogs[activeScenario as keyof typeof scenarioLogs].map((log, i) => (
                  <p key={i} className="text-[10px] font-mono text-white/80 leading-relaxed">
                    <span className="text-[#FF9933]/50 mr-1">&gt;</span> {log}
                  </p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Mini-Controller */}
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-[#0D1321]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-1 shadow-2xl pointer-events-auto"
        >
          <button 
            onClick={() => toggleShortcuts()}
            className={`p-2 rounded-xl transition-all ${showShortcuts ? 'bg-[#FF9933] text-[#080C14]' : 'hover:bg-white/5 text-white/40'}`}
            title="Operational Shortcuts (?)"
          >
            <Info size={18} />
          </button>
          
          <button 
            onClick={togglePresentationMode}
            className="p-2 rounded-xl hover:bg-white/5 text-[#FF9933] transition-all"
            title="Pitch Deck Mode (Shift+P)"
          >
            <Monitor size={18} />
          </button>
          
          <div className="w-px h-6 bg-white/10 mx-1" />

          <button 
            onClick={togglePause} 
            className="p-2 rounded-xl hover:bg-white/5 text-white transition-all"
            title={isPaused ? "Resume (P)" : "Pause (P)"}
          >
            {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
          </button>

          <div className="flex bg-white/5 rounded-xl p-1">
            {[0.5, 1, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => setSpeed(speed)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  playbackSpeed === speed ? 'bg-[#FF9933] text-[#080C14]' : 'text-white/40 hover:text-white'
                }`}
                title={`Set speed to ${speed}x`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <button 
            onClick={killInternet} 
            className={`p-2 rounded-xl transition-all ${internetKilled ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-white/5 text-white/40'}`}
            title="Kill Internet Connectivity (0)"
          >
            <CloudOff size={18} />
          </button>

          <button onClick={toggleScreenshot} className="p-2 rounded-xl hover:bg-white/5 text-white/40 transition-all" title="Screenshot Mode (\)">
            <Camera size={18} />
          </button>
        </motion.div>
      </div>
      <AnimatePresence>
        {showShortcuts && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-2000 bg-[#080C14]/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => toggleShortcuts()}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#080C14] border border-white/10 rounded-[2.5rem] p-10 max-w-lg w-full relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => toggleShortcuts()}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#FF9933]/20 flex items-center justify-center text-[#FF9933]">
                  <Monitor size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Demo Controls</h2>
                  <p className="text-[10px] font-mono text-[#FF9933] uppercase tracking-widest">Presenter Mode v4.0</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 font-mono text-xs">
                {[
                  { key: '1', label: 'Trigger Urban Crash', icon: Siren },
                  { key: '2', label: 'Simulate Mesh Failover', icon: Zap },
                  { key: '3', label: 'Bystander Intervention', icon: Shield },
                  { key: '0', label: 'Kill Internet (AI Failover)', icon: Zap },
                  { key: 'P', label: 'Pause/Play (Q&A Mode)', icon: isPaused ? Play : Pause },
                  { key: 'S', label: 'Generate Success Card', icon: Share2 },
                  { key: '[ ]', label: 'Speed Control (0.5x / 2x)', icon: FastForward },
                  { key: '\\', label: 'Screenshot Mode (HUD Toggle)', icon: Camera },
                  { key: '?', label: 'Toggle This Menu', icon: Info },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <item.icon size={14} className="text-white/40" />
                      <span className="text-white/80">{item.label}</span>
                    </div>
                    <kbd className="px-2 py-1 bg-white/10 rounded-lg text-white font-bold">{item.key}</kbd>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-[9px] text-center text-white/20 uppercase tracking-[0.2em]">
                Exclusively for IIT Madras Road Safety Hackathon 2026
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Card Generator */}
      <AnimatePresence>
        {showShareCard && (
          <ShareCardGenerator 
            data={{
              incidentId: "CH-2026-X492",
              livesSaved: 2,
              responseTime: "04:22.04",
              carbonOffset: "4.2kg CO2",
              location: "OMR Road, Chennai"
            }}
            onClose={() => setShowShareCard(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default DemoOrchestrator;

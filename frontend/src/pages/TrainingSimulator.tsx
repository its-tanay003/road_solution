import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, BrainCircuit, Activity, ShieldAlert, Send,
  CheckCircle2, Medal, Trophy
} from 'lucide-react';
import { useTrainingStore } from '../store/trainingStore';
import { logger } from '../lib/logger';

type Phase = 'SETUP' | 'ACTIVE' | 'DEBRIEF';

const PREBUILT_SCENARIOS = [
  { id: 's1', title: 'Urban Crash', desc: 'High traffic intersection, multiple pedestrians.', params: 'Urban intersection, 2 vehicles, 1 pedestrian, minor injuries, 2km to hospital.' },
  { id: 's2', title: 'Highway Pileup', desc: 'High speed, severe injuries, multiple vehicles.', params: 'Highway, 4 vehicles, high speed, severe injuries, 15km to hospital, heavy rain.' },
  { id: 's3', title: 'Rural Accident', desc: 'Off-road, long response time, unknown injuries.', params: 'Rural road, 1 vehicle off ditch, unknown injuries, 45km to hospital, night time.' },
];

export const TrainingSimulator: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('SETUP');
  const [customParams, setCustomParams] = useState('');
  
  // Active state
  const [scenarioText, setScenarioText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [triageTime, setTriageTime] = useState<number | null>(null);
  
  // User decisions
  const [triageLevel, setTriageLevel] = useState<string | null>(null);
  const [unitDispatched, setUnitDispatched] = useState<string | null>(null);
  
  // Result
  const [score, setScore] = useState(0);
  const [debriefNotes, setDebriefNotes] = useState<string[]>([]);
  
  const addRecord = useTrainingStore(state => state.addRecord);
  
  const contentEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentEndRef.current && phase === 'ACTIVE') {
      contentEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scenarioText, phase]);

  const startScenario = async (params: string) => {
    setPhase('ACTIVE');
    setScenarioText('');
    setStartTime(Date.now());
    setIsStreaming(true);
    setTriageLevel(null);
    setUnitDispatched(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/training/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: params }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setIsStreaming(false);
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content_block_delta' && data.delta?.text) {
                setScenarioText(prev => prev + data.delta.text);
              }
            } catch {
              // Ignore incomplete chunks
            }
          }
        }
      }
    } catch (err) {
      logger.error(err);
      setScenarioText("Error loading scenario. Please try again.");
      setIsStreaming(false);
    }
  };

  const handleTriage = (level: string) => {
    setTriageLevel(level);
    if (!triageTime) setTriageTime(Date.now());
  };

  const submitDecisions = () => {
    if (!triageLevel || !unitDispatched) return;
    
    // Scoring logic (Simplified)
    let totalScore = 0;
    const notes: string[] = [];
    
    const timeToDecide = triageTime && startTime ? (triageTime - startTime) / 1000 : 60;
    
    if (timeToDecide < 15) {
      totalScore += 300;
      notes.push('Excellent time to first triage (+300)');
    } else if (timeToDecide < 30) {
      totalScore += 200;
      notes.push('Good time to first triage (+200)');
    } else {
      totalScore += 100;
      notes.push('Slow time to first triage (+100)');
    }

    // Rough check on unit mapping
    const isCritical = scenarioText.toLowerCase().includes('severe') || scenarioText.toLowerCase().includes('trapped');
    let correctUnit = false;
    
    if (isCritical && unitDispatched === 'ALS') {
      correctUnit = true;
      totalScore += 400;
      notes.push('Correctly dispatched Advanced Life Support for critical scenario (+400)');
    } else if (!isCritical && unitDispatched === 'BLS') {
      correctUnit = true;
      totalScore += 400;
      notes.push('Correctly preserved ALS units by dispatching BLS (+400)');
    } else {
      totalScore += 100;
      notes.push('Sub-optimal unit selection for this scenario (+100)');
    }

    totalScore += 147; // Base points + AI compliance mock

    setScore(totalScore);
    setDebriefNotes(notes);
    
    addRecord({
      scenarioType: 'Custom Simulation',
      score: totalScore,
      timeToTriage: timeToDecide,
      correctUnitDispatched: correctUnit,
      aiCompliance: true
    });
    
    setPhase('DEBRIEF');
  };

  return (
    <div className="min-h-screen bg-(--nx-bg-base) text-(--nx-text-primary) font-sans relative flex flex-col">
      {/* Global Training Banner */}
      <div className="w-full bg-amber-500/20 border-b border-amber-500/50 py-2 flex items-center justify-center gap-3">
        <AlertTriangle className="text-amber-500 animate-pulse" size={18} />
        <span className="text-amber-500 font-bold uppercase tracking-widest text-sm">SIMULATION — No real dispatch</span>
        <AlertTriangle className="text-amber-500 animate-pulse" size={18} />
      </div>

      <div className="flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full flex flex-col h-full">
        <div className="flex items-center gap-3 mb-8">
          <BrainCircuit className="text-(--nx-blue-primary)" size={32} />
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Training Simulator</h1>
        </div>

        <AnimatePresence mode="wait">
          {phase === 'SETUP' && (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-8"
            >
              {/* Prebuilt */}
              <div className="bg-(--nx-bg-surface) border border-(--nx-border) rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 uppercase tracking-wider text-(--nx-text-secondary)">Standard Scenarios</h2>
                <div className="space-y-4">
                  {PREBUILT_SCENARIOS.map(s => (
                    <div key={s.id} onClick={() => startScenario(s.params)} className="p-4 border border-(--nx-border-light) rounded-xl hover:border-(--nx-blue-primary) cursor-pointer transition-colors bg-(--nx-bg-elevated) group">
                      <h3 className="font-bold text-(--nx-blue-primary) uppercase tracking-wide group-hover:text-blue-400">{s.title}</h3>
                      <p className="text-sm text-(--nx-text-tertiary) mt-1">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom */}
              <div className="bg-(--nx-bg-surface) border border-(--nx-border) rounded-2xl p-6 flex flex-col">
                <h2 className="text-xl font-bold mb-4 uppercase tracking-wider text-(--nx-text-secondary)">Custom Scenario</h2>
                <textarea 
                  className="w-full flex-1 min-h-[150px] bg-(--nx-bg-base) border border-(--nx-border) rounded-xl p-4 text-(--nx-text-secondary) focus:outline-none focus:border-(--nx-blue-primary) resize-none"
                  placeholder="E.g., Multi-vehicle crash in snowstorm, 3 victims, nearest hospital 50 miles away..."
                  value={customParams}
                  onChange={(e) => setCustomParams(e.target.value)}
                />
                <button 
                  onClick={() => startScenario(customParams)}
                  disabled={!customParams.trim()}
                  className="mt-4 w-full py-3 bg-(--nx-blue-primary) hover:bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate & Start
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'ACTIVE' && (
            <motion.div 
              key="active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 grid md:grid-cols-3 gap-6 overflow-hidden min-h-[600px]"
            >
              {/* Scenario Feed */}
              <div className="md:col-span-2 flex flex-col bg-(--nx-bg-surface) border border-(--nx-border) rounded-2xl overflow-hidden">
                <div className="bg-(--nx-bg-elevated) border-b border-(--nx-border) p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Activity className="text-amber-500 animate-pulse" size={20} />
                    <span className="font-bold tracking-widest uppercase text-sm">Live Dispatch Feed</span>
                  </div>
                  {isStreaming && <span className="text-xs text-(--nx-text-tertiary) uppercase tracking-widest animate-pulse">Receiving Data...</span>}
                </div>
                <div className="flex-1 p-6 overflow-y-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-(--nx-text-secondary) custom-scrollbar">
                  {scenarioText}
                  <div ref={contentEndRef} />
                </div>
              </div>

              {/* Decision Panel */}
              <div className="flex flex-col gap-6">
                <div className="bg-(--nx-bg-surface) border border-(--nx-border) rounded-2xl p-6">
                  <h3 className="font-bold text-(--nx-text-secondary) uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldAlert size={18} /> Initial Triage
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map(level => (
                      <button 
                        key={level}
                        onClick={() => handleTriage(level)}
                        className={`p-2 border rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
                          triageLevel === level 
                            ? 'bg-(--nx-blue-primary) border-(--nx-blue-primary) text-white' 
                            : 'border-(--nx-border) text-(--nx-text-tertiary) hover:border-white/20'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-(--nx-bg-surface) border border-(--nx-border) rounded-2xl p-6">
                  <h3 className="font-bold text-(--nx-text-secondary) uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Send size={18} /> Dispatch Unit
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {['ALS (Advanced)', 'BLS (Basic)', 'Fire Rescue', 'Police Only'].map(unit => {
                      const uCode = unit.split(' ')[0];
                      return (
                        <button 
                          key={uCode}
                          onClick={() => setUnitDispatched(uCode)}
                          className={`p-3 border rounded-lg text-sm font-bold uppercase tracking-wider transition-colors text-left ${
                            unitDispatched === uCode
                              ? 'bg-(--nx-blue-primary) border-(--nx-blue-primary) text-white' 
                              : 'border-(--nx-border) text-(--nx-text-tertiary) hover:border-white/20'
                          }`}
                        >
                          {unit}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button 
                  onClick={submitDecisions}
                  disabled={!triageLevel || !unitDispatched || isStreaming}
                  className="mt-auto py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/50"
                >
                  Submit Response
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'DEBRIEF' && (
            <motion.div 
              key="debrief"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto w-full bg-(--nx-bg-surface) border border-(--nx-border) rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Trophy size={200} />
              </div>
              
              <div className="text-center mb-12 relative z-10">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                  <Medal size={48} className="text-blue-500" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-widest text-(--nx-text-secondary) mb-2">Simulation Complete</h2>
                <div className="text-6xl font-black italic tracking-tighter text-white">
                  {score} <span className="text-2xl text-(--nx-text-tertiary)">/ 1000</span>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <h3 className="font-bold uppercase tracking-widest text-sm text-(--nx-text-secondary) border-b border-(--nx-border) pb-2">Debrief Notes</h3>
                <ul className="space-y-4">
                  {debriefNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-3 text-(--nx-text-secondary)">
                      <CheckCircle2 className="text-(--nx-green-primary) shrink-0 mt-0.5" size={18} />
                      <span className="leading-relaxed">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-12 pt-8 border-t border-(--nx-border) flex justify-center z-10 relative">
                <button 
                  onClick={() => setPhase('SETUP')}
                  className="px-8 py-3 bg-(--nx-bg-elevated) hover:bg-(--nx-bg-base) border border-(--nx-border) text-white rounded-xl font-bold uppercase tracking-widest transition-colors"
                >
                  Return to Scenarios
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

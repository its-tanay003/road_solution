import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Phone, 
  AlertCircle, 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff,
  ShieldAlert,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import triageData from '../data/triage-protocol.json';

// Define SpeechRecognition types for browsers that support it
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface TriageNode {
  question?: string;
  action?: string;
  yes?: string;
  no?: string;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

interface OfflineTriageProtocolProps {
  onClose?: () => void;
  emergencyNumber?: string;
}

export const OfflineTriageProtocol: React.FC<OfflineTriageProtocolProps> = ({ 
  onClose, 
  emergencyNumber = '112' 
}) => {
  const [currentNodeId, setCurrentNodeId] = useState<string>('start');
  const [history, setHistory] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [priority, setPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('LOW');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);

  const currentNode = (triageData as Record<string, TriageNode>)[currentNodeId];

  // Speech Synthesis
  const speak = useCallback((text: string) => {
    if (!isSpeaking || !synthRef.current) return;
    
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    synthRef.current.speak(utterance);
  }, [isSpeaking]);

  useEffect(() => {
    if (currentNode) {
      const textToSpeak = `${currentNode.action || ''} ${currentNode.question || ''}`;
      speak(textToSpeak);
    }
  }, [currentNodeId, speak, currentNode]);

  const handleResponse = useCallback((response: boolean) => {
    const nextNodeId = response ? currentNode.yes : currentNode.no;
    if (nextNodeId && (triageData as Record<string, TriageNode>)[nextNodeId]) {
      const nextNodeData = (triageData as Record<string, TriageNode>)[nextNodeId];
      
      // Update priority if higher
      if (nextNodeData.priority) {
        const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        const currentIdx = priorities.indexOf(priority);
        const nodeIdx = priorities.indexOf(nextNodeData.priority);
        if (nodeIdx > currentIdx) {
          setPriority(nextNodeData.priority);
        }
      }

      setHistory(prev => [...prev, currentNodeId]);
      setCurrentNodeId(nextNodeId);
    }
  }, [currentNode, currentNodeId, priority]);

  // Speech Recognition
  useEffect(() => {
    type SpeechRecognitionConstructor = new () => SpeechRecognition;
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition || 
                           (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const results = event.results;
        const transcript = results[results.length - 1][0].transcript.toLowerCase();
        if (transcript.includes('yes')) {
          handleResponse(true);
        } else if (transcript.includes('no')) {
          handleResponse(false);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [handleResponse]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
      }
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevNodeId = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentNodeId(prevNodeId);
      setPriority('LOW'); // Reset to recalculate from remaining history if needed
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'CRITICAL': return 'bg-red-600 text-white border-red-400';
      case 'HIGH': return 'bg-orange-500 text-white border-orange-300';
      case 'MEDIUM': return 'bg-yellow-500 text-black border-yellow-300';
      default: return 'bg-blue-500 text-white border-blue-300';
    }
  };

  return (
    <div className="fixed inset-0 z-1000 flex flex-col bg-slate-950 text-white overflow-hidden font-sans">
      <div className="bg-amber-500 text-black px-4 py-2 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest">OFFLINE TRIAGE ACTIVE</span>
        </div>
        <div className="flex items-center gap-1 opacity-80">
          <Info size={14} />
          <span className="text-[10px] font-bold uppercase tracking-tight text-center">Based on WHO Basic Life Support guidelines</span>
        </div>
      </div>

      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={history.length > 0 ? handleBack : onClose}
            title={history.length > 0 ? "Previous Step" : "Close Triage"}
            aria-label={history.length > 0 ? "Go back to previous triage step" : "Close offline triage mode"}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tighter leading-none">OFFLINE TRIAGE MODE</h1>
            <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">WHO Emergency Protocol</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSpeaking(!isSpeaking)}
            className={`p-3 rounded-xl border transition-all ${isSpeaking ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-slate-400'}`}
          >
            {isSpeaking ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button 
            onClick={toggleListening}
            className={`p-3 rounded-xl border transition-all ${isListening ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 animate-pulse' : 'bg-white/5 border-white/10 text-slate-400'}`}
          >
            {isListening ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center max-w-2xl mx-auto w-full gap-8">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentNodeId}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            className="w-full space-y-8"
          >
            <div className="flex justify-center">
              <div className={`px-4 py-1.5 rounded-full border-2 text-xs font-black tracking-[0.2em] shadow-lg ${getPriorityColor(priority)}`}>
                PRIORITY: {priority}
              </div>
            </div>

            {currentNode.action && (
              <div className="bg-white text-black p-6 rounded-2xl shadow-2xl border-4 border-slate-400/20">
                <div className="flex items-center gap-3 mb-3 text-red-600">
                  <AlertCircle size={24} fill="currentColor" className="text-white" />
                  <span className="font-black uppercase tracking-widest text-xs">Immediate Action Required</span>
                </div>
                <p className="text-2xl font-black leading-tight tracking-tight uppercase italic">
                  {currentNode.action}
                </p>
              </div>
            )}

            {currentNode.question && (
              <div className="text-center space-y-4">
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Current Assessment</p>
                <h2 className="text-3xl md:text-4xl font-black text-white leading-none tracking-tighter">
                  {currentNode.question}
                </h2>
              </div>
            )}

            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 w-8 rounded-full transition-all ${i < history.length + 1 ? 'bg-blue-500' : 'bg-white/10'}`} 
                  />
                ))}
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Step {history.length + 1} of estimated 6</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-6 bg-slate-900 border-t border-white/10 space-y-4">
        {currentNode.yes && currentNode.no ? (
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleResponse(true)}
              className="h-[100px] bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 text-white font-black text-4xl"
            >
              YES
            </button>
            <button 
              onClick={() => handleResponse(false)}
              className="h-[100px] bg-red-600 hover:bg-red-500 active:scale-95 transition-all rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-red-900/20 text-white font-black text-4xl"
            >
              NO
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setCurrentNodeId('start')}
            className="w-full h-[80px] bg-blue-600 hover:bg-blue-500 rounded-2xl text-xl font-black uppercase tracking-widest transition-all"
          >
            Restart Protocol
          </button>
        )}

        <a 
          href={`tel:${emergencyNumber}`}
          className="w-full h-[70px] bg-white text-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-slate-200 active:scale-95 shadow-xl"
        >
          <Phone size={24} fill="currentColor" />
          <span className="text-xl font-black uppercase tracking-tighter">Call Emergency {emergencyNumber}</span>
        </a>
        
        {isListening && (
          <div className="text-center">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] animate-pulse">
              Voice Control Active: Say "YES" or "NO"
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

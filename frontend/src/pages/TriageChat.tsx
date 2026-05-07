import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Globe, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../store';
import { useWearableStore } from '../store/wearableStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { logger } from '../lib/logger';

export const TriageChat = () => {
  const { panicScore } = useUIStore();
  const { health, vehicle, devices } = useWearableStore();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: "Neural triage active. Describe the situation. Is anyone injured? What type of vehicles are involved?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [reasoningTokens, setReasoningTokens] = useState<number | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const speakMessage = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 0.9; // More tactical/robotic
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setInput((prev) => prev + finalTranscript);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);
    setReasoningTokens(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/triage/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          panicScore: panicScore,
          biometricContext: {
            heartRate: health.bpmHistory[health.bpmHistory.length-1].value,
            ecgStatus: health.ecgStatus,
            vehicle: vehicle,
            connectedDevices: devices.filter(d => d.status === 'CONNECTED').map(d => d.name)
          }
        })
      });

      if (!response.ok) throw new Error("Network error");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedResponse = "";

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.replace('data: ', '');
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.reasoningTokens) {
                setReasoningTokens(parsed.reasoningTokens);
              }

              if (parsed.content) {
                setMessages(prev => {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  lastMsg.content += parsed.content;
                  streamedResponse = lastMsg.content;
                  return updated;
                });
              }
            } catch {
              // Chunks may be partial
            }
          }
        }
      }
      speakMessage(streamedResponse);
      setIsOfflineMode(false);
    } catch (error) {
      logger.error("Chat Error:", error);
      setIsOfflineMode(true);
      const offlineResponse = "PROTOCOL 404: AI offline. Are they breathing? Start CPR if needed. Apply pressure to bleeding.";
      setMessages(prev => [...prev, { role: 'assistant', content: offlineResponse }]);
      speakMessage(offlineResponse);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-nx-bg-base relative overflow-hidden font-sans">
      {/* Tactical Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_3px)] z-50" />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-nx-border bg-nx-bg-(--color-surface)/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)} className="p-2 min-w-0">
            <ChevronLeft size={16} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white">Neural Triage</h2>
              <Badge variant="ai">Thinking</Badge>
            </div>
            <div className="flex gap-1 mt-1.5">
               {[1, 2, 3].map(i => (
                 <div key={i} className={`h-0.5 w-4 rounded-full ${i === 1 ? 'bg-nx-red-primary' : 'bg-nx-border'}`} />
               ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {reasoningTokens && (
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[8px] text-nx-text-tertiary uppercase font-mono">Reasoning Tokens</span>
              <span className="text-[10px] font-mono text-nx-purple-primary">{reasoningTokens}</span>
            </div>
          )}
          <Button variant="secondary" size="sm" className="p-2 min-w-0">
            <Globe size={16} />
          </Button>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] relative ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`nexus-label mb-1 text-[9px] ${msg.role === 'user' ? 'text-nx-red-primary' : 'text-nx-blue-primary'}`}>
                  {msg.role === 'user' ? 'WITNESS' : 'ROADOS AI'}
                </div>
                <div className={`p-4 rounded-sm border ${
                  msg.role === 'user' 
                    ? 'bg-nx-red-dim border-nx-red-primary/30 text-white' 
                    : 'bg-nx-bg-(--color-surface) border-nx-border text-nx-text-secondary leading-relaxed text-sm'
                }`}>
                  {msg.content}
                  {msg.role === 'assistant' && msg.content === '' && (
                    <div className="flex gap-1 py-1">
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-nx-blue-primary" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-nx-blue-primary" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-nx-blue-primary" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-nx-bg-(--color-surface) border-t border-nx-border space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
           {["Yes, injuries present", "Just property damage", "Multiple vehicles", "Smoke/Fire detected"].map((reply, i) => (
             <button 
               key={i} 
               onClick={() => handleSend(reply)}
               className="nexus-card px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-nx-text-tertiary hover:text-white border-nx-border hover:border-nx-border-active whitespace-nowrap transition-colors"
             >
               {reply}
             </button>
           ))}
        </div>

        <div className="flex gap-3 items-center">
          <Button 
            variant={isListening ? 'primary' : 'secondary'}
            onClick={toggleListening}
            title={isListening ? "STOP LISTENING" : "START VOICE INPUT"}
            className={`p-3 min-w-0 rounded-full ${isListening ? 'animate-pulse bg-nx-red-primary' : ''}`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </Button>
          
          <div className="flex-1 relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="REPORTING INCIDENT DETAILS..."
              title="INCIDENT REPORT INPUT"
              className="w-full bg-black/40 border border-nx-border rounded-sm py-3 px-4 text-sm font-mono text-white placeholder:text-nx-text-dim focus:outline-none focus:border-nx-blue-primary transition-colors"
            />
          </div>

          <Button 
            variant="secondary" 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="p-3 min-w-0 rounded-sm"
          >
            <Send size={20} />
          </Button>
        </div>

        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-nx-green-primary shadow-[0_0_4px_var(--nx-green-primary)]" />
             <span className="text-[9px] font-mono text-nx-text-tertiary uppercase tracking-widest">Neural Link Encryption Active</span>
           </div>
           {isOfflineMode && (
             <Badge variant="warning">Offline Protocol</Badge>
           )}
        </div>
      </div>
    </div>
  );
};

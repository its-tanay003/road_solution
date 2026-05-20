import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic, Send, Camera, Upload, MessageSquare, ChevronRight, ArrowLeft, Globe, Activity, type LucideIcon } from 'lucide-react';
import { Brain3D } from '../components/Brain3D';

type AIState = 'idle' | 'processing' | 'done';
type Mode = 'chat' | 'voice' | 'camera' | 'upload';

interface Message { role: 'user' | 'ai'; text: string; time: string; }

interface SystemStatus {
  status: string;
  providers: Record<string, string>;
}

/* ── scenario buttons (entry state) ─────────────────────────── */
const SCENARIOS = [
  { emoji: '🚨', text: "There's been an accident near me", textColor: 'text-red', bg: 'bg-red/10', border: 'border-red/25' },
  { emoji: '🩺', text: 'I need medical advice',           textColor: 'text-blue', bg: 'bg-blue/10', border: 'border-blue/25' },
  { emoji: '❓', text: 'I have a question',               textColor: 'text-text/50', bg: 'bg-white/5',     border: 'border-white/10' },
];

const MODES: { id: Mode; label: string; icon: LucideIcon }[] = [
  { id: 'chat',   label: 'Chat',   icon: MessageSquare },
  { id: 'voice',  label: 'Voice',  icon: Mic },
  { id: 'camera', label: 'Camera', icon: Camera },
  { id: 'upload', label: 'Upload', icon: Upload },
];

/* ── mock AI responses ──────────────────────────────────────── */
const AI_RESPONSES: Record<string, string> = {
  "There's been an accident near me":
    "I'm alerting nearby responders now. Stay calm. Is anyone injured? If unconscious — do NOT move them unless there's fire risk. Call 112 immediately if you haven't already. I'll guide you step by step.",
  "I need medical advice":
    "Tell me the symptoms you're experiencing. I'll assess severity and recommend action. For life-threatening symptoms (chest pain, difficulty breathing, loss of consciousness) — call 112 immediately.",
  "I have a question":
    "Of course — I'm here to help with any road safety, emergency, or medical question. What's on your mind?",
};

function timeStr() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

/* ── Chat bubbles ───────────────────────────────────────────── */
function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-blue to-purple flex items-center justify-center text-white font-black text-lg shrink-0 shadow-lg shadow-blue/20 mr-2 mt-auto">
          🤖
        </div>
      )}
      <div className={`max-w-[78%] px-4 py-3 rounded-2xl ${isUser
        ? 'bg-accent text-neutral-950 rounded-br-sm font-medium'
        : 'bg-surface text-neutral-100 border border-neutral-800 rounded-bl-sm'}`}>
        <p className="text-[14px] leading-relaxed">{msg.text}</p>
        <p className={`text-[10px] mt-1.5 ${isUser ? 'text-neutral-900/50' : 'text-neutral-400/50'}`}>{msg.time}</p>
      </div>
    </motion.div>
  );
}

/* ── MAIN ───────────────────────────────────────────────────── */
export const AIAssistantScreen: React.FC = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [aiState, setAiState] = useState<AIState>('idle');
  const [mode, setMode] = useState<Mode>('chat');
  const [activeProvider, setActiveProvider] = useState<'claude' | 'gemini'>('claude');
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/ai/ai-status')
      .then(res => res.json())
      .then(data => setSystemStatus(data))
      .catch(err => console.error('Failed to load AI status:', err));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setStarted(true);
    const userMsg: Message = { role: 'user', text, time: timeStr() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setAiState('processing');

    setTimeout(() => {
      const reply = AI_RESPONSES[text] ??
        "I'm analyzing your situation. Based on what you've told me, I recommend calling 112 immediately if there's any risk to life. Can you tell me more details?";
      setMessages(m => [...m, { role: 'ai', text: reply, time: timeStr() }]);
      setAiState('done');
      setTimeout(() => setAiState('idle'), 1500);
    }, 1800);
  };

  const performLiveSearch = async () => {
    if (!input.trim()) return;
    setStarted(true);
    const userMsg: Message = { role: 'user', text: input, time: timeStr() };
    setMessages(m => [...m, userMsg]);
    const query = input;
    setInput('');
    setAiState('processing');

    try {
      const res = await fetch('/api/ai/grounded-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'ai', text: data.text || 'No results found.', time: timeStr() }]);
    } catch (error) {
      console.error('Live search error:', error);
      setMessages(m => [...m, { role: 'ai', text: 'Live search failed.', time: timeStr() }]);
    } finally {
      setAiState('done');
      setTimeout(() => setAiState('idle'), 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      {/* header */}
      <header className="flex items-center gap-3 px-4 pt-10 pb-3 border-b border-neutral-800">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-xl bg-surface border border-neutral-800 hover:border-neutral-700 transition-colors" 
          aria-label="Go back"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-[17px] font-black text-white flex items-center gap-2">
            AI Assistant
            {systemStatus && (
              <span className="flex items-center gap-1 text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30 font-semibold uppercase tracking-wider">
                <Activity size={10} /> Online
              </span>
            )}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[11px] text-neutral-500">Powered by NEXUS</p>
            
            {/* Provider Toggle */}
            <div className="flex items-center bg-neutral-900 rounded-lg p-0.5 border border-neutral-800">
              <button
                onClick={() => setActiveProvider('claude')}
                className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-colors ${activeProvider === 'claude' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-neutral-500'}`}
              >
                CLAUDE
              </button>
              <button
                onClick={() => setActiveProvider('gemini')}
                className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-colors ${activeProvider === 'gemini' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-neutral-500'}`}
              >
                GEMINI
              </button>
            </div>
          </div>
        </div>
        {/* Brain 3D */}
        <Brain3D aiState={aiState} size={52} />
      </header>

      {/* mode selector */}
      <nav className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto no-scrollbar" aria-label="Input mode selector">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button 
            key={id} 
            onClick={() => setMode(id)}
            aria-pressed={mode === id}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all border ${
              mode === id 
                ? 'bg-accent text-neutral-950 border-accent' 
                : 'bg-surface text-neutral-400 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </nav>

      {/* Status Badges */}
      {systemStatus && (
        <div className="px-4 py-2 border-b border-neutral-800 flex flex-wrap gap-1.5">
          {Object.entries(systemStatus.providers).map(([agent, provider]) => (
            <div key={agent} className="flex items-center gap-1 text-[10px] bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
              <span className="text-neutral-400 capitalize">{agent}:</span>
              <span className={`font-bold capitalize ${provider === 'gemini' ? 'text-orange-400' : 'text-blue-400'}`}>
                {provider as string}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ENTRY or CHAT */}
      <main className="flex-1 overflow-y-auto" aria-live="polite">
        <AnimatePresence mode="wait">
          {!started ? (
            <motion.div 
              key="entry" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex flex-col px-4 pt-8 pb-6 h-full"
            >
              <h2 className="text-[26px] font-black text-white mb-2">How can I help you?</h2>
              <p className="text-neutral-500 text-[14px] mb-8">Choose a scenario or type below</p>

              <ul className="space-y-3 mb-8" role="list">
                {SCENARIOS.map(s => (
                  <li key={s.text} role="listitem">
                    <button 
                      onClick={() => sendMessage(s.text)}
                      className={`w-full p-4 rounded-2xl border ${s.border} ${s.bg} flex items-center gap-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98]`}
                    >
                      <span className="text-3xl shrink-0" aria-hidden="true">{s.emoji}</span>
                      <span className={`text-[16px] font-bold ${s.textColor}`}>{s.text}</span>
                      <ChevronRight size={16} className="text-neutral-500 ml-auto shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : (
            <motion.div 
              key="chat" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="px-4 pt-4 pb-4"
            >
              {messages.map((m, i) => <Bubble key={i} msg={m} />)}
              {aiState === 'processing' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mb-3 ml-9">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} animate={{ scale: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.18 }}
                      className="w-2 h-2 rounded-full bg-blue-500" />
                  ))}
                </motion.div>
              )}
              <div ref={bottomRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* input bar */}
      <footer className="border-t border-neutral-800 px-4 py-3 pb-6 bg-surface">
        {mode === 'voice' ? (
          <button 
            onClick={() => sendMessage('What should I do in a road accident?')}
            className="w-full h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center gap-3 text-red-500 font-black active:scale-[0.98]"
            aria-label="Hold to speak"
          >
            <Mic size={20} /> Hold to Speak
          </button>
        ) : (
          <div className="flex gap-3 items-end">
            <button 
              className="p-3 rounded-xl bg-base border border-white/5 hover:border-white/10 shrink-0" 
              aria-label="Use voice input"
            >
              <Mic size={18} className="text-white/50" />
            </button>
            <div className="flex-1 bg-base border border-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-2 focus-within:border-(--saffron)/50 transition-colors">
              <label htmlFor="ai-input" className="sr-only">Message AI Assistant</label>
              <input
                id="ai-input"
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder={started ? 'Type your message…' : 'Or speak to me…'}
                className="flex-1 bg-transparent text-white text-[14px] placeholder:text-white/30 outline-none"
              />
            </div>
            <div className="flex gap-1 shrink-0">
              <motion.button 
                whileTap={{ scale: 0.9 }} 
                onClick={performLiveSearch}
                disabled={!input.trim()}
                className={`p-3 rounded-xl transition-all border ${
                  input.trim() 
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20' 
                    : 'bg-base text-white/30 border-white/5'
                }`}
                aria-label="Live Search"
                title="Google Grounded Search"
              >
                <Globe size={18} />
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.9 }} 
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className={`p-3 rounded-xl transition-all border ${
                  input.trim() 
                    ? 'bg-saffron text-void border-(--saffron)' 
                    : 'bg-base text-white/30 border-white/5'
                }`}
                aria-label="Send message"
              >
                <Send size={18} />
              </motion.button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
};

export default AIAssistantScreen;


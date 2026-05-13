import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic, Send, Camera, Upload, MessageSquare, ChevronRight, ArrowLeft } from 'lucide-react';
import { Brain3D } from '../components/Brain3D';

type AIState = 'idle' | 'processing' | 'done';
type Mode = 'chat' | 'voice' | 'camera' | 'upload';

interface Message { role: 'user' | 'ai'; text: string; time: string; }

/* ── scenario buttons (entry state) ─────────────────────────── */
const SCENARIOS = [
  { emoji: '🚨', text: "There's been an accident near me", color: '#FF1744', bg: 'bg-red-600/10', border: 'border-red-500/25' },
  { emoji: '🩺', text: 'I need medical advice',           color: '#2979FF', bg: 'bg-blue-600/10', border: 'border-blue-500/25' },
  { emoji: '❓', text: 'I have a question',               color: '#9E9E9E', bg: 'bg-white/5',     border: 'border-white/10' },
];

const MODES: { id: Mode; label: string; icon: React.ElementType }[] = [
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
        <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-[11px] mr-2 mt-auto shrink-0">
          🤖
        </div>
      )}
      <div className={`max-w-[78%] px-4 py-3 rounded-2xl ${isUser
        ? 'bg-amber-400 text-black rounded-br-sm'
        : 'bg-white/8 text-white/90 border border-white/8 rounded-bl-sm'}`}>
        <p className="text-[14px] leading-relaxed">{msg.text}</p>
        <p className={`text-[10px] mt-1.5 ${isUser ? 'text-black/50' : 'text-white/30'}`}>{msg.time}</p>
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
  const bottomRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="fixed inset-0 bg-[#080C14] flex flex-col">
      {/* header */}
      <div className="flex items-center gap-3 px-4 pt-10 pb-3 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/5">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-[17px] font-black text-white">AI Assistant</h1>
          <p className="text-[11px] text-white/40">Powered by ROADSoS Intelligence</p>
        </div>
        {/* Brain 3D */}
        <Brain3D aiState={aiState} size={52} />
      </div>

      {/* mode selector */}
      <div className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto no-scrollbar">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setMode(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all ${mode === id ? 'bg-amber-400 text-black' : 'bg-white/5 text-white/50'}`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ENTRY or CHAT */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {!started ? (
            <motion.div key="entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col px-4 pt-8 pb-6 h-full">
              <h2 className="text-[26px] font-black text-white mb-2">How can I help you right now?</h2>
              <p className="text-white/40 text-[14px] mb-8">Choose a situation or describe what's happening</p>

              <div className="space-y-3 mb-8">
                {SCENARIOS.map(s => (
                  <motion.button key={s.text} whileTap={{ scale: 0.97 }} onClick={() => sendMessage(s.text)}
                    className={`w-full h-[80px] rounded-2xl ${s.bg} border ${s.border} flex items-center gap-4 px-5 text-left`}>
                    <span className="text-3xl shrink-0">{s.emoji}</span>
                    <span className="text-[16px] font-bold" style={{ color: s.color }}>{s.text}</span>
                    <ChevronRight size={16} className="text-white/20 ml-auto shrink-0" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="px-4 pt-4 pb-4">
              {messages.map((m, i) => <Bubble key={i} msg={m} />)}
              {aiState === 'processing' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mb-3 ml-9">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} animate={{ scale: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.18 }}
                      className="w-2 h-2 rounded-full bg-blue-400" />
                  ))}
                </motion.div>
              )}
              <div ref={bottomRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* input bar */}
      <div className="border-t border-white/5 px-4 py-3 pb-6 bg-[#0A1020]">
        {mode === 'voice' ? (
          <motion.button whileTap={{ scale: 0.93 }} onClick={() => sendMessage('What should I do in a road accident?')}
            className="w-full h-14 rounded-2xl bg-red-600/15 border border-red-500/25 flex items-center justify-center gap-3 text-red-400 font-black">
            <Mic size={20} /> Hold to Speak
          </motion.button>
        ) : (
          <div className="flex gap-3 items-end">
            <button className="p-3 rounded-xl bg-white/5 shrink-0"><Mic size={18} className="text-white/50" /></button>
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-2">
              <input
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder={started ? 'Type your message…' : 'Or speak to me…'}
                className="flex-1 bg-transparent text-white text-[14px] placeholder:text-white/30 outline-none"
              />
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className={`p-3 rounded-xl shrink-0 transition-all ${input.trim() ? 'bg-amber-400' : 'bg-white/5'}`}>
              <Send size={18} className={input.trim() ? 'text-black' : 'text-white/30'} />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistantScreen;

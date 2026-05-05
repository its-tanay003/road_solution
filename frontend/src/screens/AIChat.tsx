import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Brain, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export const AIChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "I am the ROADSoS AI. I can help with triage or guidance. What is the emergency?",
      sender: 'ai',
      timestamp: Date.now()
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Mock AI Response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand. Please stay calm. Responders have your location. Is the person conscious?",
        sender: 'ai',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
    }, 1500);
  };

  const quickChips = ["I'm injured", "Someone else is hurt", "Car accident", "Need ambulance"];

  return (
    <div className="flex-1 flex flex-col bg-night relative overflow-hidden">
      {/* Neural Background Pattern */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="neural" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="50" cy="50" r="1" fill="white" />
            <line x1="50" y1="50" x2="100" y2="100" stroke="white" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#neural)" />
        </svg>
      </div>

      {/* TOP HUD Bar for Chat */}
      <div className="h-16 glass flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan/10 rounded-full flex items-center justify-center border border-cyan/20">
            <Brain size={24} className="text-cyan" />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm uppercase tracking-widest">AI Triage Core</h2>
            <span className="text-[10px] text-cyan font-black uppercase tracking-tighter">Claude-Powered</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-safe-green text-xs font-bold uppercase tracking-widest">
          <Sparkles size={14} /> Neural Link Active
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col no-scrollbar">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={msg.sender === 'user' ? 'triage-msg-user' : 'triage-msg-ai'}
          >
            <div className="flex items-center gap-2 mb-2 opacity-50">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                {msg.sender === 'ai' ? 'ROADSoS AI' : 'YOU'}
              </span>
              <span className="text-[10px] text-white">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="text-white text-lg font-medium leading-relaxed">{msg.text}</p>
          </motion.div>
        ))}

        {isThinking && (
          <div className="triage-msg-ai">
            <div className="flex gap-1.5 items-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                  className="w-2 h-2 bg-cyan rounded-full"
                />
              ))}
              <span className="ml-2 text-cyan text-xs font-bold uppercase tracking-widest">Analyzing situation...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-night-2 border-t border-white/5 z-10">
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
          {quickChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setInput(chip)}
              className="flex-shrink-0 h-10 px-6 bg-night-3 border border-white/10 rounded-full text-white text-sm font-bold whitespace-nowrap active:scale-95 transition-transform"
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything or describe injury..."
              className="w-full h-14 bg-night rounded-2xl px-6 text-white font-medium focus:ring-2 focus:ring-cyan outline-none transition-all"
            />
          </div>
          
          <button aria-label="Start voice input" className="w-14 h-14 bg-night rounded-2xl flex items-center justify-center text-text-muted hover:text-cyan transition-colors active:scale-90 border border-white/10">
            <Mic size={24} />
          </button>
          
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label="Send message"
            className="w-14 h-14 bg-cyan text-night rounded-2xl flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50 disabled:scale-100"
          >
            <Send size={24} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

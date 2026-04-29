import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Globe, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const TriageChat = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: "Hello. I am the ROADSoS AI Assistant. Is anyone injured? What type of vehicles are involved?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    // Mock API call simulation
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', content: "Understood. Searching for the nearest available emergency services..." }]);
    }, 1500);
  };

  const quickReplies = [
    "Yes, injuries present", 
    "Just property damage", 
    "Need an ambulance", 
    "Fire detected"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] w-full bg-background relative z-10">
      
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 bg-navy/80 backdrop-blur-md border-b border-white/5 z-20">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full text-card hover:bg-white/10 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="font-condensed font-bold tracking-widest text-lg">AI TRIAGE</h2>
          <div className="flex space-x-1 mt-1">
            <div className="h-1 w-6 bg-safe rounded-full"></div>
            <div className="h-1 w-6 bg-white/20 rounded-full"></div>
            <div className="h-1 w-6 bg-white/20 rounded-full"></div>
          </div>
          <span className="text-[10px] font-mono text-muted mt-1 uppercase">Step 1 of 3</span>
        </div>
        <button className="p-2 bg-white/5 rounded-full text-card hover:bg-white/10 transition-colors">
          <Globe size={20} />
        </button>
      </div>

      {/* AI Avatar Header */}
      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-navy/50 to-transparent">
        <motion.div 
          className="relative w-20 h-20 flex items-center justify-center"
          animate={{ scale: isTyping ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div 
            className="absolute inset-0 rounded-full border border-safe/40"
            animate={{ rotate: 360, scale: isTyping ? [1, 1.3, 1] : 1 }}
            transition={{ rotate: { duration: 10, repeat: Infinity, ease: "linear" }, scale: { duration: 1.5, repeat: Infinity } }}
            style={{ borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }}
          />
          <motion.div 
            className="absolute inset-0 rounded-full border border-safe/20"
            animate={{ rotate: -360, scale: isTyping ? [1, 1.2, 1] : 1 }}
            transition={{ rotate: { duration: 8, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
            style={{ borderRadius: "50% 50% 30% 70% / 50% 70% 30% 50%" }}
          />
          <motion.div 
            className="absolute inset-3 rounded-full bg-safe/20 blur-lg"
            animate={{ scale: isTyping ? [1, 1.5, 1] : [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="z-10 w-10 h-10 rounded-full bg-safe shadow-[0_0_20px_rgba(46,196,182,0.8)]"></div>
        </motion.div>
        <div className="mt-4 text-safe font-mono text-xs tracking-widest uppercase opacity-80">
          {isTyping ? "Analyzing Input..." : "Listening"}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.05 * (idx % 5), type: 'spring', stiffness: 200, damping: 20 }}
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-4 rounded-3xl shadow-lg ${msg.role === 'user' ? 'bg-emergency/90 text-white rounded-br-sm border border-red-500/50' : 'bg-white/10 text-card rounded-bl-sm border border-white/20 font-sans text-md leading-relaxed backdrop-blur-md'}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white/10 p-4 rounded-3xl rounded-bl-sm flex space-x-2 border border-white/20 backdrop-blur-md">
                <div className="w-2.5 h-2.5 bg-safe rounded-full animate-pulse"></div>
                <div className="w-2.5 h-2.5 bg-safe rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2.5 h-2.5 bg-safe rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endOfMessagesRef} />
      </div>
      
      {/* Quick Replies */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {quickReplies.map((reply, i) => (
          <button 
            key={i}
            onClick={() => handleSend(reply)}
            className="whitespace-nowrap px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-sans hover:bg-white/10 transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-navy/90 backdrop-blur-xl border-t border-white/10 flex items-center space-x-3 pb-safe">
        <button className="p-3 bg-emergency/20 rounded-full text-emergency hover:bg-emergency hover:text-white transition-colors border border-emergency/30">
          <Mic size={22} />
        </button>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Describe the emergency..."
          className="flex-1 bg-black/40 text-white rounded-2xl px-5 py-3 focus:outline-none focus:ring-1 focus:ring-safe/50 border border-white/5 font-sans placeholder-gray-500"
        />
        <button 
          onClick={() => handleSend()}
          className="p-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-colors"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

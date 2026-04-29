import { useState, useRef, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export const ChatBot = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: "Hello. I am the ROADSoS AI Assistant. Is anyone injured? What type of vehicles are involved?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Mocking streaming fetch for frontend
      const response = await fetch('http://localhost:3000/api/triage/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      }).catch(() => null);

      if (!response || !response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = '';
      
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content_block_delta') {
                assistantMsg += data.delta.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1].content = assistantMsg;
                  return updated;
                });
              }
            } catch (e) {
              // ignore parse errors for partial chunks
            }
          }
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: t('triage.fallback_error') }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md bg-background/90 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(22,33,62,0.5)] border border-white/10 relative z-10">
      
      {/* AI Avatar Header */}
      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-navy/80 to-transparent border-b border-white/5">
        <motion.div 
          className="relative w-16 h-16 flex items-center justify-center"
          animate={{
            scale: isTyping ? [1, 1.1, 1] : 1,
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div 
            className="absolute inset-0 rounded-full border-2 border-safe/30"
            animate={{ rotate: 360, scale: isTyping ? [1, 1.2, 1] : 1 }}
            transition={{ rotate: { duration: 8, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }}
            style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" }}
          />
          <motion.div 
            className="absolute inset-2 rounded-full bg-safe/20 blur-md"
            animate={{ scale: isTyping ? [1, 1.5, 1] : [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="z-10 w-8 h-8 rounded-full bg-safe shadow-[0_0_15px_rgba(46,196,182,0.8)]"></div>
        </motion.div>
        <div className="mt-3 text-safe font-mono text-xs tracking-widest uppercase opacity-80">
          {isTyping ? "Processing Telemetry..." : "System Idle"}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.05 * (idx % 5), type: 'spring', stiffness: 200, damping: 20 }}
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${msg.role === 'user' ? 'bg-amber-600/90 text-white rounded-br-none border border-amber-500/50' : 'bg-navy/80 text-card rounded-bl-none border border-white/10 font-mono text-sm leading-relaxed backdrop-blur-md'}`}>
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
            <div className="bg-navy/80 p-4 rounded-2xl rounded-bl-none flex space-x-2 border border-white/10 backdrop-blur-md">
              <div className="w-2 h-2 bg-safe rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-safe rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-safe rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </motion.div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
      
      <div className="p-4 bg-navy/90 backdrop-blur-xl border-t border-white/10 flex items-center space-x-3">
        <button className="p-3 bg-white/5 rounded-full text-safe hover:bg-safe/20 hover:text-safe transition-colors border border-safe/20">
          <Mic size={20} />
        </button>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t('triage.placeholder')}
          className="flex-1 bg-black/40 text-white rounded-xl px-5 py-3 focus:outline-none focus:ring-1 focus:ring-safe/50 border border-white/5 font-mono text-sm placeholder-gray-500"
        />
        <button 
          onClick={handleSend}
          className="p-3 bg-emergency text-white rounded-xl hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(215,38,56,0.4)]"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSOSStore } from '@/lib/store/sosStore';
import { useChatStore, type AIModel } from '@/lib/store/chatStore';
import ReactMarkdown from 'react-markdown';
import { MessageSquare, X, Send, Bot, Zap, Brain, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const MODEL_CONFIG: Record<AIModel, { label: string; icon: React.ElementType; color: string; description: string }> = {
  claude: { label: 'Claude', icon: Brain, color: '#d97706', description: 'Anthropic — Deep reasoning' },
  gemini: { label: 'Gemini', icon: Zap, color: '#4285f4', description: 'Google — Fast multimodal' },
  gpt: { label: 'ChatGPT', icon: Bot, color: '#10a37f', description: 'OpenAI — Versatile' },
};

const QUICK_ACTIONS = [
  { label: '🏥 Nearest hospital', msg: 'What is the nearest hospital to my location?' },
  { label: '🔥 First aid for burns', msg: 'Give me first aid instructions for burn injuries' },
  { label: '🚨 Report accident', msg: 'How do I report a road accident?' },
  { label: '🚑 Call ambulance', msg: 'What number do I call for an ambulance in India?' },
];

export function ChatWidget() {
  const { isOpen, toggle, close, model, setModel, messages, isStreaming, addMessage, updateLastMessage, setStreaming } = useChatStore();
  const { status: sosStatus, location } = useSOSStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const buildSystemContext = useCallback(() => {
    let ctx = 'You are an emergency response AI assistant for ROADSoS. Provide clear, concise, actionable emergency guidance. Always prioritize life safety. ';
    if (sosStatus === 'active' || sosStatus === 'acknowledged') {
      ctx += `ALERT: User currently has an active SOS emergency. `;
      if (location) ctx += `Their location: ${location.address} (${location.lat}, ${location.lng}). `;
    }
    return ctx;
  }, [sosStatus, location]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    setInput('');

    addMessage({ role: 'user', content: text, model });
    setStreaming(true);
    const assistantMsg = addMessage({ role: 'assistant', content: '', model });
    void assistantMsg;

    try {
      const endpoint = model === 'claude' ? '/api/ai/claude' : model === 'gemini' ? '/api/ai/gemini' : '/api/ai/gpt';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: text }], systemContext: buildSystemContext() }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content ?? parsed.delta?.text ?? parsed.text ?? '';
              accumulated += delta;
              updateLastMessage(accumulated);
            } catch {}
          }
        }
      }
    } catch (err) {
      updateLastMessage(`❌ ${model} unavailable. Trying fallback… (${String(err)})`);
    } finally {
      setStreaming(false);
    }
  }, [isStreaming, model, messages, addMessage, updateLastMessage, setStreaming, buildSystemContext]);

  const cfg = MODEL_CONFIG[model];
  const Icon = cfg.icon;

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white"
        style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)` }}
        aria-label="Open AI Chat Assistant"
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
        {!isOpen && messages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {messages.filter((m) => m.role === 'assistant').length}
          </span>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-44 right-4 z-50 w-[360px] max-h-[520px] flex flex-col rounded-3xl overflow-hidden border border-gray-700 shadow-2xl bg-gray-950"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800" style={{ background: `${cfg.color}22` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: cfg.color }}>
                <Icon size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">Emergency AI</p>
                <p className="text-[11px] text-gray-400">{cfg.description}</p>
              </div>
              <button onClick={close} className="p-1 rounded-lg hover:bg-gray-800">
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Model Tabs */}
            <div className="flex border-b border-gray-800">
              {(Object.entries(MODEL_CONFIG) as [AIModel, typeof MODEL_CONFIG[AIModel]][]).map(([key, c]) => (
                <button
                  key={key}
                  onClick={() => setModel(key)}
                  className={cn(
                    'flex-1 py-2 text-xs font-semibold transition-colors',
                    model === key ? 'text-white border-b-2' : 'text-gray-500 hover:text-gray-300'
                  )}
                  style={model === key ? { borderBottomColor: c.color, color: c.color } : undefined}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: `${cfg.color}33` }}>
                    <Icon size={26} style={{ color: cfg.color }} />
                  </div>
                  <p className="text-gray-400 text-sm">Ask me anything about emergency response, first aid, or safety.</p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {QUICK_ACTIONS.map((qa) => (
                      <button
                        key={qa.label}
                        onClick={() => sendMessage(qa.msg)}
                        className="text-[11px] px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl border border-gray-700 transition-colors"
                      >
                        {qa.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-gray-700 text-white rounded-br-sm'
                        : 'bg-gray-900 text-gray-100 rounded-bl-sm border border-gray-800'
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[]}>{msg.content || '…'}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {isStreaming && (
                <div className="flex justify-start">
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-gray-400"
                        animate={{ scale: [0.5, 1, 0.5], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick actions if chat started */}
            {messages.length > 0 && (
              <div className="px-3 pb-1 flex gap-1.5 overflow-x-auto no-scrollbar">
                {QUICK_ACTIONS.slice(0, 2).map((qa) => (
                  <button
                    key={qa.label}
                    onClick={() => sendMessage(qa.msg)}
                    className="shrink-0 text-[10px] px-2 py-1 bg-gray-800 text-gray-300 rounded-lg border border-gray-700"
                  >
                    {qa.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2 p-3 border-t border-gray-800">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder="Ask about emergency..."
                className="flex-1 bg-gray-900 border border-gray-700 text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-gray-500 placeholder:text-gray-500"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
                style={{ background: cfg.color }}
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

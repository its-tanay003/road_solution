'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useChatStore, type AIModel } from '@/lib/store/chatStore';
import { useSOSStore } from '@/lib/store/sosStore';
import ReactMarkdown from 'react-markdown';
import { Send, Trash2, Brain, Zap, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeaderControls } from '@/components/nav/HeaderControls';
import { useTranslation } from 'react-i18next';

const MODEL_CONFIG: Record<AIModel, { label: string; icon: React.ElementType; activeCls: string; btnCls: string }> = {
  claude: { label: 'Claude',  icon: Brain, activeCls: 'text-amber-500 border-amber-500', btnCls: 'bg-amber-600 hover:bg-amber-700' },
  gemini: { label: 'Gemini',  icon: Zap,   activeCls: 'text-blue-400  border-blue-400',  btnCls: 'bg-blue-500  hover:bg-blue-600'  },
  gpt:    { label: 'ChatGPT', icon: Bot,    activeCls: 'text-emerald-400 border-emerald-400', btnCls: 'bg-emerald-500 hover:bg-emerald-600' },
};

export default function ChatPage() {
  const { t } = useTranslation();
  const { model, setModel, messages, isStreaming, addMessage, updateLastMessage, setStreaming, clearHistory } = useChatStore();
  const { status: sosStatus, location } = useSOSStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isStreaming]);

  const buildContext = useCallback(() => {
    let ctx = 'Emergency response AI assistant. Be concise and helpful. ';
    if (sosStatus === 'active') ctx += `ACTIVE SOS: ${location?.address ?? 'Location unknown'}. `;
    return ctx;
  }, [sosStatus, location]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    setInput('');
    addMessage({ role: 'user', content: text, model });
    setStreaming(true);
    addMessage({ role: 'assistant', content: '', model });

    // Inject profile + location context when SOS is active
    let finalContent = text;
    if (sosStatus === 'active' || sosStatus === 'acknowledged') {
      let ctx = '';
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('roadsos-profile');
        if (saved) {
          try {
            const p = JSON.parse(saved);
            ctx += `[ACTIVE EMERGENCY — Blood Group: ${p.bloodGroup || 'Unknown'}, Conditions: ${p.conditions || 'None'}] `;
          } catch {}
        }
      }
      if (location) ctx += `[GPS: ${location.lat}, ${location.lng} — ${location.address || 'Unknown'}] `;
      if (ctx) finalContent = `${ctx}\nUser Query: ${text}`;
    }

    try {
      const endpoint = `/api/ai/${model}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: finalContent }], systemContext: buildContext() }),
      });

      if (!res.body) throw new Error('No response body');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            try {
              const p = JSON.parse(data);
              const delta = p.choices?.[0]?.delta?.content ?? p.delta?.text ?? p.text ?? '';
              acc += delta;
              updateLastMessage(acc);
            } catch {}
          }
        }
      }
    } catch (e) {
      updateLastMessage(`❌ ${String(e)} — Please try another model.`);
    } finally {
      setStreaming(false);
    }
  }, [isStreaming, model, messages, addMessage, updateLastMessage, setStreaming, buildContext, sosStatus, location]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white pb-16">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-14 pb-3 border-b border-gray-800 shrink-0">
        <div className="flex-1">
          <h1 className="font-black text-lg text-white">{t('chat.title', 'AI Emergency Assistant')}</h1>
          <p className="text-xs text-gray-500">{t('chat.desc', 'Claude · Gemini · ChatGPT')}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <HeaderControls />
          <button onClick={clearHistory} className="p-2 rounded-xl bg-gray-900 border border-gray-700 hover:bg-gray-800 transition-colors" aria-label="Clear history">
            <Trash2 size={15} className="text-gray-400" />
          </button>
        </div>
      </header>

      {/* Model tabs */}
      <div className="flex border-b border-gray-800 shrink-0">
        {(Object.entries(MODEL_CONFIG) as [AIModel, typeof MODEL_CONFIG[AIModel]][]).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => setModel(key)}
              aria-label={`Switch to ${cfg.label}`}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors border-b-2',
                model === key ? cfg.activeCls : 'border-transparent text-gray-500 hover:text-gray-300'
              )}
            >
              <Icon size={13} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-4">
            <p className="text-gray-400 text-sm">{t('chat.placeholder', 'Ask about first aid, emergencies, or safety tips.')}</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'chat.sugCpr', def: 'How do I perform CPR on an adult?' },
                { key: 'chat.sugStroke', def: 'What should I do if someone is having a stroke?' },
                { key: 'chat.sugSnake', def: 'First aid for snake bite?' },
                { key: 'chat.sugBleeding', def: 'How to stop severe bleeding?' },
                { key: 'chat.sugHeart', def: 'Signs of a heart attack' },
                { key: 'chat.sugAccident', def: 'What to do after a road accident' }
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => send(t(s.key, s.def))}
                  className="text-xs px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-300 text-left hover:bg-gray-800 transition-colors"
                >
                  {t(s.key, s.def)}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-gray-700 text-white rounded-br-sm'
                  : 'bg-gray-900 text-gray-100 rounded-bl-sm border border-gray-800'
              )}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-li:my-0">
                  <ReactMarkdown>{msg.content || '…'}</ReactMarkdown>
                </div>
              ) : msg.content}
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-gray-400"
                  animate={{ scale: [0.5, 1, 0.5] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-800 shrink-0 bg-gray-950">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.inputPlaceholder', 'Ask about emergency response…')}
            className="flex-1 bg-gray-900 border border-gray-700 text-white text-sm rounded-2xl px-4 py-3 outline-none focus:border-gray-500 placeholder:text-gray-500 resize-none max-h-[120px]"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || isStreaming}
            aria-label="Send message"
            className={cn(
              'w-11 h-11 rounded-2xl flex items-center justify-center text-white disabled:opacity-30 shrink-0 transition-colors',
              MODEL_CONFIG[model].btnCls,
            )}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

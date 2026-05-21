'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, Bot, User, ActivitySquare, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Mock medical profile (normally from session / Supabase profile)
const MOCK_MEDICAL_PROFILE = {
  bloodGroup: 'O Negative',
  conditions: ['Asthma', 'Type 2 Diabetes'],
  allergies: ['Penicillin'],
  medications: ['Metformin', 'Albuterol Inhaler'],
};

const INITIAL_MESSAGE: Message = {
  id: 'init',
  role: 'assistant',
  content:
    "I am your **AI First-Aid Triage Assistant**. Describe the symptoms or injury and I'll give you immediate steps tailored to your medical profile *(Asthma, Diabetes, O− blood group)*.",
};

let idCounter = 0;
function uid() {
  return `msg-${Date.now()}-${idCounter++}`;
}

export function TriageChat() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize or translate first message when t changes
  useEffect(() => {
    setMessages((prev) => {
      const welcomeContent = t(
        'emergency.triageWelcome',
        "I am your **AI First-Aid Triage Assistant**. Describe the symptoms or injury and I'll give you immediate steps tailored to your medical profile *(Asthma, Diabetes, O− blood group)*."
      );
      if (prev.length === 0) {
        return [{ id: 'init', role: 'assistant', content: welcomeContent }];
      }
      return prev.map((m) =>
        m.id === 'init' ? { ...m, content: welcomeContent } : m
      );
    });
  }, [t]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: uid(), role: 'user', content: text };
    const assistantId = uid();
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '' };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicalProfile: MOCK_MEDICAL_PROFILE,
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: text },
          ],
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`API error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `_${t('emergency.chatError', 'Sorry, I encountered an error. Please try again.')}_` }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-gray-900 border border-red-500/30 rounded-2xl overflow-hidden flex flex-col h-[400px] shadow-[0_0_20px_rgba(220,38,38,0.1)]">
      {/* Header */}
      <div className="bg-red-950/40 border-b border-red-500/20 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ActivitySquare size={16} className="text-red-400" />
          <h2 className="font-bold text-white text-sm tracking-wide">{t('emergency.triageTitle', 'AI Triage Assistant')}</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          <span className="text-[9px] text-red-300 font-bold uppercase tracking-widest">{t('emergency.profileActive', 'Profile Active')}</span>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-3 mt-2 flex items-center gap-2 bg-yellow-900/30 border border-yellow-700/50 rounded-xl px-3 py-2 text-yellow-300 text-xs shrink-0">
          <AlertTriangle size={12} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar" ref={scrollRef}>
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/30 mt-0.5">
                <Bot size={13} className="text-red-400" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-gray-800 text-gray-200 rounded-tl-sm border border-gray-700'
              }`}
            >
              {m.role === 'assistant' ? (
                <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-li:my-0.5 prose-ul:my-1">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.content || '…'}
                  </ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30 mt-0.5">
                <User size={13} className="text-blue-400" />
              </div>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content === '' && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/30">
              <Bot size={13} className="text-red-400" />
            </div>
            <div className="bg-gray-800 rounded-2xl rounded-tl-sm border border-gray-700 px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-gray-950 border-t border-gray-800 shrink-0">
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('emergency.placeholder', 'Describe the emergency (e.g. severe bleeding)…')}
            disabled={isLoading}
            className="w-full bg-gray-900 border border-gray-800 rounded-full pl-4 pr-12 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 transition-colors disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={13} className="ml-0.5" />
          </button>
        </div>
      </form>
    </div>
  );
}

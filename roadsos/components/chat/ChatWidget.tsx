'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSOSStore } from '@/lib/store/sosStore';
import { useChatStore, type AIModel } from '@/lib/store/chatStore';
import ReactMarkdown from 'react-markdown';
import { MessageSquare, X, Send, Bot, Zap, Brain, Mic, MicOff, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const MODEL_CHAIN: AIModel[] = ['claude', 'gemini', 'gpt'];

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
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const { isOpen, toggle, close, model, setModel, messages, isStreaming, addMessage, updateLastMessage, setStreaming } = useChatStore();
  const { status: sosStatus, location } = useSOSStore();
  const [input, setInput] = useState('');
  const [activeFallbackMsg, setActiveFallbackMsg] = useState<string | null>(null);

  // Gemini Live State
  const [isLiveSession, setIsLiveSession] = useState(false);
  const [liveStatus, setLiveStatus] = useState<'listening' | 'thinking' | 'speaking' | 'interrupted'>('listening');
  const [liveUserTranscript, setLiveUserTranscript] = useState('');
  const [liveAiTranscript, setLiveAiTranscript] = useState('');
  const [liveMicActive, setLiveMicActive] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const animationIdRef = useRef<number | null>(null);
  const liveStatusRef = useRef(liveStatus);

  useEffect(() => {
    liveStatusRef.current = liveStatus;
  }, [liveStatus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const buildSystemContext = useCallback(() => {
    let ctx = 'You are NEXUS, an emergency response AI assistant for ROADSoS. Provide clear, concise, actionable emergency guidance. Always prioritize life safety. Keep instructions bulleted if possible for high readability. ';
    
    // Inject active profile info
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('roadsos-profile');
      if (saved) {
        try {
          const profile = JSON.parse(saved);
          ctx += `User Details: Name: ${profile.name || 'Unknown'}, Phone: ${profile.phone || 'Unknown'}, Blood Group: ${profile.bloodGroup || 'Unknown'}, Conditions: ${profile.conditions || 'None'}. `;
        } catch {}
      }
    }

    if (sosStatus === 'active' || sosStatus === 'acknowledged') {
      ctx += `ALERT: User currently has an active SOS emergency. `;
      if (location) ctx += `Their current GPS coordinates: ${location.lat}, ${location.lng}. Resolved Address: ${location.address}. `;
    }
    return ctx;
  }, [sosStatus, location]);

  // Fallback chain enabled text-chat dispatcher
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    setInput('');

    addMessage({ role: 'user', content: text, model });
    setStreaming(true);
    const assistantMsg = addMessage({ role: 'assistant', content: '', model });
    void assistantMsg;

    let currentModelIndex = MODEL_CHAIN.indexOf(model);
    if (currentModelIndex === -1) currentModelIndex = 0;

    let success = false;
    let attempts = 0;
    const maxAttempts = MODEL_CHAIN.length;

    // Prepare messages payload
    const baseMessages = messages.map(m => ({ role: m.role, content: m.content }));
    
    // Inject active profile + location if SOS is active
    let finalUserContent = text;
    if (sosStatus === 'active' || sosStatus === 'acknowledged') {
      let extraInfo = '';
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('roadsos-profile');
        if (saved) {
          try {
            const profile = JSON.parse(saved);
            extraInfo += `[ACTIVE EMERGENCY - Blood Group: ${profile.bloodGroup || 'Unknown'}, Conditions: ${profile.conditions || 'None'}, Contacts: ${profile.emergencyContacts?.map((c: any) => `${c.name} (${c.phone})`).join(', ') || 'None'}] `;
          } catch {}
        }
      }
      if (location) {
        extraInfo += `[User Location: Lat ${location.lat}, Lng ${location.lng}, Address: ${location.address || 'Unknown'}] `;
      }
      if (extraInfo) {
        finalUserContent = `${extraInfo}\nUser Query: ${text}`;
      }
    }

    const messagesPayload = [...baseMessages, { role: 'user', content: finalUserContent }];

    while (!success && attempts < maxAttempts) {
      const activeModel = MODEL_CHAIN[(currentModelIndex + attempts) % MODEL_CHAIN.length];
      
      if (attempts > 0) {
        const fallbackNote = `⚠️ Primary model failed. Swapping to fallback: ${MODEL_CONFIG[activeModel].label}...`;
        setActiveFallbackMsg(fallbackNote);
        updateLastMessage(fallbackNote);
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      try {
        const endpoint = activeModel === 'claude' ? '/api/ai/claude' : activeModel === 'gemini' ? '/api/ai/gemini' : '/api/ai/gpt';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messagesPayload,
            systemContext: buildSystemContext()
          }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        setActiveFallbackMsg(null);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
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
        
        success = true;
        if (activeModel !== model) {
          setModel(activeModel);
        }
      } catch (err) {
        console.warn(`Model ${activeModel} failed:`, err);
        attempts++;
        if (attempts >= maxAttempts) {
          updateLastMessage(`❌ Service temporarily unavailable. All emergency AI channels are offline. Please call 112 directly.`);
          setActiveFallbackMsg(null);
        }
      }
    }
    setStreaming(false);
  }, [isStreaming, model, messages, addMessage, updateLastMessage, setStreaming, setModel, buildSystemContext]);

  // Handle Voice Synthesis for Live Mode
  const speakLiveResponse = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Turn off recognition while AI speaks to prevent audio feedback loop
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    window.speechSynthesis.cancel();
    setLiveStatus('speaking');
    setLiveAiTranscript(text);

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.05;
    utter.lang = i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'gu' ? 'gu-IN' : 'en-US';

    utter.onend = () => {
      setLiveStatus('listening');
      if (recognitionRef.current && liveMicActive) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    };

    utter.onerror = () => {
      setLiveStatus('listening');
      if (recognitionRef.current && liveMicActive) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    };

    window.speechSynthesis.speak(utter);
  }, [i18n.language, liveMicActive]);

  // Dispatch Live Session User Input
  const dispatchLivePrompt = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setLiveStatus('thinking');

    // Inject location & profile context into Gemini Live query if SOS is active
    let finalLivePrompt = text;
    if (sosStatus === 'active' || sosStatus === 'acknowledged') {
      let extraInfo = '';
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('roadsos-profile');
        if (saved) {
          try {
            const profile = JSON.parse(saved);
            extraInfo += `[ACTIVE EMERGENCY - Blood Group: ${profile.bloodGroup || 'Unknown'}, Conditions: ${profile.conditions || 'None'}] `;
          } catch {}
        }
      }
      if (location) {
        extraInfo += `[User GPS Coordinates: lat ${location.lat}, lng ${location.lng}] `;
      }
      if (extraInfo) {
        finalLivePrompt = `${extraInfo}\nUser voice query: ${text}`;
      }
    }
    
    try {
      const response = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: finalLivePrompt }],
          systemContext: buildSystemContext() + " Answer in ONE or TWO short sentences maximum for live voice response."
        }),
      });

      if (!response.ok) throw new Error('Failed response');
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content ?? parsed.delta?.text ?? parsed.text ?? '';
              accumulated += delta;
            } catch {}
          }
        }
      }
      speakLiveResponse(accumulated);
    } catch {
      speakLiveResponse("Connection glitch. Please repeat that or tap call help.");
    }
  }, [buildSystemContext, speakLiveResponse]);

  // Speech Recognition Setup for Gemini Live
  useEffect(() => {
    if (!isLiveSession) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      return;
    }

    const w = window as any;
    const SpeechRecognitionClass = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    const rec = new SpeechRecognitionClass();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'gu' ? 'gu-IN' : 'en-US';

    rec.onstart = () => {
      setLiveStatus('listening');
    };

    rec.onresult = (e: any) => {
      const latest = e.results[e.results.length - 1];
      const text = latest[0].transcript;
      setLiveUserTranscript(text);

      // INTERRUPTION DETECTED: If user speaks while AI is talking, cancel instantly
      if (liveStatusRef.current === 'speaking' && text.trim().length > 1) {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        setLiveStatus('interrupted');
        setTimeout(() => setLiveStatus('listening'), 300);
      }

      if (latest.isFinal && text.trim()) {
        void dispatchLivePrompt(text);
        setLiveUserTranscript('');
      }
    };

    rec.onerror = (err: any) => {
      console.warn('Speech recognition error:', err);
    };

    rec.onend = () => {
      // Re-arm automatically if active and listening
      if (liveStatusRef.current === 'listening' && liveMicActive) {
        try {
          rec.start();
        } catch {}
      }
    };

    recognitionRef.current = rec;
    if (liveMicActive) {
      try {
        rec.start();
      } catch {}
    }

    return () => {
      try {
        rec.stop();
      } catch {}
    };
  }, [isLiveSession, liveMicActive, i18n.language, dispatchLivePrompt]);

  // Sine Wave Canvas Animation
  useEffect(() => {
    if (!isLiveSession || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw elegant dark-grid background lines
      ctx.strokeStyle = 'rgba(31,41,55,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Configure waves according to status
      const waveCount = 3;
      let amplitude = 12;
      let speed = 0.08;
      let color = '59, 130, 246'; // blue default (Gemini)

      if (liveStatus === 'listening') {
        amplitude = 10;
        speed = 0.05;
        color = '59, 130, 246'; // pulsing blue
      } else if (liveStatus === 'thinking') {
        amplitude = 6;
        speed = 0.18;
        color = '245, 158, 11'; // rapid gold
      } else if (liveStatus === 'speaking') {
        amplitude = 22;
        speed = 0.12;
        color = '16, 185, 129'; // emerald speaking waves
      } else if (liveStatus === 'interrupted') {
        amplitude = 2;
        speed = 0.02;
        color = '239, 68, 68'; // crimson flatline
      }

      phase += speed;

      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const o = w * (Math.PI / 3.5);
        ctx.strokeStyle = `rgba(${color}, ${0.8 - w * 0.25})`;
        ctx.lineWidth = 3 - w * 0.8;

        for (let x = 0; x < width; x++) {
          const progress = x / width;
          // Apply standard Hanning window envelope to taper ends smoothly
          const envelope = Math.sin(progress * Math.PI);
          const y = centerY + Math.sin(progress * Math.PI * 2.5 + phase + o) * amplitude * envelope;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      animationIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, [isLiveSession, liveStatus]);

  const toggleMic = () => {
    const nextMic = !liveMicActive;
    setLiveMicActive(nextMic);
    if (!nextMic && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setLiveStatus('listening');
    } else if (nextMic && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
  };

  const handleStartLive = () => {
    setIsLiveSession(true);
    setLiveAiTranscript('');
    setLiveUserTranscript('');
    setLiveStatus('listening');
    setTimeout(() => {
      speakLiveResponse("Welcome to NEXUS Live stream. Speak now, I am listening.");
    }, 200);
  };

  const handleEndLive = () => {
    setIsLiveSession(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const cfg = MODEL_CONFIG[model];
  const Icon = cfg.icon;

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'fixed bottom-24 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white',
          isRtl ? 'left-4' : 'right-4',
          model === 'claude' && 'bg-linear-to-br from-amber-600 to-amber-800',
          model === 'gemini' && 'bg-linear-to-br from-blue-500 to-blue-700',
          model === 'gpt'    && 'bg-linear-to-br from-emerald-500 to-emerald-700',
        )}
        aria-label={isOpen ? 'Close AI Chat Assistant' : 'Open AI Chat Assistant'}
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
            className={cn(
              'fixed bottom-44 z-50 w-[360px] h-[520px] max-h-[85vh] flex flex-col rounded-3xl overflow-hidden border border-gray-700 shadow-2xl bg-gray-950',
              isRtl ? 'left-4' : 'right-4'
            )}
          >
            {/* Header */}
            <div className={cn(
              'flex items-center gap-3 px-4 py-3 border-b border-gray-800 shrink-0',
              model === 'claude' && 'bg-amber-950/30',
              model === 'gemini' && 'bg-blue-950/30',
              model === 'gpt'    && 'bg-emerald-950/30',
            )}>
              <div className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                model === 'claude' && 'bg-amber-600',
                model === 'gemini' && 'bg-blue-500',
                model === 'gpt'    && 'bg-emerald-500',
              )}>
                <Icon size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">NEXUS Emergency AI</p>
                <p className="text-[11px] text-gray-400 truncate">{cfg.description}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!isLiveSession && (
                  <button
                    onClick={handleStartLive}
                    title="Start Live Voice Stream"
                    className="p-2 rounded-xl text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                  >
                    <Sparkles size={14} className="animate-pulse" />
                  </button>
                )}
                <button onClick={close} aria-label="Close chat" className="p-2 rounded-xl hover:bg-gray-800 transition-colors">
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Main view router: Text Chat OR Gemini Live Voice Session */}
            {!isLiveSession ? (
              <>
                {/* Model Tabs */}
                <div className="flex border-b border-gray-800 shrink-0">
                  {(Object.entries(MODEL_CONFIG) as [AIModel, typeof MODEL_CONFIG[AIModel]][]).map(([key, c]) => (
                    <button
                      key={key}
                      onClick={() => setModel(key)}
                      className={cn(
                        'flex-1 py-2 text-xs font-semibold transition-colors',
                        model === key ? 'text-white border-b-2' : 'text-gray-500 hover:text-gray-300'
                      )}
                      style={{ borderBottomColor: model === key ? cfg.color : 'transparent' }}
                      aria-label={`Switch to ${c.label}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center py-6 space-y-4">
                      <div className={cn(
                        'w-14 h-14 rounded-2xl mx-auto flex items-center justify-center',
                        model === 'claude' && 'bg-amber-900/30',
                        model === 'gemini' && 'bg-blue-900/30',
                        model === 'gpt'    && 'bg-emerald-900/30',
                      )}>
                        <Icon size={26} className={cn(
                          model === 'claude' && 'text-amber-500',
                          model === 'gemini' && 'text-blue-400',
                          model === 'gpt'    && 'text-emerald-400',
                        )} />
                      </div>
                      <p className="text-gray-400 text-sm">Ask anything about emergency response, first aid, or safety.</p>
                      
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {QUICK_ACTIONS.map((qa) => (
                          <button
                            key={qa.label}
                            onClick={() => sendMessage(qa.msg)}
                            className="text-[11px] px-2.5 py-1.5 bg-gray-900 hover:bg-gray-850 text-gray-200 rounded-xl border border-gray-800 transition-colors"
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
                          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                          msg.role === 'user'
                            ? 'bg-gray-800 text-white rounded-br-sm border border-gray-700'
                            : 'bg-gray-900 text-gray-100 rounded-bl-sm border border-gray-850'
                        )}
                      >
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-invert prose-sm max-w-none break-words">
                            <ReactMarkdown>{msg.content || '…'}</ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  ))}

                  {isStreaming && (
                    <div className="flex justify-start">
                      <div className="bg-gray-900 border border-gray-850 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1.5 shadow-lg">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cfg.color }}
                            animate={{ scale: [0.5, 1, 0.5], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Quick Action Chips when active */}
                {messages.length > 0 && (
                  <div className="px-3 pb-1.5 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                    {QUICK_ACTIONS.slice(0, 2).map((qa) => (
                      <button
                        key={qa.label}
                        onClick={() => sendMessage(qa.msg)}
                        className="shrink-0 text-[10px] px-2.5 py-1 bg-gray-900 text-gray-300 rounded-lg border border-gray-800"
                      >
                        {qa.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Bar */}
                <div className="flex gap-2 p-3 border-t border-gray-800 shrink-0">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                    placeholder="Ask NEXUS about safety..."
                    className="flex-1 bg-gray-900 border border-gray-800 text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-gray-700 placeholder:text-gray-600 transition-colors"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isStreaming}
                    aria-label="Send message"
                    className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-opacity shrink-0 shadow-md',
                      model === 'claude' && 'bg-amber-600',
                      model === 'gemini' && 'bg-blue-500',
                      model === 'gpt'    && 'bg-emerald-500',
                    )}
                  >
                    <Send size={15} />
                  </button>
                </div>
              </>
            ) : (
              /* Gemini Live Voice Session UI */
              <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-gray-950 to-blue-950/40 relative">
                {/* Close voice session */}
                <button
                  onClick={handleEndLive}
                  className="absolute top-4 right-4 bg-gray-900/60 text-gray-400 hover:text-white border border-gray-800 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur transition-all"
                >
                  Exit Voice
                </button>

                {/* Status Indicator */}
                <div className="text-center pt-4">
                  <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest text-blue-400">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
                    Gemini Live
                  </div>
                  <h3 className="text-white font-black text-xl tracking-tight mt-2.5">NEXUS Voice Active</h3>
                  <p className="text-gray-400 text-[11px] mt-1 uppercase tracking-wider font-semibold">
                    {liveStatus === 'listening' && '🎤 Listening for voice...'}
                    {liveStatus === 'thinking' && '⚡ NEXUS is processing...'}
                    {liveStatus === 'speaking' && '🔊 NEXUS Speaking'}
                    {liveStatus === 'interrupted' && '🛑 Interrupted'}
                  </p>
                </div>

                {/* Audio Wave Visualizer */}
                <div className="flex-1 flex items-center justify-center py-4 min-h-0">
                  <canvas ref={canvasRef} width={280} height={140} className="w-full max-w-[280px] bg-black/10 rounded-2xl" />
                </div>

                {/* Real-time transcriptions */}
                <div className="space-y-3 bg-black/40 border border-gray-850 rounded-2xl p-4 min-h-[100px] max-h-[140px] overflow-y-auto shadow-inner">
                  {liveUserTranscript && (
                    <div className="text-blue-400 text-xs font-semibold">
                      <span className="text-[10px] text-gray-500 block uppercase">You</span>
                      &ldquo;{liveUserTranscript}&rdquo;
                    </div>
                  )}
                  {liveAiTranscript && (
                    <div className="text-gray-200 text-xs leading-relaxed">
                      <span className="text-[10px] text-gray-500 block uppercase">NEXUS</span>
                      {liveAiTranscript}
                    </div>
                  )}
                  {!liveUserTranscript && !liveAiTranscript && (
                    <p className="text-gray-500 text-[11px] text-center italic mt-4">Start speaking anytime. NEXUS will reply and stop talking if you interrupt.</p>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-900 shrink-0">
                  <button
                    onClick={toggleMic}
                    style={{ backgroundColor: liveMicActive ? '#1e293b' : '#dc2626' }}
                    className="w-12 h-12 rounded-full flex items-center justify-center border border-gray-800 text-white shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    {liveMicActive ? <Mic size={18} /> : <MicOff size={18} />}
                  </button>
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

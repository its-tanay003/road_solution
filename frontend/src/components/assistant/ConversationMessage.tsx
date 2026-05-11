import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Bot, 
  CheckCircle, 
  Activity, 
  Stethoscope, 
  Zap,
  Info,
  ShieldAlert,
  Heart,
  Fingerprint,
  ShieldCheck,
  Search
} from 'lucide-react';
import type { Message, MedicalData } from '../../store/aiAssistantStore';
import { ttsQueue } from '../../utils/ttsQueue';
import { useAccessibilityStore } from '../../store/accessibilityStore';

interface ConversationMessageProps {
  message: Message;
  isLatest: boolean;
}

const MedicalReport: React.FC<{ data: MedicalData, agent: string }> = ({ data, agent }) => {
  const isVision = agent === 'vision';
  const isTriage = agent === 'triage';

  if (isVision) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
          <div className="flex items-center gap-2">
            <Stethoscope size={16} className="text-blue-400" />
            <span className="text-xs font-black uppercase tracking-wider text-blue-400">Visual Diagnosis</span>
          </div>
          <div className={`px-2 py-0.5 rounded text-[10px] font-black ${
            data.estimatedSeverity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
            data.estimatedSeverity === 'SERIOUS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
            'bg-green-500/20 text-green-400 border border-green-500/30'
          }`}>
            SEVERITY: {data.estimatedSeverity || 'UNKNOWN'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <h4 className="text-[10px] font-black text-gray-500 uppercase mb-2">Observed Conditions</h4>
            <ul className="space-y-1">
              {data.observedConditions?.map((inj: string, i: number) => (
                <li key={i} className="text-xs text-gray-200 flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span> {inj}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <h4 className="text-[10px] font-black text-gray-500 uppercase mb-2">Urgency Indicators</h4>
            <ul className="space-y-1">
              {data.urgencyIndicators?.map((risk: string, i: number) => (
                <li key={i} className="text-xs text-red-400 flex items-start gap-2">
                  <ShieldAlert size={12} className="shrink-0 mt-0.5" /> {risk}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-blue-500/5 p-3 rounded-xl border border-blue-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Info size={12} className="text-blue-400" />
            <h4 className="text-[10px] font-black text-blue-400 uppercase">Consciousness: {data.consciousnessLevel}</h4>
          </div>
          <p className="text-sm font-medium text-blue-100 italic">"{data.additionalObservations}"</p>
        </div>
      </div>
    );
  }

  if (isTriage) {
    const severityColors: Record<string, string> = {
      IMMEDIATE: 'bg-red-500/10 border-red-500/50 text-red-200',
      URGENT: 'bg-amber-500/10 border-amber-500/50 text-amber-200',
      DELAYED: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-200',
      MINIMAL: 'bg-green-500/10 border-green-500/50 text-green-200',
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Activity size={16} className="text-amber-400" />
          <span className="text-xs font-black uppercase tracking-wider text-amber-400">Triage Assessment</span>
        </div>
        <div className={`p-4 rounded-2xl border-2 ${severityColors[data.severity || 'MINIMAL'] || severityColors.MINIMAL}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-black tracking-tighter">LEVEL: {data.severity}</span>
            <Zap size={20} className={data.severity === 'IMMEDIATE' ? 'animate-pulse' : ''} />
          </div>
          <div className="bg-black/20 p-2 rounded-lg mb-3 border border-white/5">
            <span className="text-[10px] font-black uppercase text-gray-400">Primary Concerns:</span>
            <p className="text-sm leading-relaxed">{data.primaryConcerns?.join(', ')}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] font-black text-gray-500 uppercase block">Transport</span>
              <span className="text-[11px] font-bold">{data.recommendedUnitType}</span>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[9px] font-black text-gray-500 uppercase block">Deterioration</span>
              <span className="text-[11px] font-bold">{data.estimatedTimeToDeterioration}</span>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <span className="text-[10px] font-black uppercase text-gray-400">Immediate Actions:</span>
            <ul className="space-y-1">
              {data.immediateActions?.map((act: string, i: number) => (
                <li key={i} className="text-xs flex items-center gap-2">
                  <CheckCircle size={10} className="text-white/50" /> {act}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (agent === 'vitals') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Heart size={16} className="text-red-400" />
          <span className="text-xs font-black uppercase tracking-wider text-red-400">Vital Sign Analysis</span>
        </div>
        <div className={`p-4 rounded-2xl border-2 ${
          data.vitalStatus === 'CRITICAL' ? 'bg-red-500/10 border-red-500/50 text-red-200' :
          data.vitalStatus === 'CONCERNING' ? 'bg-amber-500/10 border-amber-500/50 text-amber-200' :
          'bg-green-500/10 border-green-500/50 text-green-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-black tracking-tighter">STATUS: {data.vitalStatus}</span>
            <Activity size={20} className={data.vitalStatus === 'CRITICAL' ? 'animate-pulse' : ''} />
          </div>
          
          <div className="space-y-3">
            {(data.abnormalVitals?.length ?? 0) > 0 && (
              <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                <span className="text-[10px] font-black uppercase text-gray-400">Abnormal Readings:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {data.abnormalVitals?.map((v: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-red-500/20 rounded text-[10px] font-bold text-red-300 border border-red-500/30">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-2">
              <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                <span className="text-[9px] font-black text-gray-500 uppercase block">Possible Conditions</span>
                <span className="text-[11px] font-bold">{data.possibleConditions?.join(', ')}</span>
              </div>
            </div>

            <div className="mt-2 space-y-1">
              <span className="text-[10px] font-black uppercase text-gray-400">Recommendations:</span>
              <ul className="space-y-1">
                {data.recommendations?.map((rec: string, i: number) => (
                  <li key={i} className="text-xs flex items-center gap-2">
                    <div className="w-1 h-1 bg-white/50 rounded-full" /> {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (agent === 'identity') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Fingerprint size={16} className="text-blue-400" />
          <span className="text-xs font-black uppercase tracking-wider text-blue-400">Identity Verification</span>
        </div>
        <div className={`p-4 rounded-2xl border-2 ${
          data.status === 'CONFIRMED' ? 'bg-blue-500/10 border-blue-500/50 text-blue-200' : 'bg-slate-800/40 border-slate-700 text-slate-300'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-black tracking-widest uppercase">{data.status}</span>
            {data.status === 'CONFIRMED' ? <ShieldCheck size={20} /> : <Search size={20} />}
          </div>
          <p className="text-sm font-medium">{data.identityDetails}</p>
          {data.confidence && (
            <div className="mt-2 h-1 w-full bg-black/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${data.confidence * 100}%` }}
                className="h-full bg-blue-500"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return <pre className="text-xs opacity-50 bg-black/50 p-3 rounded-lg overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>;
};

export const ConversationMessage: React.FC<ConversationMessageProps> = ({ message, isLatest }) => {
  const isUser = message.role === 'user';
  
  const structuredData = useMemo(() => {
    if (isUser) return null;
    try {
      const trimmed = message.content.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        return JSON.parse(trimmed);
      }
      return null;
    } catch {
      return null;
    }
  }, [message.content, isUser]);

  const [displayedText, setDisplayedText] = useState(() => {
    if (isUser || !isLatest || structuredData) return message.content;
    return '';
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const { language, ttsEnabled } = useAccessibilityStore();

  const handleSpeak = useCallback(() => {
    if (isPlaying) {
      ttsQueue.stop();
      setIsPlaying(false);
    } else {
      let textToSpeak = message.content;
      if (structuredData) {
        if (structuredData.additionalObservations) textToSpeak = structuredData.additionalObservations;
        else if (structuredData.primaryConcerns) textToSpeak = `Triage Level ${structuredData.severity}. Concerns: ${structuredData.primaryConcerns.join(', ')}`;
        else textToSpeak = "Medical report update received.";
      }
      
      ttsQueue.speak(textToSpeak, language);
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), textToSpeak.length * 80); 
    }
  }, [isPlaying, message.content, structuredData, language]);

  useEffect(() => {
    if (!isUser && message.content && isLatest && !structuredData && displayedText.length < message.content.length) {
      let index = displayedText.length;
      const interval = setInterval(() => {
        setDisplayedText((prev) => {
          if (index < message.content.length) {
            const nextChar = message.content[index];
            index++;
            return prev + nextChar;
          }
          clearInterval(interval);
          if (ttsEnabled) handleSpeak();
          return prev;
        });
      }, 20);
      return () => clearInterval(interval);
    }
  }, [message.content, isUser, isLatest, ttsEnabled, structuredData, handleSpeak, displayedText.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 w-full px-2`}
    >
      <div className={`max-w-[92%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && message.agent && (
          <div className="flex items-center gap-2 mb-2 ml-1">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
              <Bot size={10} className="text-blue-400" />
              <span className="text-blue-400 text-[10px] font-black tracking-wider uppercase">
                {message.agent} AI
              </span>
            </div>
            {message.processingTime && (
              <span className="text-[10px] text-gray-500 font-medium">
                {message.processingTime}s
              </span>
            )}
          </div>
        )}

        <div
          className={`relative p-px rounded-2xl overflow-hidden shadow-2xl ${
            isUser ? '' : 'bg-linear-to-br from-blue-600/50 via-slate-800/40 to-blue-600/50'
          }`}
        >
          <div
            className={`relative p-4 rounded-[15px] ${
              isUser
                ? 'bg-slate-800 text-gray-100 rounded-tr-none border border-slate-700 shadow-xl'
                : 'bg-[#0F172A] text-gray-100 rounded-tl-none border border-white/5'
            }`}
          >
            {structuredData ? (
              <MedicalReport data={structuredData} agent={message.agent || 'orchestrator'} />
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap relative z-10">{displayedText}</p>
            )}

            <div className="flex items-center justify-between mt-4 gap-4 relative z-10 border-t border-white/5 pt-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              <div className="flex items-center gap-2">
                {!isUser && (
                  <button
                    onClick={handleSpeak}
                    className={`p-1.5 rounded-full transition-all duration-500 ${
                      isPlaying 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-110' 
                        : 'bg-slate-800/80 text-gray-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {isPlaying ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                )}
                {!isUser && message.confidence && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black">
                    <CheckCircle size={10} />
                    {Math.round(message.confidence * 100)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Accessibility, 
  Settings,
  Mic,
  MicOff,
  Square,
  Send,
  X,
  Stethoscope,
  Share2,
  FileDown,
  MessageSquare,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAIAssistantStore } from '../store/aiAssistantStore';
import type { AgentOutputs } from '../store/aiAssistantStore';
import { useAccessibilityStore } from '../store/accessibilityStore';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useAssistantOrchestrator } from '../hooks/useAssistantOrchestrator';
import { ConversationMessage } from '../components/assistant/ConversationMessage';
import { AgentStatusRow } from '../components/assistant/AgentStatusRow';
import { InputModeSelector } from '../components/assistant/InputModeSelector';
import { CameraAnalysisPanel } from '../components/assistant/CameraAnalysisPanel';
import { FileUploadArea } from '../components/assistant/FileUploadArea';
import { VoiceWaveform } from '../components/assistant/VoiceWaveform';
import { ttsQueue } from '../utils/ttsQueue';
import { socket } from '../lib/socket';
import { generateMedicalReport } from '../utils/ReportGenerator';
import { MedicalExpertPanel } from '../components/medical/MedicalExpertPanel';
import { IncidentFeedbackModal } from '../components/IncidentFeedbackModal';
import { useContinuousLearning } from '../hooks/useContinuousLearning';

const AssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [textInput, setTextInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'expert'>('chat');
  const [showFeedback, setShowFeedback] = useState(false);
interface IncidentSnapshot {
  gForce: number;
  heartRate: number;
  spO2: number;
  movementScore: number;
  timeOfDay: number;
  roadType: number;
}
  const [lastIncidentData, setLastIncidentData] = useState<IncidentSnapshot | null>(null);
  
  // Initialize ML
  useContinuousLearning();
  
  const { 
    conversationHistory, 
    inputMode, 
    isListening, 
    isSpeaking,
    interimTranscript,
    addMessage,
    setInputMode,
    setIsSpeaking,
    updateStreamingText,
    clearStreamingText,
    setAgentOutput,
    agentOutputs,
    addActiveAgent,
    resetIncident
  } = useAIAssistantStore();
  
  const { language: uiLanguage } = useAccessibilityStore();
  const { startRecognition, stopRecognition } = useVoiceAssistant();
  const { sendToAI, incidentId: currentIncidentId } = useAssistantOrchestrator();

  // Socket Listeners & Room Management
  useEffect(() => {
    socket.connect();

    const joinRoom = () => {
      if (currentIncidentId) {
        socket.emit('incident:join', { incidentId: currentIncidentId });
      }
    };

    socket.on('connect', joinRoom);

    socket.on('agent:stream', ({ agentName, text }) => {
      addActiveAgent(agentName);
      updateStreamingText(agentName, text);
    });

    socket.on('agent:update', ({ agentName, data }) => {
      setAgentOutput(agentName as keyof AgentOutputs, data as Record<string, unknown>);
      clearStreamingText(agentName);
      
      // If it's a final response from any main agent, add to conversation
      const importantAgents = ['firstAid', 'orchestrator', 'vision', 'triage'];
      if (importantAgents.includes(agentName)) {
        const agentData = data as Record<string, unknown>;
        const content = typeof data === 'string' 
          ? data 
          : JSON.stringify(data);
        
        addMessage({
          id: `ai-${agentName}-${Date.now()}`,
          role: 'assistant',
          content,
          timestamp: Date.now(),
          agent: agentName
        });
        
        // Trigger TTS for AI response (only for text-heavy agents)
        if (content && (agentName === 'orchestrator' || agentName === 'firstAid')) {
          const ttsText = (typeof data === 'string' ? data : (agentData.summary || agentData.instruction || "Medical report updated.")) as string;
          ttsQueue.speak(ttsText, uiLanguage);
          setIsSpeaking(true);
        }
      }
    });

    return () => {
      socket.off('connect', joinRoom);
      socket.off('agent:stream');
      socket.off('agent:update');
    };
  }, [currentIncidentId, uiLanguage, addActiveAgent, updateStreamingText, clearStreamingText, setAgentOutput, addMessage, setIsSpeaking]);

  const handleDownloadReport = () => {
    generateMedicalReport(currentIncidentId || '', agentOutputs, conversationHistory);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversationHistory, interimTranscript]);

  const handleMicClick = () => {
    if (isListening) {
      stopRecognition();
    } else {
      startRecognition();
    }
  };

  const handleStopSpeaking = () => {
    ttsQueue.stop();
    setIsSpeaking(false);
  };

  const handleSendMessage = () => {
    if (!textInput.trim()) return;
    const content = textInput.trim();
    setTextInput('');
    sendToAI(content);
  };

  const handleReset = () => {
    // Capture data for feedback before resetting
    if (currentIncidentId) {
      setLastIncidentData({
        gForce: Number((agentOutputs.triage as Record<string, unknown>)?.gForce || 4.2),
        heartRate: Number((agentOutputs.triage as Record<string, unknown>)?.heartRate || 95),
        spO2: Number((agentOutputs.triage as Record<string, unknown>)?.spO2 || 96),
        movementScore: 1,
        timeOfDay: new Date().getHours(),
        roadType: 1
      });
      setShowFeedback(true);
    }
    resetIncident();
  };

  const quickActions = [
    "I found an accident",
    "Person is unconscious",
    "Need first aid help",
    "Check my vitals"
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-[#080C14] text-white overflow-hidden font-sans">
      {/* Top Bar */}
      <header className="h-[56px] px-4 flex items-center justify-between border-b border-slate-800 bg-[#080C14]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full transition-colors" title="Go Back">
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-500 leading-none">YIRC</span>
            <span className="text-xs font-bold text-gray-200">AI Assistant</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-slate-900/50 p-1 rounded-full border border-slate-800 shadow-inner">
          <div className="px-3 py-1 bg-green-500 text-black text-[9px] font-black rounded-full uppercase tracking-tighter">Live Analysis</div>
          <div className="px-3 py-1 text-gray-500 text-[9px] font-black rounded-full uppercase tracking-tighter">V4.0-Pro</div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={handleReset}
            className="p-2 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-full transition-colors" 
            title="Reset Incident"
          >
            <RotateCcw size={18} />
          </button>
          <button className="p-2 hover:bg-slate-800 rounded-full text-gray-400" title="Accessibility Options">
            <Accessibility size={18} />
          </button>
          <button className="p-2 hover:bg-slate-800 rounded-full text-gray-400" title="System Settings">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex relative overflow-hidden">
        {/* Sidebar Tabs (Vertical) */}
        <div className="w-14 border-r border-slate-800 flex flex-col items-center py-4 gap-4 bg-[#080C14]">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
            title="Switch to Chat"
          >
            <MessageSquare size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('expert')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'expert' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
            title="Switch to Medical Experts"
          >
            <Stethoscope size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Particle Effect Background (Subtle) */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
          </div>

          {/* Dynamic Panel (Camera or File or Conversation) */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              {inputMode === 'camera' ? (
                <motion.div 
                  key="camera"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 z-10"
                >
                  <CameraAnalysisPanel />
                  <button 
                    onClick={() => setInputMode('voice')}
                    className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-md text-white rounded-full border border-white/10"
                    title="Close Camera Stream"
                  >
                    <X size={20} />
                  </button>
                </motion.div>
              ) : inputMode === 'file' || inputMode === 'photo' || inputMode === 'video' ? (
                <motion.div 
                  key="file"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute inset-0 z-10"
                >
                  <FileUploadArea />
                  <button 
                    onClick={() => setInputMode('voice')}
                    className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-md text-white rounded-full border border-white/10"
                    title="Close File Upload"
                  >
                    <X size={20} />
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Conversation Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 scroll-smooth"
            >
              {conversationHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                    <MessageSquare size={32} />
                  </div>
                  <p className="text-sm font-medium tracking-wide">How can I help you today?</p>
                </div>
              )}
              
              {conversationHistory.map((msg, idx) => (
                <ConversationMessage 
                  key={msg.id} 
                  message={msg} 
                  isLatest={idx === conversationHistory.length - 1} 
                />
              ))}

              {/* Interim Transcript */}
              {isListening && interimTranscript && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-end mb-4"
                >
                  <div className="bg-slate-800/40 backdrop-blur-sm px-4 py-2 rounded-2xl rounded-tr-none border border-slate-700/50 italic text-gray-400 text-sm">
                    {interimTranscript}...
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Medical Expert Panel Overlay */}
            <AnimatePresence>
              {activeTab === 'expert' && (
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="absolute inset-y-0 right-0 z-40 w-full md:w-[450px]"
                >
                  <MedicalExpertPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Agent Status Bar */}
          <AgentStatusRow />
        </div>
      </main>

      {/* Input Area (Bottom) */}
      <div className="relative bg-[#080C14] border-t border-slate-800/50 pb-8 pt-2">
        {/* Mode Selector */}
        <InputModeSelector />

        <div className="px-6 flex flex-col items-center gap-4">
          {/* Text Input (if active) */}
          {inputMode === 'text' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full relative"
            >
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Describe the emergency..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 pr-16 text-sm focus:outline-none focus:border-[#FF9933] transition-colors resize-none no-scrollbar"
                rows={Math.min(4, Math.max(1, textInput.split('\n').length))}
              />
              <button 
                onClick={handleSendMessage}
                className="absolute right-3 bottom-3 p-3 bg-[#FF9933] text-black rounded-xl hover:bg-[#FFB366] transition-colors"
                title="Send Message"
              >
                <Send size={18} />
              </button>
            </motion.div>
          )}

          {/* Quick Action Chips (Only in Text/Voice) */}
          {(inputMode === 'text' || inputMode === 'voice') && !isListening && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar w-full py-1">
              {quickActions.map(action => (
                <button 
                  key={action}
                  onClick={() => setTextInput(action)}
                  className="px-4 py-1.5 bg-slate-900/50 border border-slate-800 rounded-full text-[10px] font-bold text-gray-400 hover:text-white hover:border-gray-600 transition-all whitespace-nowrap"
                  title={`Quick Action: ${action}`}
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Central Voice Button */}
          <div className="relative flex flex-col items-center justify-center py-2">
            <AnimatePresence>
              {(isListening || isSpeaking) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute -top-12 flex flex-col items-center gap-1"
                >
                  <VoiceWaveform active={true} color={isListening ? '#ef4444' : '#3b82f6'} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isListening ? 'text-red-500' : 'text-blue-500'}`}>
                    {isListening ? 'Listening...' : 'AI Speaking...'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <AnimatePresence>
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"
                  />
                )}
                {isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"
                  />
                )}
              </AnimatePresence>

              <button
                onClick={isSpeaking ? handleStopSpeaking : handleMicClick}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
                  isListening 
                    ? 'bg-red-500 text-white shadow-red-500/40' 
                    : isSpeaking
                    ? 'bg-blue-600 text-white shadow-blue-600/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title={isListening ? "Stop Listening" : isSpeaking ? "Stop Speaking" : "Start Voice Assistant"}
              >
                {isListening ? <MicOff size={32} /> : isSpeaking ? <Square size={32} /> : <Mic size={32} />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls (Floating) */}
        <div className="absolute bottom-10 right-6 flex flex-col gap-3">
          <button className="p-3 bg-slate-900 border border-slate-800 rounded-full text-gray-400 hover:text-white transition-all shadow-lg" title="Share Conversation Summary">
            <Share2 size={20} />
          </button>
          <button 
            onClick={handleDownloadReport}
            className="p-3 bg-slate-900 border border-slate-800 rounded-full text-gray-400 hover:text-white transition-all shadow-lg" 
            title="Download Medical Report PDF"
          >
            <FileDown size={20} />
          </button>
        </div>
      </div>

      {/* Feedback Modal */}
      <IncidentFeedbackModal 
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        incidentId={currentIncidentId || 'DEMO-123'}
        incidentData={lastIncidentData || { gForce: 4.2, heartRate: 95, spO2: 96, movementScore: 1, timeOfDay: 14, roadType: 0 }}
      />
    </div>
  );
};

export default AssistantPage;

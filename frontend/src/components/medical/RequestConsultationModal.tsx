import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Send, 
  Share2, 
  Monitor, 
  User,
  Maximize2,
  PhoneOff
} from 'lucide-react';
import { useAIAssistantStore } from '../../store/aiAssistantStore';
import { socket } from '../../lib/socket';

interface Expert {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
}

interface RequestConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  expert: Expert;
}

export const RequestConsultationModal: React.FC<RequestConsultationModalProps> = ({ isOpen, onClose, expert }) => {
  const [step, setStep] = useState<'connecting' | 'connected'>('connecting');
  const [chatInput, setChatInput] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const { agentOutputs, addMessage, conversationHistory } = useAIAssistantStore();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // step is 'connecting' by default when reopened
      const timer = setTimeout(() => {
        setStep('connected');
        // Initial doctor greeting
        addMessage({
          id: `doc-greeting-${Date.now()}`,
          role: 'assistant',
          content: `Hello, I'm ${expert.name} from ${expert.hospital}. I can see your incident report. How can I assist you right now?`,
          timestamp: Date.now(),
          agent: 'Medical Expert'
        });
      }, 3000);
      return () => {
        clearTimeout(timer);
        setStep('connecting'); // Reset for next time
      };
    }
  }, [isOpen, expert.name, expert.hospital, addMessage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, step]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput.trim();
    setChatInput('');
    
    addMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMsg,
      timestamp: Date.now()
    });

    // Simulate AI response as the doctor
    setTimeout(() => {
      socket.emit('agent:chat', {
        agent: 'doctor_persona',
        text: userMsg,
        context: {
          doctorName: expert.name,
          specialty: expert.specialty,
          triageSummary: agentOutputs.triage
        }
      });
    }, 1000);
  };

  const handleShareTriage = () => {
    const summary = JSON.stringify(agentOutputs.triage || "No triage data available yet.");
    addMessage({
      id: `share-${Date.now()}`,
      role: 'user',
      content: `Sharing current triage summary with ${expert.name}: ${summary}`,
      timestamp: Date.now()
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-[#0F172A] border border-slate-800 w-full max-w-5xl h-[80vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs">
              {expert.name[4]}
            </div>
            <div>
              <h2 className="text-sm font-bold">{expert.name}</h2>
              <div className="flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Secure Medical Link Active</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors" title="Close Consultation">
            <X size={20} />
          </button>
        </div>

        {step === 'connecting' ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                  <Video className="text-blue-500" size={24} />
                </div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black uppercase tracking-tighter mb-1">Connecting to Expert...</h3>
              <p className="text-xs text-slate-500">Establishing encrypted WebRTC tunnel to {expert.hospital}</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Video Feed */}
            <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-linear-to-br from-blue-500/20 via-transparent to-transparent" />
              
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-slate-800 border-2 border-blue-500/50 flex items-center justify-center mb-4 mx-auto overflow-hidden">
                   <User size={64} className="text-slate-700" />
                </div>
                <h4 className="text-lg font-bold text-slate-400">{expert.name}</h4>
                <p className="text-xs text-slate-600 font-medium">Video Feed Encrypted</p>
              </div>

              {/* Self View Overlay */}
              <div className="absolute bottom-6 right-6 w-48 aspect-video bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                  <User size={24} className="text-slate-700" />
                </div>
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/50 backdrop-blur-md rounded text-[8px] font-black uppercase tracking-widest">You (Patient)</div>
              </div>

              {/* Controls Overlay */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl">
                <button 
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`p-3 rounded-xl transition-all ${isMicOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
                  title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
                <button 
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-3 rounded-xl transition-all ${isVideoOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
                  title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
                >
                  {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                </button>
                <button 
                  onClick={handleShareTriage}
                  className="p-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all"
                  title="Share Triage Data"
                >
                  <Share2 size={20} />
                </button>
                <button 
                  className="p-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all"
                  title="Screen Share"
                >
                  <Monitor size={20} />
                </button>
                <div className="w-px h-8 bg-slate-700 mx-1" />
                <button 
                  onClick={onClose}
                  className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-500 transition-all shadow-lg shadow-red-600/20"
                  title="End Consultation"
                >
                  <PhoneOff size={20} />
                </button>
              </div>
            </div>

            {/* Chat Sidebar */}
            <div className="w-full md:w-80 bg-slate-900/50 border-l border-slate-800 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Consultation Chat</span>
                <Maximize2 size={12} className="text-slate-500 cursor-pointer" />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {conversationHistory.filter(m => m.agent === 'Medical Expert' || m.role === 'user').map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[90%] px-3 py-2 rounded-2xl text-xs ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[8px] font-bold text-slate-600 mt-1 uppercase">
                      {msg.role === 'user' ? 'You' : expert.name.split(' ')[1]} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-900/80">
                <div className="relative">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type message..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-4 pr-10 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-400"
                    title="Send Message"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

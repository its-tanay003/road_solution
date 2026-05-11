import React from 'react';

import { Mic, Camera, FileUp, Image, Video, Watch, Type } from 'lucide-react';
import { useAIAssistantStore, type InputMode } from '../../store/aiAssistantStore';

const MODES: { id: InputMode; label: string; icon: any }[] = [
  { id: 'voice', label: 'Voice', icon: Mic },
  { id: 'camera', label: 'Camera', icon: Camera },
  { id: 'file', label: 'File', icon: FileUp },
  { id: 'photo', label: 'Photo', icon: Image },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'wearable', label: 'Wearable', icon: Watch },
  { id: 'text', label: 'Text', icon: Type },
];

export const InputModeSelector: React.FC = () => {
  const { inputMode, setInputMode } = useAIAssistantStore();

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-6 py-4">
      {MODES.map((mode) => {
        const isActive = inputMode === mode.id;
        const Icon = mode.icon;
        
        return (
          <button
            key={mode.id}
            onClick={() => setInputMode(mode.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full shrink-0 transition-all duration-300 ${
              isActive 
                ? 'bg-[#FF9933] text-black font-bold shadow-lg shadow-[#FF9933]/20 scale-105' 
                : 'bg-slate-800/80 text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Icon size={16} />
            <span className="text-xs tracking-tight">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};

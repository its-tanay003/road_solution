import { create } from 'zustand';

interface VoiceState {
  isListening: boolean;
  transcript: string;
  lastCommand: string;
  isOverlayOpen: boolean;
  isCommandMode: boolean;
  commandText: string;
  showGreenFlash: boolean;
  
  setListening: (listening: boolean) => void;
  setTranscript: (transcript: string) => void;
  setLastCommand: (command: string) => void;
  setOverlayOpen: (open: boolean) => void;
  setCommandMode: (active: boolean) => void;
  setCommandText: (text: string) => void;
  setShowGreenFlash: (show: boolean) => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  isListening: false,
  transcript: '',
  lastCommand: '',
  isOverlayOpen: false,
  isCommandMode: false,
  commandText: '',
  showGreenFlash: false,

  setListening: (isListening) => set({ isListening }),
  setTranscript: (transcript) => set({ transcript }),
  setLastCommand: (lastCommand) => set({ lastCommand }),
  setOverlayOpen: (isOverlayOpen) => set({ isOverlayOpen }),
  setCommandMode: (isCommandMode) => set({ isCommandMode }),
  setCommandText: (commandText) => set({ commandText }),
  setShowGreenFlash: (showGreenFlash) => set({ showGreenFlash }),
}));

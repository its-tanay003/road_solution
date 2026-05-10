import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AgentOutputs {
  triage: any | null;
  vision: any | null;
  vitals: any | null;
  firstAid: any | null;
  identity: any | null;
  orchestrator: any | null;
}

export type InputMode = 'text' | 'voice' | 'camera' | 'file' | 'wearable';

interface AIAssistantState {
  agentOutputs: AgentOutputs;
  activeAgents: string[];
  streamingText: Record<string, string>;
  conversationHistory: Message[];
  inputMode: InputMode;
  isListening: boolean;
  isSpeaking: boolean;
  cameraActive: boolean;

  setAgentOutput: (agent: keyof AgentOutputs, data: any) => void;
  addActiveAgent: (agent: string) => void;
  removeActiveAgent: (agent: string) => void;
  updateStreamingText: (agent: string, chunk: string, isFullUpdate?: boolean) => void;
  clearStreamingText: (agent: string) => void;
  addMessage: (message: Message) => void;
  setInputMode: (mode: InputMode) => void;
  setIsListening: (isListening: boolean) => void;
  setIsSpeaking: (isSpeaking: boolean) => void;
  setCameraActive: (cameraActive: boolean) => void;
  resetIncident: () => void;
}

export const useAIAssistantStore = create<AIAssistantState>((set) => ({
  agentOutputs: {
    triage: null,
    vision: null,
    vitals: null,
    firstAid: null,
    identity: null,
    orchestrator: null,
  },
  activeAgents: [],
  streamingText: {},
  conversationHistory: [],
  inputMode: 'text',
  isListening: false,
  isSpeaking: false,
  cameraActive: false,

  setAgentOutput: (agent, data) =>
    set((state) => ({
      agentOutputs: { ...state.agentOutputs, [agent]: data },
      activeAgents: state.activeAgents.filter((a) => a !== agent),
    })),
    
  addActiveAgent: (agent) =>
    set((state) => ({
      activeAgents: state.activeAgents.includes(agent)
        ? state.activeAgents
        : [...state.activeAgents, agent],
    })),

  removeActiveAgent: (agent) =>
    set((state) => ({
      activeAgents: state.activeAgents.filter((a) => a !== agent),
    })),

  updateStreamingText: (agent, chunk, isFullUpdate = false) =>
    set((state) => ({
      streamingText: {
        ...state.streamingText,
        [agent]: isFullUpdate ? chunk : (state.streamingText[agent] || '') + chunk,
      },
    })),

  clearStreamingText: (agent) =>
    set((state) => {
      const newStreamingText = { ...state.streamingText };
      delete newStreamingText[agent];
      return { streamingText: newStreamingText };
    }),

  addMessage: (message) =>
    set((state) => ({
      conversationHistory: [...state.conversationHistory, message],
    })),

  setInputMode: (mode) => set({ inputMode: mode }),
  setIsListening: (isListening) => set({ isListening }),
  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
  setCameraActive: (cameraActive) => set({ cameraActive }),

  resetIncident: () =>
    set({
      agentOutputs: {
        triage: null,
        vision: null,
        vitals: null,
        firstAid: null,
        identity: null,
        orchestrator: null,
      },
      activeAgents: [],
      streamingText: {},
      conversationHistory: [],
      isListening: false,
      isSpeaking: false,
      cameraActive: false,
    }),
}));

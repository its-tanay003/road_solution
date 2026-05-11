import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  agent?: string;
  confidence?: number;
  processingTime?: number;
}

export interface MedicalData {
  estimatedSeverity?: string;
  observedConditions?: string[];
  urgencyIndicators?: string[];
  consciousnessLevel?: string;
  additionalObservations?: string;
  severity?: string;
  primaryConcerns?: string[];
  recommendedUnitType?: string;
  estimatedTimeToDeterioration?: string;
  immediateActions?: string[];
  vitalStatus?: string;
  abnormalVitals?: string[];
  possibleConditions?: string[];
  recommendations?: string[];
  status?: string;
  identityDetails?: string;
  name?: string;
  age?: string;
  bloodGroup?: string;
  medicalHistory?: string[];
  source?: string;
  confidence?: number;
}

export interface AgentOutputs {
  triage: Record<string, unknown> | null;
  vision: Record<string, unknown> | null;
  vitals: Record<string, unknown> | null;
  firstAid: Record<string, unknown> | null;
  identity: Record<string, unknown> | null;
  orchestrator: Record<string, unknown> | null;
}

export type InputMode = 'text' | 'voice' | 'camera' | 'file' | 'photo' | 'video' | 'wearable';
export type AgentStatus = 'idle' | 'running' | 'done' | 'error';

interface AIAssistantState {
  agentOutputs: AgentOutputs;
  activeAgents: string[];
  agentStatuses: Record<string, AgentStatus>;
  streamingText: Record<string, string>;
  conversationHistory: Message[];
  inputMode: InputMode;
  isListening: boolean;
  isSpeaking: boolean;
  cameraActive: boolean;
  interimTranscript: string;
  incidentId: string | null;
  language: string;

  setAgentOutput: (agent: keyof AgentOutputs, data: Record<string, unknown>) => void;
  setAgentStatus: (agent: string, status: AgentStatus) => void;
  addActiveAgent: (agent: string) => void;
  removeActiveAgent: (agent: string) => void;
  updateStreamingText: (agent: string, chunk: string, isFullUpdate?: boolean) => void;
  clearStreamingText: (agent: string) => void;
  addMessage: (message: Message) => void;
  setInputMode: (mode: InputMode) => void;
  setIsListening: (isListening: boolean) => void;
  setIsSpeaking: (isSpeaking: boolean) => void;
  setCameraActive: (cameraActive: boolean) => void;
  setInterimTranscript: (text: string) => void;
  setIncidentId: (id: string | null) => void;
  setLanguage: (language: string) => void;
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
  agentStatuses: {
    triage: 'idle',
    vision: 'idle',
    vitals: 'idle',
    firstAid: 'idle',
    identity: 'idle',
    orchestrator: 'idle',
  },
  streamingText: {},
  conversationHistory: [],
  inputMode: 'voice',
  isListening: false,
  isSpeaking: false,
  cameraActive: false,
  interimTranscript: '',
  incidentId: null,
  language: 'en-US',

  setAgentOutput: (agent, data) =>
    set((state) => ({
      agentOutputs: { ...state.agentOutputs, [agent]: data },
      activeAgents: state.activeAgents.filter((a) => a !== agent),
      agentStatuses: { ...state.agentStatuses, [agent]: 'done' },
    })),

  setAgentStatus: (agent, status) =>
    set((state) => ({
      agentStatuses: { ...state.agentStatuses, [agent]: status },
    })),
    
  addActiveAgent: (agent) =>
    set((state) => ({
      activeAgents: state.activeAgents.includes(agent)
        ? state.activeAgents
        : [...state.activeAgents, agent],
      agentStatuses: { ...state.agentStatuses, [agent]: 'running' },
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
  setInterimTranscript: (text) => set({ interimTranscript: text }),
  setIncidentId: (id) => set({ incidentId: id }),
  setLanguage: (language: string) => set({ language }),

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
      agentStatuses: {
        triage: 'idle',
        vision: 'idle',
        vitals: 'idle',
        firstAid: 'idle',
        identity: 'idle',
        orchestrator: 'idle',
      },
      streamingText: {},
      conversationHistory: [],
      isListening: false,
      isSpeaking: false,
      cameraActive: false,
      interimTranscript: '',
      incidentId: null,
      language: 'en-US',
    }),
}));

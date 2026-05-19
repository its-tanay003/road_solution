import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export type AIModel = 'claude' | 'gemini' | 'gpt';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model: AIModel;
  timestamp: number;
}

interface ChatState {
  isOpen: boolean;
  model: AIModel;
  messages: ChatMessage[];
  isStreaming: boolean;
  toggle: () => void;
  close: () => void;
  setModel: (m: AIModel) => void;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  updateLastMessage: (content: string) => void;
  setStreaming: (v: boolean) => void;
  clearHistory: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      model: 'claude',
      messages: [],
      isStreaming: false,

      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      close: () => set({ isOpen: false }),
      setModel: (model) => set({ model }),

      addMessage: (msg) => {
        const message: ChatMessage = { ...msg, id: nanoid(), timestamp: Date.now() };
        set((s) => ({ messages: [...s.messages, message] }));
        return message;
      },

      updateLastMessage: (content) =>
        set((s) => {
          const messages = [...s.messages];
          const last = messages[messages.length - 1];
          if (last?.role === 'assistant') {
            messages[messages.length - 1] = { ...last, content };
          }
          return { messages };
        }),

      setStreaming: (isStreaming) => set({ isStreaming }),

      clearHistory: () => set({ messages: [] }),
    }),
    {
      name: 'roadsos-chat',
      partialize: (s) => ({ messages: s.messages.slice(-50), model: s.model }),
    }
  )
);

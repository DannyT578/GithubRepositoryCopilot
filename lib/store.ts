import { create } from 'zustand';
import type { GitHubUser } from './api';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: Date;
}

export interface Source {
  type: 'code' | 'issue' | 'discussion';
  file?: string;
  lineStart?: number;
  lineEnd?: number;
  title?: string;
  url?: string;
  snippet?: string;
}

export interface Repository {
  url: string;
  name: string;
  owner: string;
  description?: string;
  stars?: number;
  forks?: number;
  language?: string;
  lastUpdated?: string;
  fileTree?: FileNode[];
}

export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
}

interface AppState {
  // Auth
  user: GitHubUser | null;
  authChecked: boolean;
  setUser: (user: GitHubUser | null) => void;
  setAuthChecked: (checked: boolean) => void;

  // AI model + keys
  chatModel: string;
  setChatModel: (model: string) => void;
  chatApiKey: string;
  setChatApiKey: (key: string) => void;
  embedApiKey: string;  // only needed for Anthropic (uses OpenAI embeddings)
  setEmbedApiKey: (key: string) => void;

  // Repository
  repository: Repository | null;
  messages: Message[];
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  setRepository: (repo: Repository) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setIsLoading: (loading: boolean) => void;
  setIsProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  clearChat: () => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  user: null,
  authChecked: false,
  setUser: (user) => set({ user }),
  setAuthChecked: (authChecked) => set({ authChecked }),

  // AI model + keys
  chatModel: 'gpt-5.4-mini',
  setChatModel: (chatModel) => set({ chatModel }),
  chatApiKey: '',
  setChatApiKey: (chatApiKey) => set({ chatApiKey }),
  embedApiKey: '',
  setEmbedApiKey: (embedApiKey) => set({ embedApiKey }),

  // Repository
  repository: null,
  messages: [],
  isLoading: false,
  isProcessing: false,
  error: null,
  setRepository: (repo) => set({ repository: repo }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  setMessages: (messages) => set({ messages }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  setError: (error) => set({ error }),
  clearChat: () => set({ messages: [] }),
  reset: () => set({ 
    repository: null, 
    messages: [], 
    isLoading: false, 
    isProcessing: false,
    error: null 
  }),
}));


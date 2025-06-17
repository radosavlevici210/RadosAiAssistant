export interface User {
  id: number;
  username: string;
  initials: string;
  status: string;
}

export interface ChatMessage {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  model?: string;
  createdAt?: Date;
}

export interface MusicProject {
  id: number;
  title: string;
  lyrics?: string;
  genre?: string;
  mood?: string;
  voiceStyle?: string;
  status: 'draft' | 'processing' | 'complete';
  audioUrl?: string;
  duration?: number;
  createdAt?: Date;
}

export interface QuantumProject {
  id: number;
  name: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  progress: number;
  totalTasks: number;
  completedTasks: number;
  dueDate?: Date;
  members: any[];
  createdAt?: Date;
}

export interface SecureFile {
  id: number;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  encrypted: boolean;
  watermarked: boolean;
  createdAt?: Date;
}

export interface SecureMessage {
  id: number;
  content: string;
  author: string;
  encrypted: boolean;
  createdAt?: Date;
}

export interface SystemStatus {
  deviceAuthentication: string;
  memoryEncryption: string;
  theftProtection: string;
  biometricLock: string;
  vmDetection: string;
  rootAccess: string;
  sessionLog: string;
  apis: {
    openai: string;
    anthropic: string;
    coingecko: string;
  };
}

export type Module = 'ai-assistant' | 'realartist' | 'quantum';

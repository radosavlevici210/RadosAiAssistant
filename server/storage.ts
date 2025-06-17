import { 
  users, chatMessages, musicProjects, quantumProjects, secureFiles, secureMessages,
  type User, type InsertUser, type ChatMessage, type InsertChatMessage,
  type MusicProject, type InsertMusicProject, type QuantumProject, type InsertQuantumProject,
  type SecureFile, type InsertSecureFile, type SecureMessage, type InsertSecureMessage
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Chat methods
  getChatMessages(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage & { userId: number }): Promise<ChatMessage>;
  clearChatMessages(userId: number): Promise<void>;

  // Music project methods
  getMusicProjects(userId: number): Promise<MusicProject[]>;
  getMusicProject(id: number): Promise<MusicProject | undefined>;
  createMusicProject(project: InsertMusicProject & { userId: number }): Promise<MusicProject>;
  updateMusicProject(id: number, updates: Partial<MusicProject>): Promise<MusicProject | undefined>;

  // Quantum project methods
  getQuantumProjects(userId: number): Promise<QuantumProject[]>;
  getQuantumProject(id: number): Promise<QuantumProject | undefined>;
  createQuantumProject(project: InsertQuantumProject & { userId: number }): Promise<QuantumProject>;
  updateQuantumProject(id: number, updates: Partial<QuantumProject>): Promise<QuantumProject | undefined>;

  // Secure file methods
  getSecureFiles(userId: number): Promise<SecureFile[]>;
  createSecureFile(file: InsertSecureFile & { userId: number }): Promise<SecureFile>;

  // Secure message methods
  getSecureMessages(userId: number): Promise<SecureMessage[]>;
  createSecureMessage(message: InsertSecureMessage & { userId: number }): Promise<SecureMessage>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chatMessages: Map<number, ChatMessage>;
  private musicProjects: Map<number, MusicProject>;
  private quantumProjects: Map<number, QuantumProject>;
  private secureFiles: Map<number, SecureFile>;
  private secureMessages: Map<number, SecureMessage>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.chatMessages = new Map();
    this.musicProjects = new Map();
    this.quantumProjects = new Map();
    this.secureFiles = new Map();
    this.secureMessages = new Map();
    this.currentId = 1;

    // Create default user
    this.createUser({
      username: "radosavlevici210",
      password: "demo",
      initials: "ER"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Chat methods
  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createChatMessage(message: InsertChatMessage & { userId: number }): Promise<ChatMessage> {
    const id = this.currentId++;
    const chatMessage: ChatMessage = {
      ...message,
      id,
      createdAt: new Date()
    };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }

  async clearChatMessages(userId: number): Promise<void> {
    const userMessages = Array.from(this.chatMessages.entries())
      .filter(([_, msg]) => msg.userId === userId);
    
    userMessages.forEach(([id]) => {
      this.chatMessages.delete(id);
    });
  }

  // Music project methods
  async getMusicProjects(userId: number): Promise<MusicProject[]> {
    return Array.from(this.musicProjects.values())
      .filter(project => project.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getMusicProject(id: number): Promise<MusicProject | undefined> {
    return this.musicProjects.get(id);
  }

  async createMusicProject(project: InsertMusicProject & { userId: number }): Promise<MusicProject> {
    const id = this.currentId++;
    const musicProject: MusicProject = {
      ...project,
      id,
      status: "draft",
      duration: null,
      audioUrl: null,
      createdAt: new Date()
    };
    this.musicProjects.set(id, musicProject);
    return musicProject;
  }

  async updateMusicProject(id: number, updates: Partial<MusicProject>): Promise<MusicProject | undefined> {
    const project = this.musicProjects.get(id);
    if (!project) return undefined;

    const updated = { ...project, ...updates };
    this.musicProjects.set(id, updated);
    return updated;
  }

  // Quantum project methods
  async getQuantumProjects(userId: number): Promise<QuantumProject[]> {
    return Array.from(this.quantumProjects.values())
      .filter(project => project.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getQuantumProject(id: number): Promise<QuantumProject | undefined> {
    return this.quantumProjects.get(id);
  }

  async createQuantumProject(project: InsertQuantumProject & { userId: number }): Promise<QuantumProject> {
    const id = this.currentId++;
    const quantumProject: QuantumProject = {
      ...project,
      id,
      progress: 0,
      completedTasks: 0,
      createdAt: new Date()
    };
    this.quantumProjects.set(id, quantumProject);
    return quantumProject;
  }

  async updateQuantumProject(id: number, updates: Partial<QuantumProject>): Promise<QuantumProject | undefined> {
    const project = this.quantumProjects.get(id);
    if (!project) return undefined;

    const updated = { ...project, ...updates };
    this.quantumProjects.set(id, updated);
    return updated;
  }

  // Secure file methods
  async getSecureFiles(userId: number): Promise<SecureFile[]> {
    return Array.from(this.secureFiles.values())
      .filter(file => file.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createSecureFile(file: InsertSecureFile & { userId: number }): Promise<SecureFile> {
    const id = this.currentId++;
    const secureFile: SecureFile = {
      ...file,
      id,
      encrypted: true,
      createdAt: new Date()
    };
    this.secureFiles.set(id, secureFile);
    return secureFile;
  }

  // Secure message methods
  async getSecureMessages(userId: number): Promise<SecureMessage[]> {
    return Array.from(this.secureMessages.values())
      .filter(msg => msg.userId === userId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createSecureMessage(message: InsertSecureMessage & { userId: number }): Promise<SecureMessage> {
    const id = this.currentId++;
    const secureMessage: SecureMessage = {
      ...message,
      id,
      encrypted: true,
      createdAt: new Date()
    };
    this.secureMessages.set(id, secureMessage);
    return secureMessage;
  }
}

export const storage = new MemStorage();

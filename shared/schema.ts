import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  initials: text("initials").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' | 'assistant'
  model: text("model"), // 'openai' | 'anthropic'
  createdAt: timestamp("created_at").defaultNow(),
});

export const musicProjects = pgTable("music_projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  lyrics: text("lyrics"),
  genre: text("genre"),
  mood: text("mood"),
  voiceStyle: text("voice_style"),
  status: text("status").default("draft"), // 'draft' | 'processing' | 'complete'
  audioUrl: text("audio_url"),
  duration: integer("duration"), // in seconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const quantumProjects = pgTable("quantum_projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  priority: text("priority").default("medium"), // 'low' | 'medium' | 'high'
  progress: integer("progress").default(0), // 0-100
  totalTasks: integer("total_tasks").default(0),
  completedTasks: integer("completed_tasks").default(0),
  dueDate: timestamp("due_date"),
  members: jsonb("members").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const secureFiles = pgTable("secure_files", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  size: integer("size").notNull(),
  mimeType: text("mime_type").notNull(),
  encrypted: boolean("encrypted").default(true),
  watermarked: boolean("watermarked").default(false),
  uploadPath: text("upload_path").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const secureMessages = pgTable("secure_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  author: text("author").notNull(),
  encrypted: boolean("encrypted").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  initials: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  content: true,
  role: true,
  model: true,
});

export const insertMusicProjectSchema = createInsertSchema(musicProjects).pick({
  title: true,
  lyrics: true,
  genre: true,
  mood: true,
  voiceStyle: true,
});

export const insertQuantumProjectSchema = createInsertSchema(quantumProjects).pick({
  name: true,
  description: true,
  priority: true,
  totalTasks: true,
  dueDate: true,
  members: true,
});

export const insertSecureFileSchema = createInsertSchema(secureFiles).pick({
  filename: true,
  originalName: true,
  size: true,
  mimeType: true,
  uploadPath: true,
  watermarked: true,
});

export const insertSecureMessageSchema = createInsertSchema(secureMessages).pick({
  content: true,
  author: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type MusicProject = typeof musicProjects.$inferSelect;
export type InsertMusicProject = z.infer<typeof insertMusicProjectSchema>;
export type QuantumProject = typeof quantumProjects.$inferSelect;
export type InsertQuantumProject = z.infer<typeof insertQuantumProjectSchema>;
export type SecureFile = typeof secureFiles.$inferSelect;
export type InsertSecureFile = z.infer<typeof insertSecureFileSchema>;
export type SecureMessage = typeof secureMessages.$inferSelect;
export type InsertSecureMessage = z.infer<typeof insertSecureMessageSchema>;

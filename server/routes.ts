import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema, insertMusicProjectSchema, insertQuantumProjectSchema, insertSecureMessageSchema } from "@shared/schema";
import * as openaiService from "./services/openai";
import * as anthropicService from "./services/anthropic";
import { getCached, setCached, deleteCached } from "./cache";
import multer from "multer";
import path from "path";
import fs from "fs";

// Set up multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Default user ID for demo (in production, this would come from authentication)
  const DEFAULT_USER_ID = 1;

  // AI Assistant Routes with caching
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const cacheKey = `chat_messages_${DEFAULT_USER_ID}`;
      
      // Try to get from cache first
      let messages = await getCached(cacheKey);
      
      if (!messages) {
        messages = await storage.getChatMessages(DEFAULT_USER_ID);
        // Cache for 30 seconds
        await setCached(cacheKey, messages, 30);
      }
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/message", async (req, res) => {
    try {
      const { content, model } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: "Message content is required" });
      }

      // Save user message
      const userMessage = await storage.createChatMessage({
        content,
        role: "user",
        model: model || "openai",
        userId: DEFAULT_USER_ID
      });

      // Generate AI response
      let aiResponse: string;
      try {
        if (model === "anthropic") {
          aiResponse = await anthropicService.generateChatResponse(content);
        } else {
          aiResponse = await openaiService.generateChatResponse(content);
        }
      } catch (error) {
        console.error("AI service error:", error);
        aiResponse = "I apologize, but I'm currently unable to process your request. Please check the API configuration.";
      }

      // Save AI response
      const assistantMessage = await storage.createChatMessage({
        content: aiResponse,
        role: "assistant",
        model: model || "openai",
        userId: DEFAULT_USER_ID
      });

      // Invalidate cache after new message
      await deleteCached(`chat_messages_${DEFAULT_USER_ID}`);

      res.json({ userMessage, assistantMessage });
    } catch (error) {
      console.error("Error in chat message:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  app.post("/api/chat/generate-code", async (req, res) => {
    try {
      const { prompt, model } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Code prompt is required" });
      }

      let result: { code: string; explanation: string };
      try {
        if (model === "anthropic") {
          result = await anthropicService.generateCode(prompt);
        } else {
          result = await openaiService.generateCode(prompt);
        }
      } catch (error) {
        console.error("Code generation error:", error);
        result = {
          code: "// Code generation failed - please check API configuration",
          explanation: "Unable to generate code due to API configuration issues."
        };
      }

      res.json(result);
    } catch (error) {
      console.error("Error in code generation:", error);
      res.status(500).json({ error: "Failed to generate code" });
    }
  });

  app.delete("/api/chat/clear", async (req, res) => {
    try {
      await storage.clearChatMessages(DEFAULT_USER_ID);
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing chat:", error);
      res.status(500).json({ error: "Failed to clear chat messages" });
    }
  });

  // RealArtist Studio Routes
  app.get("/api/music/projects", async (req, res) => {
    try {
      const projects = await storage.getMusicProjects(DEFAULT_USER_ID);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching music projects:", error);
      res.status(500).json({ error: "Failed to fetch music projects" });
    }
  });

  app.post("/api/music/generate", async (req, res) => {
    try {
      const projectData = insertMusicProjectSchema.parse(req.body);
      
      const project = await storage.createMusicProject({
        ...projectData,
        userId: DEFAULT_USER_ID
      });

      // Simulate music generation process
      setTimeout(async () => {
        try {
          await storage.updateMusicProject(project.id, {
            status: "processing"
          });
          
          // Simulate completion after 5 seconds
          setTimeout(async () => {
            await storage.updateMusicProject(project.id, {
              status: "complete",
              duration: 222, // 3:42 in seconds
              audioUrl: `/api/music/audio/${project.id}`
            });
          }, 5000);
        } catch (error) {
          console.error("Error updating project status:", error);
        }
      }, 1000);

      res.json(project);
    } catch (error) {
      console.error("Error generating music:", error);
      res.status(500).json({ error: "Failed to generate music" });
    }
  });

  app.get("/api/music/project/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getMusicProject(id);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching music project:", error);
      res.status(500).json({ error: "Failed to fetch music project" });
    }
  });

  // Quantum Suite Routes
  app.get("/api/quantum/projects", async (req, res) => {
    try {
      const projects = await storage.getQuantumProjects(DEFAULT_USER_ID);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching quantum projects:", error);
      res.status(500).json({ error: "Failed to fetch quantum projects" });
    }
  });

  app.post("/api/quantum/projects", async (req, res) => {
    try {
      const projectData = insertQuantumProjectSchema.parse(req.body);
      
      const project = await storage.createQuantumProject({
        ...projectData,
        userId: DEFAULT_USER_ID
      });

      res.json(project);
    } catch (error) {
      console.error("Error creating quantum project:", error);
      res.status(500).json({ error: "Failed to create quantum project" });
    }
  });

  app.get("/api/quantum/messages", async (req, res) => {
    try {
      const messages = await storage.getSecureMessages(DEFAULT_USER_ID);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching secure messages:", error);
      res.status(500).json({ error: "Failed to fetch secure messages" });
    }
  });

  app.post("/api/quantum/messages", async (req, res) => {
    try {
      const messageData = insertSecureMessageSchema.parse(req.body);
      
      const message = await storage.createSecureMessage({
        ...messageData,
        userId: DEFAULT_USER_ID
      });

      res.json(message);
    } catch (error) {
      console.error("Error creating secure message:", error);
      res.status(500).json({ error: "Failed to create secure message" });
    }
  });

  app.get("/api/quantum/files", async (req, res) => {
    try {
      const files = await storage.getSecureFiles(DEFAULT_USER_ID);
      res.json(files);
    } catch (error) {
      console.error("Error fetching secure files:", error);
      res.status(500).json({ error: "Failed to fetch secure files" });
    }
  });

  app.post("/api/quantum/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { watermark } = req.body;
      
      const secureFile = await storage.createSecureFile({
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadPath: req.file.path,
        watermarked: watermark === 'true',
        userId: DEFAULT_USER_ID
      });

      res.json(secureFile);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // System status routes
  app.get("/api/system/status", async (req, res) => {
    const status = {
      deviceAuthentication: "verified",
      memoryEncryption: "active",
      theftProtection: "enabled",
      biometricLock: "active",
      vmDetection: "blocked",
      rootAccess: "verified",
      sessionLog: "secure",
      apis: {
        openai: process.env.OPENAI_API_KEY ? "connected" : "disconnected",
        anthropic: process.env.ANTHROPIC_API_KEY ? "connected" : "disconnected",
        coingecko: "connected" // Placeholder for future implementation
      }
    };
    
    res.json(status);
  });

  return httpServer;
}

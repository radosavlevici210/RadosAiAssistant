# RADOS - Advanced Multi-Module Application

## Overview

RADOS is a sophisticated multi-module application that combines AI assistance, music generation, and quantum computing features. The system is built using a modern full-stack architecture with React frontend, Express.js backend, and PostgreSQL database using Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Comprehensive set of shadcn/ui components with dark theme support

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Design**: RESTful API structure
- **File Handling**: Multer for file uploads with 10MB limit
- **Development**: Hot reloading with Vite integration

### Database Schema
The application uses PostgreSQL with the following main entities:
- **Users**: User authentication and profile management
- **Chat Messages**: AI conversation history with model tracking
- **Music Projects**: Music generation projects with metadata
- **Quantum Projects**: Project management with progress tracking
- **Secure Files**: File storage with encryption and watermarking capabilities
- **Secure Messages**: Encrypted messaging system

## Key Components

### AI Assistant Pro Module
- Dual AI provider support (OpenAI GPT-4o and Anthropic Claude Sonnet 4)
- Chat interface with conversation history
- Code generation capabilities with explanations
- Model selection and switching functionality
- Sentiment analysis features

### RealArtist Studio Module
- Music generation system with customizable parameters
- Support for lyrics, genre, mood, and voice style selection
- Project management with status tracking (draft/processing/complete)
- Audio file handling and duration tracking

### Quantum Suite Module
- Project management system with priority levels and progress tracking
- Secure file handling with encryption capabilities
- Terminal-like interface for advanced operations
- NDA acceptance workflow for access control
- Team collaboration features with member management

### Security Features
- File encryption and watermarking capabilities
- Secure message handling
- Session management with PostgreSQL session store
- Input validation and sanitization

## Data Flow

1. **Frontend Request**: Client makes API requests through TanStack Query
2. **API Processing**: Express.js routes handle requests with validation
3. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
4. **External Services**: Integration with OpenAI and Anthropic APIs
5. **Response Handling**: Structured JSON responses with error handling
6. **State Management**: Client-side state updates through query invalidation

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4o model for chat and code generation
- **Anthropic API**: Claude Sonnet 4 model as alternative AI provider

### Database
- **Neon Database**: Serverless PostgreSQL for data persistence
- **Drizzle Kit**: Database migrations and schema management

### Development Tools
- **Replit**: Development environment with PostgreSQL integration
- **Vite**: Build tool with hot module replacement
- **TypeScript**: Type safety across the entire stack

## Deployment Strategy

### Build Process
- Frontend builds to `dist/public` directory
- Backend compiles with esbuild to `dist/index.js`
- Static file serving integrated with Express

### Environment Configuration
- Development: Vite dev server with Express API
- Production: Compiled Express server serving static files
- Database: Environment-based connection string configuration

### Replit Integration
- Automatic deployment with build and start scripts
- Port configuration for external access (5000 → 80)
- Module dependencies: Node.js 20, Web, PostgreSQL 16

## Changelog
- June 17, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
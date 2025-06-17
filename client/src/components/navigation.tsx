import { useState } from 'react';
import type { Module } from '@/lib/types';

interface NavigationProps {
  activeModule: Module;
  onModuleChange: (module: Module) => void;
  user: {
    initials: string;
    status: string;
  };
}

export function Navigation({ activeModule, onModuleChange, user }: NavigationProps) {
  return (
    <>
      {/* Main Navigation */}
      <nav className="sticky top-0 z-50 glassmorphism border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <i className="fas fa-atom text-white text-sm"></i>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  RADOS
                </span>
              </div>
            </div>
            
            {/* Module Switcher */}
            <div className="hidden md:flex items-center space-x-1 bg-slate-800/50 rounded-lg p-1">
              <button 
                onClick={() => onModuleChange('ai-assistant')}
                className={`tab-button px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeModule === 'ai-assistant' ? 'active-tab' : ''
                }`}
              >
                <i className="fas fa-robot mr-2"></i>AI Assistant Pro
              </button>
              <button 
                onClick={() => onModuleChange('realartist')}
                className={`tab-button px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeModule === 'realartist' ? 'active-tab' : ''
                }`}
              >
                <i className="fas fa-music mr-2"></i>RealArtist Studio
              </button>
              <button 
                onClick={() => onModuleChange('quantum')}
                className={`tab-button px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeModule === 'quantum' ? 'active-tab' : ''
                }`}
              >
                <i className="fas fa-project-diagram mr-2"></i>Quantum Suite
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span>{user.status}</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{user.initials}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Module Switcher */}
      <div className="md:hidden bg-slate-800/50 border-b border-slate-700/50">
        <div className="flex overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => onModuleChange('ai-assistant')}
            className={`mobile-tab-button flex-shrink-0 px-6 py-3 text-sm font-medium ${
              activeModule === 'ai-assistant' ? 'active-tab' : ''
            }`}
          >
            <i className="fas fa-robot mr-2"></i>AI Assistant
          </button>
          <button 
            onClick={() => onModuleChange('realartist')}
            className={`mobile-tab-button flex-shrink-0 px-6 py-3 text-sm font-medium ${
              activeModule === 'realartist' ? 'active-tab' : ''
            }`}
          >
            <i className="fas fa-music mr-2"></i>RealArtist
          </button>
          <button 
            onClick={() => onModuleChange('quantum')}
            className={`mobile-tab-button flex-shrink-0 px-6 py-3 text-sm font-medium ${
              activeModule === 'quantum' ? 'active-tab' : ''
            }`}
          >
            <i className="fas fa-project-diagram mr-2"></i>Quantum Suite
          </button>
        </div>
      </div>
    </>
  );
}

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { AIAssistant } from '@/components/ai-assistant';
import { RealArtistStudio } from '@/components/realartist-studio';
import { QuantumSuite } from '@/components/quantum-suite';
import type { Module } from '@/lib/types';

export default function Home() {
  const [activeModule, setActiveModule] = useState<Module>('ai-assistant');

  const user = {
    initials: 'ER',
    status: 'Secure Session'
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'ai-assistant':
        return <AIAssistant />;
      case 'realartist':
        return <RealArtistStudio />;
      case 'quantum':
        return <QuantumSuite />;
      default:
        return <AIAssistant />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation 
        activeModule={activeModule} 
        onModuleChange={setActiveModule}
        user={user}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {renderModule()}
        </div>
      </main>
    </div>
  );
}

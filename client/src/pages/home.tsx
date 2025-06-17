import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { AIAssistant } from '@/components/ai-assistant';
import { RealArtistStudio } from '@/components/realartist-studio';
import { QuantumSuite } from '@/components/quantum-suite';
import { PerformanceMonitor } from '@/components/performance-monitor';
import { SpeedOptimizer } from '@/components/speed-optimizer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Zap } from 'lucide-react';
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
      
      {/* Performance Controls */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <PerformanceMonitor />
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <Zap className="h-4 w-4" />
                Speed
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <SpeedOptimizer />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {renderModule()}
        </div>
      </main>
    </div>
  );
}

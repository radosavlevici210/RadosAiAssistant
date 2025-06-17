import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { AIAssistant } from '@/components/ai-assistant';
import { RealArtistStudio } from '@/components/realartist-studio';
import { QuantumSuite } from '@/components/quantum-suite';
import { PerformanceMonitor } from '@/components/performance-monitor';
import { SpeedOptimizer } from '@/components/speed-optimizer';
import { TurboMode } from '@/components/turbo-mode';
import { PerformanceBoost } from '@/components/performance-boost';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Settings, Zap, Rocket, TrendingUp } from 'lucide-react';
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
              <DialogTitle>Speed Optimization</DialogTitle>
              <DialogDescription>Configure performance settings for maximum speed</DialogDescription>
              <SpeedOptimizer />
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="destructive" className="gap-2">
                <Rocket className="h-4 w-4" />
                TURBO
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogTitle>Turbo Mode</DialogTitle>
              <DialogDescription>Activate maximum performance mode</DialogDescription>
              <TurboMode />
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                BOOST
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogTitle>Performance Boost</DialogTitle>
              <DialogDescription>Advanced system optimization controls</DialogDescription>
              <PerformanceBoost />
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

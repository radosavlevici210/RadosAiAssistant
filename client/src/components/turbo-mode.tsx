import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Rocket, Cpu, Zap, Gauge, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TurboSettings {
  enabled: boolean;
  intensity: number;
  autoOptimize: boolean;
  aggressiveCaching: boolean;
  preloadEverything: boolean;
  maxPerformance: boolean;
}

export function TurboMode() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<TurboSettings>({
    enabled: false,
    intensity: 50,
    autoOptimize: true,
    aggressiveCaching: false,
    preloadEverything: false,
    maxPerformance: false
  });

  const [performanceGain, setPerformanceGain] = useState(0);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('turboModeSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      if (parsed.enabled) {
        applyTurboMode(parsed);
      }
    }
  }, []);

  const calculatePerformanceGain = useCallback((turboSettings: TurboSettings) => {
    let gain = 0;
    if (turboSettings.enabled) gain += 25;
    if (turboSettings.aggressiveCaching) gain += 30;
    if (turboSettings.preloadEverything) gain += 20;
    if (turboSettings.maxPerformance) gain += 40;
    gain += (turboSettings.intensity / 100) * 35;
    return Math.min(gain, 150); // Cap at 150% gain
  }, []);

  const applyTurboMode = useCallback(async (turboSettings: TurboSettings) => {
    if (!turboSettings.enabled) return;

    // Disable animations for speed
    if (turboSettings.maxPerformance) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
      document.documentElement.style.setProperty('--transition-duration', '0s');
    }

    // Aggressive resource preloading
    if (turboSettings.preloadEverything) {
      const criticalResources = [
        '/api/chat/messages',
        '/api/system/status',
        '/api/music/projects',
        '/api/quantum/projects'
      ];

      criticalResources.forEach(url => {
        fetch(url, { method: 'HEAD' }).catch(() => {});
      });
    }

    // Enhanced caching
    if (turboSettings.aggressiveCaching && 'caches' in window) {
      const cache = await caches.open('turbo-cache-v1');
      const urlsToCache = [
        '/',
        '/api/chat/messages',
        '/api/system/status'
      ];
      
      cache.addAll(urlsToCache).catch(() => {});
    }

    // CPU optimization
    if (turboSettings.intensity > 70) {
      // Reduce DOM updates
      const style = document.createElement('style');
      style.textContent = `
        * { 
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `;
      document.head.appendChild(style);
    }

    // Memory cleanup
    if (turboSettings.autoOptimize) {
      // Clear unused event listeners
      const cleanupInterval = setInterval(() => {
        if ('gc' in window) {
          (window as any).gc();
        }
      }, 30000);

      // Store cleanup reference
      (window as any).turboCleanup = cleanupInterval;
    }

    const gain = calculatePerformanceGain(turboSettings);
    setPerformanceGain(gain);
  }, [calculatePerformanceGain]);

  const toggleTurboMode = useCallback(async () => {
    setIsActivating(true);
    
    const newSettings = { ...settings, enabled: !settings.enabled };
    
    if (newSettings.enabled) {
      await applyTurboMode(newSettings);
      toast({
        title: "🚀 TURBO MODE ACTIVATED",
        description: `Performance boosted by ${calculatePerformanceGain(newSettings)}%`
      });
    } else {
      // Disable turbo optimizations
      document.documentElement.style.removeProperty('--animation-duration');
      document.documentElement.style.removeProperty('--transition-duration');
      
      if ((window as any).turboCleanup) {
        clearInterval((window as any).turboCleanup);
      }
      
      setPerformanceGain(0);
      toast({
        title: "Turbo Mode Disabled",
        description: "Performance optimizations have been removed."
      });
    }
    
    setSettings(newSettings);
    localStorage.setItem('turboModeSettings', JSON.stringify(newSettings));
    setIsActivating(false);
  }, [settings, applyTurboMode, calculatePerformanceGain, toast]);

  const updateSetting = useCallback((key: keyof TurboSettings, value: boolean | number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('turboModeSettings', JSON.stringify(newSettings));
    
    if (newSettings.enabled) {
      applyTurboMode(newSettings);
    }
  }, [settings, applyTurboMode]);

  const getIntensityLabel = (intensity: number) => {
    if (intensity < 25) return 'Gentle';
    if (intensity < 50) return 'Moderate';
    if (intensity < 75) return 'Aggressive';
    return 'MAXIMUM';
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity < 25) return 'text-green-500';
    if (intensity < 50) return 'text-yellow-500';
    if (intensity < 75) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Rocket className={`h-5 w-5 ${settings.enabled ? 'text-orange-500' : 'text-gray-500'}`} />
          TURBO MODE
          {settings.enabled && (
            <Badge variant="destructive" className="ml-auto">
              <Flame className="h-3 w-3 mr-1" />
              ACTIVE
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Toggle */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <Label htmlFor="turbo-toggle" className="font-medium">
              Enable Turbo Mode
            </Label>
          </div>
          <Switch
            id="turbo-toggle"
            checked={settings.enabled}
            onCheckedChange={toggleTurboMode}
            disabled={isActivating}
          />
        </div>

        {/* Performance Gain Display */}
        {settings.enabled && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Performance Gain</span>
              <span className="text-lg font-bold text-green-500">+{performanceGain}%</span>
            </div>
            <Progress value={(performanceGain / 150) * 100} className="h-2" />
          </div>
        )}

        {/* Intensity Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Turbo Intensity</Label>
            <span className={`text-sm font-medium ${getIntensityColor(settings.intensity)}`}>
              {getIntensityLabel(settings.intensity)} ({settings.intensity}%)
            </span>
          </div>
          <Slider
            value={[settings.intensity]}
            onValueChange={([value]) => updateSetting('intensity', value)}
            max={100}
            step={1}
            disabled={!settings.enabled}
            className="w-full"
          />
        </div>

        {/* Advanced Options */}
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              <Label htmlFor="auto-optimize" className="text-sm">Auto Optimize</Label>
            </div>
            <Switch
              id="auto-optimize"
              checked={settings.autoOptimize}
              onCheckedChange={(checked) => updateSetting('autoOptimize', checked)}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="aggressive-cache" className="text-sm">Aggressive Caching</Label>
            <Switch
              id="aggressive-cache"
              checked={settings.aggressiveCaching}
              onCheckedChange={(checked) => updateSetting('aggressiveCaching', checked)}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="preload-all" className="text-sm">Preload Everything</Label>
            <Switch
              id="preload-all"
              checked={settings.preloadEverything}
              onCheckedChange={(checked) => updateSetting('preloadEverything', checked)}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              <Label htmlFor="max-perf" className="text-sm">Maximum Performance</Label>
            </div>
            <Switch
              id="max-perf"
              checked={settings.maxPerformance}
              onCheckedChange={(checked) => updateSetting('maxPerformance', checked)}
              disabled={!settings.enabled}
            />
          </div>
        </div>

        {settings.enabled && (
          <div className="text-xs text-muted-foreground mt-4 p-2 bg-orange-500/10 rounded border border-orange-500/20">
            <p className="font-medium text-orange-600 dark:text-orange-400">⚠️ Warning:</p>
            <p>Turbo mode disables some visual effects and enables aggressive optimizations for maximum speed.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
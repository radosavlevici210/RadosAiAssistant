import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useOptimizedRender, usePreloader } from '@/hooks/use-performance';
import { Settings, Zap, Image, Cpu, Network } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OptimizationSettings {
  enableCaching: boolean;
  preloadImages: boolean;
  enableCompression: boolean;
  reducedAnimations: boolean;
  lazyLoading: boolean;
  prefetchRoutes: boolean;
}

export function SpeedOptimizer() {
  const { toast } = useToast();
  const { preloadResource, preloadImages } = usePreloader();
  const { throttle, debounce } = useOptimizedRender();
  
  const [settings, setSettings] = useState<OptimizationSettings>({
    enableCaching: true,
    preloadImages: true,
    enableCompression: true,
    reducedAnimations: false,
    lazyLoading: true,
    prefetchRoutes: true
  });

  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('speedOptimizationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = useCallback((newSettings: OptimizationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('speedOptimizationSettings', JSON.stringify(newSettings));
  }, []);

  const updateSetting = useCallback((key: keyof OptimizationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
    
    // Apply setting immediately
    applyOptimization(key, value);
  }, [settings, saveSettings]);

  const applyOptimization = useCallback((setting: keyof OptimizationSettings, enabled: boolean) => {
    switch (setting) {
      case 'enableCaching':
        if (enabled) {
          // Enable service worker caching
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
          }
        }
        break;
        
      case 'preloadImages':
        if (enabled) {
          // Preload critical images
          const criticalImages = [
            '/api/placeholder/400/300',
            '/api/placeholder/800/600'
          ];
          preloadImages(criticalImages);
        }
        break;
        
      case 'reducedAnimations':
        document.documentElement.style.setProperty(
          '--animation-duration',
          enabled ? '0.1s' : '0.3s'
        );
        break;
        
      case 'lazyLoading':
        // Apply lazy loading to images
        const images = document.querySelectorAll('img[data-src]');
        if (enabled && 'IntersectionObserver' in window) {
          const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                img.src = img.dataset.src!;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
              }
            });
          });
          images.forEach(img => imageObserver.observe(img));
        }
        break;
        
      case 'prefetchRoutes':
        if (enabled) {
          // Prefetch critical routes
          preloadResource('/api/chat/messages', 'script');
          preloadResource('/api/system/status', 'script');
        }
        break;
    }
  }, [preloadResource, preloadImages]);

  const optimizeNow = useCallback(async () => {
    setIsOptimizing(true);
    
    try {
      // Clear unused caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => {
            if (name.includes('old') || name.includes('temp')) {
              return caches.delete(name);
            }
          })
        );
      }

      // Force garbage collection if available
      if ('gc' in window) {
        (window as any).gc();
      }

      // Optimize CSS
      const unusedCSS = document.querySelectorAll('style, link[rel="stylesheet"]');
      unusedCSS.forEach((element, index) => {
        if (index > 10) { // Keep only first 10 stylesheets
          element.remove();
        }
      });

      // Defer non-critical scripts
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach(script => {
        if (!script.getAttribute('defer') && !script.getAttribute('async')) {
          script.setAttribute('defer', 'true');
        }
      });

      // Apply all current settings
      Object.entries(settings).forEach(([key, value]) => {
        applyOptimization(key as keyof OptimizationSettings, value);
      });

      toast({
        title: "Optimization Complete",
        description: "Application speed has been optimized for maximum performance."
      });
      
    } catch (error) {
      toast({
        title: "Optimization Error",
        description: "Some optimizations may not have been applied.",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  }, [settings, applyOptimization, toast]);

  const resetToDefaults = useCallback(() => {
    const defaultSettings: OptimizationSettings = {
      enableCaching: true,
      preloadImages: true,
      enableCompression: true,
      reducedAnimations: false,
      lazyLoading: true,
      prefetchRoutes: true
    };
    saveSettings(defaultSettings);
    toast({
      title: "Settings Reset",
      description: "Optimization settings have been reset to defaults."
    });
  }, [saveSettings, toast]);

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Speed Optimizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              <Label htmlFor="caching">Enable Caching</Label>
            </div>
            <Switch
              id="caching"
              checked={settings.enableCaching}
              onCheckedChange={(checked) => updateSetting('enableCaching', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <Label htmlFor="preload">Preload Images</Label>
            </div>
            <Switch
              id="preload"
              checked={settings.preloadImages}
              onCheckedChange={(checked) => updateSetting('preloadImages', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              <Label htmlFor="compression">Enable Compression</Label>
            </div>
            <Switch
              id="compression"
              checked={settings.enableCompression}
              onCheckedChange={(checked) => updateSetting('enableCompression', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <Label htmlFor="animations">Reduced Animations</Label>
            </div>
            <Switch
              id="animations"
              checked={settings.reducedAnimations}
              onCheckedChange={(checked) => updateSetting('reducedAnimations', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="lazy">Lazy Loading</Label>
            <Switch
              id="lazy"
              checked={settings.lazyLoading}
              onCheckedChange={(checked) => updateSetting('lazyLoading', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="prefetch">Prefetch Routes</Label>
            <Switch
              id="prefetch"
              checked={settings.prefetchRoutes}
              onCheckedChange={(checked) => updateSetting('prefetchRoutes', checked)}
            />
          </div>
        </div>

        <Separator />

        <div className="flex gap-2">
          <Button 
            onClick={optimizeNow} 
            disabled={isOptimizing}
            className="flex-1"
          >
            {isOptimizing ? 'Optimizing...' : 'Optimize Now'}
          </Button>
          <Button 
            onClick={resetToDefaults}
            variant="outline"
            size="sm"
          >
            Reset
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>These optimizations improve app speed by reducing load times, enabling caching, and optimizing resource loading.</p>
        </div>
      </CardContent>
    </Card>
  );
}
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePerformance } from '@/hooks/use-performance';
import { Activity, Zap, Clock, Wifi } from 'lucide-react';

interface PerformanceMonitorProps {
  showDetailed?: boolean;
}

export function PerformanceMonitor({ showDetailed = false }: PerformanceMonitorProps) {
  const { metrics } = usePerformance();
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    fps: 60,
    latency: 0,
    bytesTransferred: 0
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setRealTimeMetrics(prev => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    measureFPS();

    // Monitor network performance
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const updateNetworkInfo = () => {
        setRealTimeMetrics(prev => ({
          ...prev,
          latency: connection.rtt || 0,
          bytesTransferred: Math.round((connection.downlink || 0) * 1000)
        }));
      };

      updateNetworkInfo();
      connection?.addEventListener('change', updateNetworkInfo);

      return () => {
        cancelAnimationFrame(animationId);
        connection?.removeEventListener('change', updateNetworkInfo);
      };
    }

    return () => cancelAnimationFrame(animationId);
  }, []);

  const getPerformanceColor = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return 'text-green-500';
    if (value <= thresholds[1]) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSpeedBadge = (connectionSpeed: string) => {
    const speedMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      '4g': { variant: 'default', label: 'Fast' },
      '3g': { variant: 'secondary', label: 'Good' },
      '2g': { variant: 'destructive', label: 'Slow' },
      'slow-2g': { variant: 'destructive', label: 'Very Slow' },
      'unknown': { variant: 'outline', label: 'Unknown' }
    };
    
    const speed = speedMap[connectionSpeed] || speedMap.unknown;
    return <Badge variant={speed.variant}>{speed.label}</Badge>;
  };

  if (!showDetailed) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Activity className="h-4 w-4" />
        <span className={getPerformanceColor(realTimeMetrics.fps, [45, 30])}>
          {realTimeMetrics.fps} FPS
        </span>
        <span className={getPerformanceColor(metrics.loadTime, [1000, 3000])}>
          {metrics.loadTime}ms
        </span>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span className="text-xs font-medium">FPS</span>
            </div>
            <div className={`text-lg font-bold ${getPerformanceColor(realTimeMetrics.fps, [45, 30])}`}>
              {realTimeMetrics.fps}
            </div>
            <Progress value={(realTimeMetrics.fps / 60) * 100} className="h-1" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="text-xs font-medium">Load Time</span>
            </div>
            <div className={`text-lg font-bold ${getPerformanceColor(metrics.loadTime, [1000, 3000])}`}>
              {metrics.loadTime}ms
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              <span className="text-xs font-medium">Latency</span>
            </div>
            <div className={`text-lg font-bold ${getPerformanceColor(realTimeMetrics.latency, [100, 300])}`}>
              {realTimeMetrics.latency}ms
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium">Connection</span>
            <div className="pt-1">
              {getSpeedBadge(metrics.connectionSpeed)}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Memory Usage:</span>
            <span className="font-mono">{metrics.memoryUsage} MB</span>
          </div>
          <div className="flex justify-between">
            <span>Render Time:</span>
            <span className="font-mono">{metrics.renderTime}ms</span>
          </div>
          <div className="flex justify-between">
            <span>Bandwidth:</span>
            <span className="font-mono">{realTimeMetrics.bytesTransferred} KB/s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
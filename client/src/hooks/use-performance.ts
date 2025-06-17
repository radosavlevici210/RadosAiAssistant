import { useEffect, useState, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  connectionSpeed: string;
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    connectionSpeed: 'unknown'
  });

  const measurePerformance = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      
      // Get memory usage if available
      const memory = (performance as any).memory;
      const memoryUsage = memory ? memory.usedJSHeapSize / 1048576 : 0; // Convert to MB
      
      // Estimate connection speed
      const connectionSpeed = getConnectionSpeed();
      
      setMetrics({
        loadTime: Math.round(loadTime),
        renderTime: Math.round(renderTime),
        memoryUsage: Math.round(memoryUsage * 100) / 100,
        connectionSpeed
      });
    }
  }, []);

  const getConnectionSpeed = (): string => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      const speed = connection.effectiveType;
      return speed || 'unknown';
    }
    return 'unknown';
  };

  useEffect(() => {
    measurePerformance();
    
    // Re-measure on page visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(measurePerformance, 100);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [measurePerformance]);

  return { metrics, measurePerformance };
}

// Preload critical resources
export function usePreloader() {
  const preloadResource = useCallback((url: string, type: 'image' | 'script' | 'style' | 'font' = 'image') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    if (type === 'font') {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  }, []);

  const preloadImages = useCallback((urls: string[]) => {
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  return { preloadResource, preloadImages };
}

// Optimize component rendering
export function useOptimizedRender() {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const throttle = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    let lastExecTime = 0;
    
    return (...args: any[]) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }, []);

  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  return { isVisible, throttle, debounce };
}
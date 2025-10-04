import React, { useEffect, useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useCacheManager } from '../hooks/useDataCache';
import { Activity, Database, Zap, Clock, Trash2 } from 'lucide-react';

interface PerformanceMetrics {
  renderCount: number;
  cacheHits: number;
  cacheMisses: number;
  apiCalls: number;
  imageLoads: number;
  averageLoadTime: number;
}

export const PerformanceMonitor = memo(function PerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    cacheHits: 0,
    cacheMisses: 0,
    apiCalls: 0,
    imageLoads: 0,
    averageLoadTime: 0
  });
  const [loadTimes, setLoadTimes] = useState<number[]>([]);
  const { getStats, clearCache } = useCacheManager();

  // Performance monitoring
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Monitor page load performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          const loadTime = navEntry.loadEventEnd - navEntry.navigationStart;
          setLoadTimes(prev => [...prev.slice(-9), loadTime]); // Keep last 10 measurements
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });

    // Monitor render performance
    let renderCount = 0;
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      if (args[0]?.includes?.('render count')) {
        renderCount++;
        setMetrics(prev => ({ ...prev, renderCount }));
      }
      originalConsoleLog(...args);
    };

    // Monitor API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      setMetrics(prev => ({ ...prev, apiCalls: prev.apiCalls + 1 }));
      const start = performance.now();
      const response = await originalFetch(...args);
      const end = performance.now();
      
      setLoadTimes(prev => [...prev.slice(-9), end - start]);
      return response;
    };

    // Monitor image loads
    const handleImageLoad = () => {
      setMetrics(prev => ({ ...prev, imageLoads: prev.imageLoads + 1 }));
    };

    document.addEventListener('load', handleImageLoad, true);

    return () => {
      observer.disconnect();
      console.log = originalConsoleLog;
      window.fetch = originalFetch;
      document.removeEventListener('load', handleImageLoad, true);
    };
  }, []);

  // Update cache metrics
  useEffect(() => {
    const interval = setInterval(() => {
      const stats = getStats();
      setMetrics(prev => ({
        ...prev,
        cacheHits: stats.valid,
        cacheMisses: stats.expired
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [getStats]);

  // Calculate average load time
  useEffect(() => {
    if (loadTimes.length > 0) {
      const average = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
      setMetrics(prev => ({ ...prev, averageLoadTime: average }));
    }
  }, [loadTimes]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Activity className="w-4 h-4 mr-2" />
          Performance
        </Button>
      </div>
    );
  }

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'bg-green-500';
    if (value <= thresholds.warning) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Performance Monitor
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Render Performance */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Renders</span>
            <Badge variant="outline" className="text-xs">
              {metrics.renderCount}
            </Badge>
          </div>

          {/* Cache Performance */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center">
                <Database className="w-3 h-3 mr-1" />
                Cache
              </span>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs bg-green-100">
                  {metrics.cacheHits} hits
                </Badge>
                <Badge variant="outline" className="text-xs bg-red-100">
                  {metrics.cacheMisses} misses
                </Badge>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all duration-300 ${
                  metrics.cacheHits + metrics.cacheMisses > 0
                    ? getPerformanceColor(
                        (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100,
                        { good: 80, warning: 60 }
                      )
                    : 'bg-gray-300'
                }`}
                style={{
                  width: `${metrics.cacheHits + metrics.cacheMisses > 0 
                    ? (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100 
                    : 0}%`
                }}
              />
            </div>
          </div>

          {/* API Performance */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center">
              <Zap className="w-3 h-3 mr-1" />
              API Calls
            </span>
            <Badge variant="outline" className="text-xs">
              {metrics.apiCalls}
            </Badge>
          </div>

          {/* Image Performance */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Images Loaded</span>
            <Badge variant="outline" className="text-xs">
              {metrics.imageLoads}
            </Badge>
          </div>

          {/* Load Time */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Avg Load Time
              </span>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  metrics.averageLoadTime > 0
                    ? getPerformanceColor(metrics.averageLoadTime, { good: 1000, warning: 3000 })
                    : ''
                }`}
              >
                {metrics.averageLoadTime > 0 ? `${Math.round(metrics.averageLoadTime)}ms` : 'N/A'}
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all duration-300 ${
                  metrics.averageLoadTime > 0
                    ? getPerformanceColor(metrics.averageLoadTime, { good: 1000, warning: 3000 })
                    : 'bg-gray-300'
                }`}
                style={{
                  width: `${Math.min((metrics.averageLoadTime / 5000) * 100, 100)}%`
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={clearCache}
              className="flex-1 text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear Cache
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1 text-xs"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default PerformanceMonitor;

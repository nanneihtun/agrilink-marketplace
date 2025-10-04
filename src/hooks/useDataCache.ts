import React, { useState, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 100; // 100 entries default
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredCount++;
      }
    }

    return {
      total: this.cache.size,
      expired: expiredCount,
      valid: this.cache.size - expiredCount,
      maxSize: this.maxSize
    };
  }
}

// Global cache instance
const globalCache = new DataCache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 200
});

export const useDataCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Debounce rapid successive calls
    const now = Date.now();
    if (!forceRefresh && now - lastFetchRef.current < 1000) {
      console.log('🚫 Debouncing rapid fetch call for key:', key);
      return;
    }
    lastFetchRef.current = now;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh && globalCache.has(key)) {
      const cachedData = globalCache.get<T>(key);
      if (cachedData) {
        setData(cachedData);
        setError(null);
        return cachedData;
      }
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);

      const result = await fetcher();
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      // Cache the result
      globalCache.set(key, result, options.ttl);
      
      setData(result);
      return result;
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      
      // Don't log database timeout errors as errors - they're expected
      if (err && typeof err === 'object' && 'code' in err && err.code === '57014') {
        console.log(`⏱️ Database timeout for key "${key}" - this is normal for slow queries`);
      } else {
        console.error(`Cache fetch error for key "${key}":`, err);
      }
      
      // Don't throw timeout errors - just return null
      if (err && typeof err === 'object' && 'code' in err && err.code === '57014') {
        return null;
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, options.ttl]);

  const invalidate = useCallback(() => {
    globalCache.delete(key);
    setData(null);
  }, [key]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Auto-fetch on mount if no cached data
  React.useEffect(() => {
    if (!data && !loading && !globalCache.has(key)) {
      fetchData();
    }
  }, [data, loading, fetchData, key]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    fetchData,
    invalidate,
    refresh,
    isCached: globalCache.has(key)
  };
};

// Hook for manual cache management
export const useCacheManager = () => {
  const clearCache = useCallback(() => {
    globalCache.clear();
  }, []);

  const getStats = useCallback(() => {
    return globalCache.getStats();
  }, []);

  const invalidateKey = useCallback((key: string) => {
    globalCache.delete(key);
  }, []);

  return {
    clearCache,
    getStats,
    invalidateKey
  };
};

export default globalCache;

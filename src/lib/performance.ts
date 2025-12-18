/**
 * Performance Optimization Utilities
 * Provides tools for performance monitoring, optimization, and debugging
 */

import { useEffect, useRef, useCallback } from 'react';

// ============================================================================
// Request Batching
// ============================================================================

type BatchedRequest<T> = {
  key: string;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
};

/**
 * Creates a batching function that combines multiple requests into a single call
 */
export function createBatcher<TInput, TOutput>(
  batchFn: (keys: string[]) => Promise<Map<string, TOutput>>,
  options: {
    maxBatchSize?: number;
    batchWindowMs?: number;
  } = {}
) {
  const { maxBatchSize = 50, batchWindowMs = 10 } = options;

  let queue: BatchedRequest<TOutput>[] = [];
  let timeoutId: NodeJS.Timeout | null = null;

  const processBatch = async () => {
    if (queue.length === 0) return;

    const batch = queue.splice(0, maxBatchSize);
    const keys = batch.map(item => item.key);

    try {
      const results = await batchFn(keys);

      batch.forEach(item => {
        const result = results.get(item.key);
        if (result !== undefined) {
          item.resolve(result);
        } else {
          item.reject(new Error(`No result for key: ${item.key}`));
        }
      });
    } catch (error) {
      batch.forEach(item => {
        item.reject(error as Error);
      });
    }

    // Process remaining items if queue is not empty
    if (queue.length > 0) {
      timeoutId = setTimeout(processBatch, 0);
    }
  };

  return (key: string): Promise<TOutput> => {
    return new Promise((resolve, reject) => {
      queue.push({ key, resolve, reject });

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (queue.length >= maxBatchSize) {
        // Process immediately if batch is full
        processBatch();
      } else {
        // Wait for batch window
        timeoutId = setTimeout(processBatch, batchWindowMs);
      }
    });
  };
}

// ============================================================================
// Prefetching
// ============================================================================

/**
 * Prefetch data on link hover
 */
export function usePrefetchOnHover<T>(
  prefetchFn: () => Promise<T>,
  delay: number = 100
) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      prefetchFn();
    }, delay);
  }, [prefetchFn, delay]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { handleMouseEnter, handleMouseLeave };
}

/**
 * Prefetch data when element enters viewport
 */
export function usePrefetchOnVisible<T>(
  prefetchFn: () => Promise<T>,
  options: IntersectionObserverInit = {}
) {
  const ref = useRef<HTMLElement>(null);
  const hasPrefetched = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasPrefetched.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPrefetched.current) {
          hasPrefetched.current = true;
          prefetchFn();
        }
      },
      {
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [prefetchFn, options]);

  return ref;
}

// ============================================================================
// Performance Monitoring
// ============================================================================

interface PerformanceMetrics {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
}

/**
 * Measure performance of async operations
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>,
  onComplete?: (metrics: PerformanceMetrics) => void
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    const metrics: PerformanceMetrics = {
      name,
      duration,
      startTime,
      endTime,
    };

    if (onComplete) {
      onComplete(metrics);
    }

    // Log slow operations in development
    if (import.meta.env.DEV && duration > 1000) {
      console.warn(`Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    const endTime = performance.now();
    if (import.meta.env.DEV) {
      console.error(`Operation failed: ${name} (${(endTime - startTime).toFixed(2)}ms)`, error);
    }
    throw error;
  }
}

/**
 * Hook to measure component render time
 */
export function useRenderTime(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = performance.now() - startTime.current;

    if (import.meta.env.DEV && renderTime > 16) {
      console.warn(
        `Slow render: ${componentName} render #${renderCount.current} took ${renderTime.toFixed(2)}ms`
      );
    }

    startTime.current = performance.now();
  });
}

// ============================================================================
// Lazy Loading
// ============================================================================

/**
 * Lazy load images when they enter viewport
 */
export function useLazyImage(src: string, options: IntersectionObserverInit = {}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || hasLoaded.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded.current) {
          hasLoaded.current = true;
          img.src = src;
        }
      },
      {
        rootMargin: '100px',
        ...options,
      }
    );

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, [src, options]);

  return imgRef;
}

// ============================================================================
// Memoization
// ============================================================================

/**
 * Create a memoized version of a function with custom cache
 */
export function memoize<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => TResult,
  options: {
    getCacheKey?: (...args: TArgs) => string;
    maxSize?: number;
  } = {}
): (...args: TArgs) => TResult {
  const { getCacheKey = (...args) => JSON.stringify(args), maxSize = 100 } = options;

  const cache = new Map<string, TResult>();
  const keys: string[] = [];

  return (...args: TArgs): TResult => {
    const key = getCacheKey(...args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    keys.push(key);

    // Implement LRU eviction
    if (keys.length > maxSize) {
      const oldestKey = keys.shift()!;
      cache.delete(oldestKey);
    }

    return result;
  };
}

/**
 * Async memoization with TTL
 */
export function memoizeAsync<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: {
    getCacheKey?: (...args: TArgs) => string;
    ttlMs?: number;
    maxSize?: number;
  } = {}
): (...args: TArgs) => Promise<TResult> {
  const {
    getCacheKey = (...args) => JSON.stringify(args),
    ttlMs = 60000,
    maxSize = 100,
  } = options;

  const cache = new Map<string, { value: TResult; expiry: number }>();
  const keys: string[] = [];

  return async (...args: TArgs): Promise<TResult> => {
    const key = getCacheKey(...args);
    const now = Date.now();

    const cached = cache.get(key);
    if (cached && cached.expiry > now) {
      return cached.value;
    }

    const result = await fn(...args);
    cache.set(key, { value: result, expiry: now + ttlMs });
    keys.push(key);

    // Implement LRU eviction
    if (keys.length > maxSize) {
      const oldestKey = keys.shift()!;
      cache.delete(oldestKey);
    }

    return result;
  };
}

// ============================================================================
// Debounce & Throttle
// ============================================================================

/**
 * Creates a debounced function that delays invoking until after wait milliseconds
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), waitMs);
  };
}

/**
 * Creates a throttled function that only invokes at most once per wait milliseconds
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= waitMs) {
      lastCall = now;
      fn(...args);
    }
  };
}

// ============================================================================
// Virtual Scrolling Helper
// ============================================================================

/**
 * Calculate visible items for virtual scrolling
 */
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const end = Math.min(totalItems, start + visibleCount + overscan * 2);

  return { start, end };
}

// ============================================================================
// Web Vitals
// ============================================================================

/**
 * Report Web Vitals metrics
 */
export function reportWebVitals(onPerfEntry?: (metric: any) => void) {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onFID(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
}

// ============================================================================
// Code Splitting Helper
// ============================================================================

/**
 * Preload a lazy-loaded component
 */
export function preloadComponent(
  importFn: () => Promise<any>
): () => Promise<any> {
  let preloaded: Promise<any> | null = null;

  return () => {
    if (!preloaded) {
      preloaded = importFn();
    }
    return preloaded;
  };
}

// ============================================================================
// Resource Hints
// ============================================================================

/**
 * Add DNS prefetch hint
 */
export function prefetchDNS(hostname: string) {
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = `//${hostname}`;
  document.head.appendChild(link);
}

/**
 * Add preconnect hint
 */
export function preconnect(url: string) {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Add prefetch hint for future navigation
 */
export function prefetchResource(url: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

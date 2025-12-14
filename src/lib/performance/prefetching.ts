import { useEffect, useRef, useCallback } from "react";

interface PrefetchOptions {
  priority?: "high" | "low" | "auto";
  cache?: boolean;
  timeout?: number;
}

export class Prefetcher {
  private cache = new Map<string, any>();
  private inFlightRequests = new Map<string, Promise<any>>();

  async prefetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: PrefetchOptions = {}
  ): Promise<T> {
    const { cache = true, timeout = 10000 } = options;

    if (cache && this.cache.has(key)) {
      return this.cache.get(key);
    }

    if (this.inFlightRequests.has(key)) {
      return this.inFlightRequests.get(key);
    }

    const promise = Promise.race([
      fetchFn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Prefetch timeout")), timeout)
      ),
    ]);

    this.inFlightRequests.set(key, promise);

    try {
      const result = await promise;
      if (cache) {
        this.cache.set(key, result);
      }
      return result;
    } finally {
      this.inFlightRequests.delete(key);
    }
  }

  getCached<T>(key: string): T | undefined {
    return this.cache.get(key);
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  invalidateAll() {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}

export const prefetcher = new Prefetcher();

interface UsePrefetchOptions<T> {
  enabled?: boolean;
  cache?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function usePrefetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: UsePrefetchOptions<T> = {}
) {
  const { enabled = true, cache = true, onSuccess, onError } = options;
  const hasRun = useRef(false);

  useEffect(() => {
    if (!enabled || hasRun.current) return;

    hasRun.current = true;

    prefetcher
      .prefetch(key, fetchFn, { cache })
      .then((data) => {
        onSuccess?.(data);
      })
      .catch((error) => {
        onError?.(error);
      });
  }, [key, fetchFn, enabled, cache, onSuccess, onError]);

  const getCached = useCallback(() => {
    return prefetcher.getCached<T>(key);
  }, [key]);

  const invalidate = useCallback(() => {
    prefetcher.invalidate(key);
  }, [key]);

  return {
    getCached,
    invalidate,
  };
}

interface UsePrefetchOnHoverOptions<T> {
  delay?: number;
  cache?: boolean;
  onSuccess?: (data: T) => void;
}

export function usePrefetchOnHover<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: UsePrefetchOnHoverOptions<T> = {}
) {
  const { delay = 100, cache = true, onSuccess } = options;
  const timeoutRef = useRef<NodeJS.Timeout>();
  const hasPrefetched = useRef(false);

  const startPrefetch = useCallback(() => {
    if (hasPrefetched.current) return;

    timeoutRef.current = setTimeout(() => {
      hasPrefetched.current = true;
      prefetcher.prefetch(key, fetchFn, { cache }).then(onSuccess);
    }, delay);
  }, [key, fetchFn, cache, delay, onSuccess]);

  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handlers = {
    onMouseEnter: startPrefetch,
    onMouseLeave: cancelPrefetch,
    onTouchStart: startPrefetch,
  };

  return handlers;
}

interface UsePrefetchOnVisibleOptions<T> {
  threshold?: number;
  rootMargin?: string;
  cache?: boolean;
  onSuccess?: (data: T) => void;
}

export function usePrefetchOnVisible<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: UsePrefetchOnVisibleOptions<T> = {}
) {
  const {
    threshold = 0.1,
    rootMargin = "200px",
    cache = true,
    onSuccess,
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const hasPrefetched = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasPrefetched.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasPrefetched.current) {
          hasPrefetched.current = true;
          prefetcher.prefetch(key, fetchFn, { cache }).then(onSuccess);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [key, fetchFn, cache, threshold, rootMargin, onSuccess]);

  return elementRef;
}

interface LinkPrefetchOptions {
  priority?: "high" | "low" | "auto";
}

export function prefetchLink(href: string, options: LinkPrefetchOptions = {}) {
  const { priority = "low" } = options;

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = href;
  link.as = "document";

  if (priority === "high") {
    link.setAttribute("importance", "high");
  }

  document.head.appendChild(link);

  return () => {
    document.head.removeChild(link);
  };
}

export function preconnect(origin: string) {
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = origin;
  link.crossOrigin = "anonymous";

  document.head.appendChild(link);

  return () => {
    document.head.removeChild(link);
  };
}

export function dnsPrefetch(origin: string) {
  const link = document.createElement("link");
  link.rel = "dns-prefetch";
  link.href = origin;

  document.head.appendChild(link);

  return () => {
    document.head.removeChild(link);
  };
}

interface RoutePredictor {
  predict(currentPath: string): string[];
}

export class SimpleRoutePredictor implements RoutePredictor {
  private patterns: Map<string, string[]> = new Map();

  learn(fromPath: string, toPath: string) {
    const existing = this.patterns.get(fromPath) || [];
    if (!existing.includes(toPath)) {
      this.patterns.set(fromPath, [...existing, toPath]);
    }
  }

  predict(currentPath: string): string[] {
    return this.patterns.get(currentPath) || [];
  }
}

export const routePredictor = new SimpleRoutePredictor();

interface UsePredictiveLoadingOptions {
  maxPredictions?: number;
  minConfidence?: number;
}

export function usePredictiveLoading(
  currentPath: string,
  options: UsePredictiveLoadingOptions = {}
) {
  const { maxPredictions = 3 } = options;

  useEffect(() => {
    const predictions = routePredictor.predict(currentPath).slice(0, maxPredictions);

    predictions.forEach((path) => {
      prefetchLink(path, { priority: "low" });
    });
  }, [currentPath, maxPredictions]);
}

export class ResourceHintManager {
  private hints = new Set<HTMLLinkElement>();

  prefetchResource(href: string, as?: string) {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    if (as) link.as = as;

    document.head.appendChild(link);
    this.hints.add(link);

    return () => this.removeHint(link);
  }

  preloadResource(href: string, as: string) {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = as;

    document.head.appendChild(link);
    this.hints.add(link);

    return () => this.removeHint(link);
  }

  preconnectOrigin(origin: string) {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = origin;

    document.head.appendChild(link);
    this.hints.add(link);

    return () => this.removeHint(link);
  }

  private removeHint(link: HTMLLinkElement) {
    if (document.head.contains(link)) {
      document.head.removeChild(link);
    }
    this.hints.delete(link);
  }

  clearAll() {
    this.hints.forEach((link) => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    });
    this.hints.clear();
  }
}

export const resourceHintManager = new ResourceHintManager();

interface UseResourceHintsOptions {
  images?: string[];
  scripts?: string[];
  styles?: string[];
  fonts?: string[];
  origins?: string[];
}

export function useResourceHints(options: UseResourceHintsOptions) {
  const {
    images = [],
    scripts = [],
    styles = [],
    fonts = [],
    origins = [],
  } = options;

  useEffect(() => {
    const cleanupFns: Array<() => void> = [];

    images.forEach((src) => {
      cleanupFns.push(resourceHintManager.prefetchResource(src, "image"));
    });

    scripts.forEach((src) => {
      cleanupFns.push(resourceHintManager.preloadResource(src, "script"));
    });

    styles.forEach((href) => {
      cleanupFns.push(resourceHintManager.preloadResource(href, "style"));
    });

    fonts.forEach((href) => {
      cleanupFns.push(resourceHintManager.preloadResource(href, "font"));
    });

    origins.forEach((origin) => {
      cleanupFns.push(resourceHintManager.preconnectOrigin(origin));
    });

    return () => {
      cleanupFns.forEach((cleanup) => cleanup());
    };
  }, [images, scripts, styles, fonts, origins]);
}

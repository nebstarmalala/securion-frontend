import { useState, useEffect, useCallback } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

interface CacheOptions {
  maxAge?: number; // in milliseconds
  staleWhileRevalidate?: boolean;
}

export function useOfflineCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
) {
  const { maxAge = 5 * 60 * 1000, staleWhileRevalidate = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  const isOnline = useOnlineStatus();

  const cacheKey = `offline-cache-${key}`;
  const timestampKey = `${cacheKey}-timestamp`;

  const getCachedData = useCallback(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      const timestamp = localStorage.getItem(timestampKey);

      if (!cached || !timestamp) return null;

      const age = Date.now() - parseInt(timestamp, 10);
      const cachedData = JSON.parse(cached) as T;

      if (age > maxAge) {
        setIsStale(true);
        if (!staleWhileRevalidate) {
          return null;
        }
      }

      return cachedData;
    } catch (error) {
      console.error("Failed to read from cache:", error);
      return null;
    }
  }, [cacheKey, timestampKey, maxAge, staleWhileRevalidate]);

  const setCachedData = useCallback(
    (newData: T) => {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(newData));
        localStorage.setItem(timestampKey, Date.now().toString());
        setIsStale(false);
      } catch (error) {
        console.error("Failed to write to cache:", error);
      }
    },
    [cacheKey, timestampKey]
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      setCachedData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, setCachedData]);

  const refetch = useCallback(async () => {
    if (!isOnline) {
      const cached = getCachedData();
      if (cached) {
        setData(cached);
        return cached;
      }
      throw new Error("No cached data available offline");
    }

    return fetchData();
  }, [isOnline, getCachedData, fetchData]);

  useEffect(() => {
    const cached = getCachedData();

    if (cached) {
      setData(cached);
    }

    if (isOnline) {
      if (!cached || isStale || staleWhileRevalidate) {
        fetchData();
      }
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    isStale,
    isOnline,
    refetch,
  };
}

export function useOfflineQueue<T extends { id: string }>(storageKey: string) {
  const [queue, setQueue] = useState<T[]>([]);
  const isOnline = useOnlineStatus();

  const loadQueue = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setQueue(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load queue:", error);
    }
  }, [storageKey]);

  const saveQueue = useCallback(
    (items: T[]) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(items));
        setQueue(items);
      } catch (error) {
        console.error("Failed to save queue:", error);
      }
    },
    [storageKey]
  );

  const addToQueue = useCallback(
    (item: T) => {
      const updated = [...queue, item];
      saveQueue(updated);
    },
    [queue, saveQueue]
  );

  const removeFromQueue = useCallback(
    (id: string) => {
      const updated = queue.filter((item) => item.id !== id);
      saveQueue(updated);
    },
    [queue, saveQueue]
  );

  const processQueue = useCallback(
    async (processFn: (item: T) => Promise<void>) => {
      if (!isOnline || queue.length === 0) return;

      for (const item of queue) {
        try {
          await processFn(item);
          removeFromQueue(item.id);
        } catch (error) {
          console.error("Failed to process queue item:", error);
          break;
        }
      }
    },
    [isOnline, queue, removeFromQueue]
  );

  const clearQueue = useCallback(() => {
    saveQueue([]);
  }, [saveQueue]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  return {
    queue,
    addToQueue,
    removeFromQueue,
    processQueue,
    clearQueue,
    hasItems: queue.length > 0,
  };
}

interface OfflineAction {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
  retryCount: number;
}

export function useOfflineActions() {
  const storageKey = "offline-actions-queue";
  const { queue, addToQueue, removeFromQueue, clearQueue } =
    useOfflineQueue<OfflineAction>(storageKey);
  const isOnline = useOnlineStatus();

  const queueAction = useCallback(
    (type: string, payload: unknown) => {
      const action: OfflineAction = {
        id: `action-${Date.now()}-${Math.random()}`,
        type,
        payload,
        timestamp: Date.now(),
        retryCount: 0,
      };

      addToQueue(action);
    },
    [addToQueue]
  );

  const processActions = useCallback(
    async (handlers: Record<string, (payload: unknown) => Promise<void>>) => {
      if (!isOnline || queue.length === 0) return;

      for (const action of queue) {
        const handler = handlers[action.type];
        if (!handler) {
          console.warn(`No handler for action type: ${action.type}`);
          removeFromQueue(action.id);
          continue;
        }

        try {
          await handler(action.payload);
          removeFromQueue(action.id);
        } catch (error) {
          console.error(`Failed to process action ${action.type}:`, error);

          if (action.retryCount >= 3) {
            console.error("Max retries reached, removing action");
            removeFromQueue(action.id);
          }
          break;
        }
      }
    },
    [isOnline, queue, removeFromQueue]
  );

  return {
    queueAction,
    processActions,
    pendingActions: queue,
    clearActions: clearQueue,
    hasPendingActions: queue.length > 0,
  };
}

export function useOfflineStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error("Failed to read from storage:", error);
      return initialValue;
    }
  });

  const setStoredValue = useCallback(
    (newValue: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          newValue instanceof Function ? newValue(value) : newValue;

        setValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error("Failed to write to storage:", error);
      }
    },
    [key, value]
  );

  const removeStoredValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setValue(initialValue);
    } catch (error) {
      console.error("Failed to remove from storage:", error);
    }
  }, [key, initialValue]);

  return [value, setStoredValue, removeStoredValue] as const;
}

export function useServiceWorker() {
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      setIsSupported(true);

      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const update = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  }, [registration]);

  return {
    isSupported,
    registration,
    updateAvailable,
    update,
  };
}

export function useCacheSize() {
  const [size, setSize] = useState(0);

  const calculateSize = useCallback(() => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const item = localStorage.getItem(key);
        if (item) {
          total += key.length + item.length;
        }
      }
    }
    setSize(total);
  }, []);

  useEffect(() => {
    calculateSize();
  }, [calculateSize]);

  const sizeInKB = (size / 1024).toFixed(2);
  const sizeInMB = (size / (1024 * 1024)).toFixed(2);

  return {
    bytes: size,
    kb: sizeInKB,
    mb: sizeInMB,
    recalculate: calculateSize,
  };
}

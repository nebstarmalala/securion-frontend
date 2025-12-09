import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  revertDelay?: number;
}

interface OptimisticState<T> {
  data: T;
  isOptimistic: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useOptimisticUpdate<T, TArgs extends unknown[]>(
  initialData: T,
  mutationFn: (...args: TArgs) => Promise<T>,
  options: OptimisticUpdateOptions<T> = {}
) {
  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    revertDelay = 3000,
  } = options;

  const { toast } = useToast();
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isOptimistic: false,
    isLoading: false,
    error: null,
  });

  const previousDataRef = useRef<T>(initialData);
  const revertTimerRef = useRef<NodeJS.Timeout>();

  const mutate = useCallback(
    async (optimisticData: T, ...args: TArgs) => {
      previousDataRef.current = state.data;

      setState({
        data: optimisticData,
        isOptimistic: true,
        isLoading: true,
        error: null,
      });

      if (revertTimerRef.current) {
        clearTimeout(revertTimerRef.current);
      }

      try {
        const result = await mutationFn(...args);

        setState({
          data: result,
          isOptimistic: false,
          isLoading: false,
          error: null,
        });

        if (successMessage) {
          toast({
            title: "Success",
            description: successMessage,
          });
        }

        onSuccess?.(result);

        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Unknown error");

        revertTimerRef.current = setTimeout(() => {
          setState({
            data: previousDataRef.current,
            isOptimistic: false,
            isLoading: false,
            error: err,
          });
        }, revertDelay);

        if (errorMessage) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }

        onError?.(err);

        throw err;
      }
    },
    [state.data, mutationFn, onSuccess, onError, successMessage, errorMessage, revertDelay, toast]
  );

  const reset = useCallback(() => {
    if (revertTimerRef.current) {
      clearTimeout(revertTimerRef.current);
    }
    setState({
      data: initialData,
      isOptimistic: false,
      isLoading: false,
      error: null,
    });
  }, [initialData]);

  const revert = useCallback(() => {
    if (revertTimerRef.current) {
      clearTimeout(revertTimerRef.current);
    }
    setState({
      data: previousDataRef.current,
      isOptimistic: false,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    data: state.data,
    isOptimistic: state.isOptimistic,
    isLoading: state.isLoading,
    error: state.error,
    mutate,
    reset,
    revert,
  };
}

export function useOptimisticList<T extends { id: string | number }>(
  initialList: T[]
) {
  const [items, setItems] = useState(initialList);
  const [optimisticItems, setOptimisticItems] = useState<Set<string | number>>(
    new Set()
  );
  const { toast } = useToast();

  const addOptimistic = useCallback((item: T) => {
    setItems((prev) => [item, ...prev]);
    setOptimisticItems((prev) => new Set(prev).add(item.id));
  }, []);

  const updateOptimistic = useCallback((id: string | number, updates: Partial<T>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    setOptimisticItems((prev) => new Set(prev).add(id));
  }, []);

  const removeOptimistic = useCallback((id: string | number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setOptimisticItems((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const confirmAdd = useCallback(
    (tempId: string | number, serverItem: T) => {
      setItems((prev) =>
        prev.map((item) => (item.id === tempId ? serverItem : item))
      );
      setOptimisticItems((prev) => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });
    },
    []
  );

  const confirmUpdate = useCallback((id: string | number) => {
    setOptimisticItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const confirmRemove = useCallback((id: string | number) => {
    setOptimisticItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const revertAdd = useCallback((id: string | number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setOptimisticItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast({
      title: "Failed to add item",
      description: "The item could not be added. Please try again.",
      variant: "destructive",
    });
  }, [toast]);

  const revertUpdate = useCallback(
    (id: string | number, originalItem: T) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? originalItem : item))
      );
      setOptimisticItems((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast({
        title: "Failed to update item",
        description: "The changes could not be saved. Please try again.",
        variant: "destructive",
      });
    },
    [toast]
  );

  const revertRemove = useCallback(
    (item: T) => {
      setItems((prev) => [item, ...prev]);
      setOptimisticItems((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      toast({
        title: "Failed to remove item",
        description: "The item could not be removed. Please try again.",
        variant: "destructive",
      });
    },
    [toast]
  );

  const isOptimistic = useCallback(
    (id: string | number) => optimisticItems.has(id),
    [optimisticItems]
  );

  return {
    items,
    setItems,
    addOptimistic,
    updateOptimistic,
    removeOptimistic,
    confirmAdd,
    confirmUpdate,
    confirmRemove,
    revertAdd,
    revertUpdate,
    revertRemove,
    isOptimistic,
  };
}

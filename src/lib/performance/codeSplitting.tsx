import { lazy, Suspense, ComponentType } from "react";
import { SkeletonCard, SkeletonList, SkeletonForm, SkeletonDetails } from "@/components/feedback";

interface LazyLoadOptions {
  fallback?: React.ReactNode;
  delay?: number;
}

export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): T {
  const { fallback = <SkeletonCard />, delay = 0 } = options;

  const LazyComponent = lazy(() => {
    if (delay > 0) {
      return Promise.all([
        importFn(),
        new Promise((resolve) => setTimeout(resolve, delay)),
      ]).then(([module]) => module);
    }
    return importFn();
  });

  return ((props: any) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  )) as T;
}

export function lazyLoadWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions & { maxRetries?: number } = {}
): T {
  const { fallback = <SkeletonCard />, maxRetries = 3 } = options;

  const LazyComponent = lazy(() => {
    return retryImport(importFn, maxRetries);
  });

  return ((props: any) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  )) as T;
}

async function retryImport<T>(
  importFn: () => Promise<T>,
  retries: number,
  delay: number = 1000
): Promise<T> {
  try {
    return await importFn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryImport(importFn, retries - 1, delay * 2);
  }
}

interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  variant?: "card" | "list" | "form" | "details" | "custom";
}

export function SuspenseWrapper({
  children,
  fallback,
  variant = "card",
}: SuspenseWrapperProps) {
  const getFallback = () => {
    if (fallback) return fallback;

    switch (variant) {
      case "list":
        return <SkeletonList items={5} />;
      case "form":
        return <SkeletonForm />;
      case "details":
        return <SkeletonDetails />;
      case "card":
      default:
        return <SkeletonCard />;
    }
  };

  return <Suspense fallback={getFallback()}>{children}</Suspense>;
}

export function preloadComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>
) {
  importFn();
}

export function preloadMultiple(
  importFns: Array<() => Promise<{ default: ComponentType<any> }>>
) {
  importFns.forEach((fn) => fn());
}

interface RoutePreloadConfig {
  path: string;
  import: () => Promise<{ default: ComponentType<any> }>;
  preloadOn?: "hover" | "mount" | "visible";
}

export function useRoutePreload(routes: RoutePreloadConfig[]) {
  const preloadRoute = (path: string) => {
    const route = routes.find((r) => r.path === path);
    if (route) {
      route.import();
    }
  };

  const preloadOnHover = (path: string) => {
    return {
      onMouseEnter: () => preloadRoute(path),
      onTouchStart: () => preloadRoute(path),
    };
  };

  return {
    preloadRoute,
    preloadOnHover,
  };
}

export function createLazyRoute(
  importFn: () => Promise<{ default: ComponentType<any> }>,
  fallback?: React.ReactNode
) {
  const Component = lazy(importFn);

  return {
    element: (
      <Suspense fallback={fallback || <SkeletonCard />}>
        <Component />
      </Suspense>
    ),
    preload: () => importFn(),
  };
}

interface ChunkInfo {
  name: string;
  size: number;
  loaded: boolean;
}

export class BundleAnalyzer {
  private chunks: Map<string, ChunkInfo> = new Map();

  registerChunk(name: string, size: number) {
    this.chunks.set(name, { name, size, loaded: false });
  }

  markAsLoaded(name: string) {
    const chunk = this.chunks.get(name);
    if (chunk) {
      chunk.loaded = true;
    }
  }

  getTotalSize(): number {
    return Array.from(this.chunks.values()).reduce((acc, chunk) => acc + chunk.size, 0);
  }

  getLoadedSize(): number {
    return Array.from(this.chunks.values())
      .filter((chunk) => chunk.loaded)
      .reduce((acc, chunk) => acc + chunk.size, 0);
  }

  getChunkInfo(): ChunkInfo[] {
    return Array.from(this.chunks.values());
  }
}

export const bundleAnalyzer = new BundleAnalyzer();

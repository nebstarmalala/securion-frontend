import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface AllProvidersProps {
  children: React.ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

export function createMockRouter(pathname: string = "/") {
  return {
    pathname,
    search: "",
    hash: "",
    state: null,
    key: "default",
  };
}

export function createMockApiResponse<T>(data: T, delay: number = 0): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}

export function createMockApiError(
  message: string = "API Error",
  status: number = 500
): Promise<never> {
  return Promise.reject({
    message,
    status,
    response: { data: { message } },
  });
}

export function waitForLoadingToFinish() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

export function setupMockLocalStorage() {
  Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage,
    writable: true,
  });
}

export function setupMockIntersectionObserver() {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return [];
    }
    unobserve() {}
  } as any;
}

export function setupMockResizeObserver() {
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  } as any;
}

export function createMockFile(
  name: string = "test.png",
  size: number = 1024,
  type: string = "image/png"
): File {
  return new File([""], name, { type, lastModified: Date.now() });
}

export function mockFetch(data: any, status: number = 200) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
      headers: new Headers(),
    } as Response)
  );
}

export function mockFetchError(message: string = "Network error", status: number = 500) {
  global.fetch = vi.fn(() =>
    Promise.reject({
      message,
      status,
    })
  );
}

export async function waitForElement(callback: () => HTMLElement | null, timeout: number = 1000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const element = callback();
    if (element) return element;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error("Element not found within timeout");
}

export function createMockUser(overrides = {}) {
  return {
    id: "1",
    username: "testuser",
    email: "test@example.com",
    roles: [{ id: "1", name: "User" }],
    permissions: [],
    ...overrides,
  };
}

export function createMockProject(overrides = {}) {
  return {
    id: "1",
    name: "Test Project",
    description: "A test project",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockFinding(overrides = {}) {
  return {
    id: "1",
    title: "SQL Injection",
    description: "SQL injection vulnerability",
    severity: "critical",
    status: "open",
    cvss: 9.8,
    projectId: "1",
    scopeId: "1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function setupTestEnvironment() {
  setupMockLocalStorage();
  setupMockIntersectionObserver();
  setupMockResizeObserver();
}

export function cleanupTestEnvironment() {
  mockLocalStorage.clear();
  vi.clearAllMocks();
}

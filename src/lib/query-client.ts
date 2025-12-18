import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { handleError, isAuthError, isServerError } from './errors';

const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (isAuthError(error)) {
        return false;
      }

      // Retry server errors up to 3 times
      if (isServerError(error)) {
        return failureCount < 3;
      }

      // Retry other errors once
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * Math.pow(2, attemptIndex), 30000);
    },
  },
  mutations: {
    retry: false,
    onError: (error) => {
      // Global error handling for mutations
      if (import.meta.env.DEV) {
        console.error('Mutation error:', error);
      }
      // Note: Individual mutations can override this
    },
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// Query Keys Factory Pattern
export const queryKeys = {
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    overview: () => [...queryKeys.dashboard.all, 'overview'] as const,
    projectStats: () => [...queryKeys.dashboard.all, 'project-stats'] as const,
    findingStats: () => [...queryKeys.dashboard.all, 'finding-stats'] as const,
    cveStats: () => [...queryKeys.dashboard.all, 'cve-stats'] as const,
    teamStats: () => [...queryKeys.dashboard.all, 'team-stats'] as const,
    trends: (period?: string) => [...queryKeys.dashboard.all, 'trends', period] as const,
  },

  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.projects.lists(), { filters }] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
    activities: (id: string) => [...queryKeys.projects.detail(id), 'activities'] as const,
  },

  // Scopes
  scopes: {
    all: ['scopes'] as const,
    lists: () => [...queryKeys.scopes.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.scopes.lists(), { filters }] as const,
    details: () => [...queryKeys.scopes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.scopes.details(), id] as const,
    activities: (id: string) => [...queryKeys.scopes.detail(id), 'activities'] as const,
  },

  // Findings
  findings: {
    all: ['findings'] as const,
    lists: () => [...queryKeys.findings.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.findings.lists(), { filters }] as const,
    details: () => [...queryKeys.findings.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.findings.details(), id] as const,
    activities: (id: string) => [...queryKeys.findings.detail(id), 'activities'] as const,
  },

  // CVE Tracking
  cveTracking: {
    all: ['cve-tracking'] as const,
    lists: () => [...queryKeys.cveTracking.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.cveTracking.lists(), { filters }] as const,
    details: () => [...queryKeys.cveTracking.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.cveTracking.details(), id] as const,
    statistics: () => [...queryKeys.cveTracking.all, 'statistics'] as const,
  },

  // Comments
  comments: {
    all: ['comments'] as const,
    lists: () => [...queryKeys.comments.all, 'list'] as const,
    list: (type: string, id: string, filters?: any) =>
      [...queryKeys.comments.lists(), type, id, { filters }] as const,
  },

  // Activities
  activities: {
    all: ['activities'] as const,
    feed: (filters?: any) => [...queryKeys.activities.all, 'feed', { filters }] as const,
    me: (filters?: any) => [...queryKeys.activities.all, 'me', { filters }] as const,
    user: (userId: string, filters?: any) =>
      [...queryKeys.activities.all, 'user', userId, { filters }] as const,
    stats: (period?: string) => [...queryKeys.activities.all, 'stats', period] as const,
    recentCount: (since?: string) =>
      [...queryKeys.activities.all, 'recent-count', since] as const,
  },

  // Attachments
  attachments: {
    all: ['attachments'] as const,
    lists: () => [...queryKeys.attachments.all, 'list'] as const,
    list: (entityType: string, entityId: string) =>
      [...queryKeys.attachments.lists(), entityType, entityId] as const,
    details: () => [...queryKeys.attachments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.attachments.details(), id] as const,
  },

  // Search
  search: {
    all: ['search'] as const,
    global: (query: string, filters?: any) =>
      [...queryKeys.search.all, 'global', query, { filters }] as const,
    suggestions: (query: string, limit?: number) =>
      [...queryKeys.search.all, 'suggestions', query, limit] as const,
    quickFilters: () => [...queryKeys.search.all, 'quick-filters'] as const,
    byType: (type: string, query: string, filters?: any) =>
      [...queryKeys.search.all, 'by-type', type, query, { filters }] as const,
  },

  // Saved Searches
  savedSearches: {
    all: ['saved-searches'] as const,
    lists: () => [...queryKeys.savedSearches.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.savedSearches.lists(), { filters }] as const,
    details: () => [...queryKeys.savedSearches.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.savedSearches.details(), id] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.notifications.lists(), { filters }] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
    preferences: () => [...queryKeys.notifications.all, 'preferences'] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
};

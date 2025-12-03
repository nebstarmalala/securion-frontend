/**
 * Centralized Hooks Export
 *
 * All React Query hooks and utility hooks are exported from this file.
 * Import hooks using: import { useHookName } from "@/hooks"
 */

// =============================================================================
// Dashboard & Overview
// =============================================================================
export * from "./useDashboard"

// =============================================================================
// Entity Management Hooks
// =============================================================================
export * from "./useProjects"
export * from "./use-scopes"
export * from "./use-findings"
export * from "./use-cve-tracking"
export * from "./useUsers"

// =============================================================================
// Collaboration Features
// =============================================================================
export * from "./useNotifications"
export * from "./useActivities"
export * from "./useComments"
export * from "./useAttachments"
export * from "./useSearch"

// =============================================================================
// Utility Hooks
// =============================================================================
export * from "./use-debounce"
export * from "./use-pagination"
export * from "./use-infinite-scroll"
export * from "./use-file-upload"
export * from "./use-mobile"
export * from "./use-toast"

// =============================================================================
// Form Utilities (Phase 6)
// =============================================================================
export * from "./useAutoSave"
export * from "./useSmartDefaults"

// =============================================================================
// Re-exports from @/lib/hooks for features not yet migrated
// These will be gradually moved to this directory
// =============================================================================

// Reports & Templates
export {
  useReports,
  useReport,
  useReportTypes,
  useReportStatus,
  useProjectReports,
  useGenerateReport,
  useDeleteReport,
  useDownloadReport,
  useSavedReportTemplates,
  useSavedReportTemplate,
  usePublicReportTemplates,
  useMyReportTemplates,
  useCreateSavedReportTemplate,
  useUpdateSavedReportTemplate,
  useDeleteSavedReportTemplate,
  useGenerateFromTemplate,
  useExportProjects,
  useExportFindings,
  useExportScopes,
  useExportCVEs,
  usePrefetchReport,
  usePrefetchSavedReportTemplate,
  useReportManagement,
  useSavedReportTemplateManagement,
  reportKeys,
} from "@/lib/hooks/useReports"

// Templates (Project, Finding, Scope)
export {
  // Project Templates
  useProjectTemplates,
  useProjectTemplate,
  usePublicProjectTemplates,
  useCreateProjectTemplate,
  useUpdateProjectTemplate,
  useDeleteProjectTemplate,
  useUseProjectTemplate,
  usePrefetchProjectTemplate,
  useProjectTemplateManagement,
  // Finding Templates
  useFindingTemplates,
  useFindingTemplate,
  usePublicFindingTemplates,
  useFindingTemplatesBySeverity,
  useCreateFindingTemplate,
  useUpdateFindingTemplate,
  useDeleteFindingTemplate,
  useUseFindingTemplate,
  usePrefetchFindingTemplate,
  useFindingTemplateManagement,
  // Scope Templates
  useScopeTemplates,
  useScopeTemplate,
  usePublicScopeTemplates,
  useScopeTemplatesByType,
  useCreateScopeTemplate,
  useUpdateScopeTemplate,
  useDeleteScopeTemplate,
  useUseScopeTemplate,
  usePrefetchScopeTemplate,
  useScopeTemplateManagement,
  // Combined
  useAllTemplates,
  templateKeys,
} from "@/lib/hooks/useTemplates"

// Workflows
export {
  useWorkflows,
  useWorkflow,
  useActiveWorkflows,
  useWorkflowsByTrigger,
  useCreateWorkflow,
  useUpdateWorkflow,
  useDeleteWorkflow,
  useToggleWorkflow,
  useTestWorkflow,
  useExecuteWorkflow,
  useWorkflowExecutions,
  useAllWorkflowExecutions,
  useWorkflowExecution,
  useWorkflowExecutionStats,
  usePrefetchWorkflow,
  useWorkflowManagement,
  useWorkflowExecutionMonitoring,
  workflowKeys,
} from "@/lib/hooks/useWorkflows"

// Webhooks
export {
  useWebhooks,
  useWebhook,
  useWebhookEvents,
  useActiveWebhooks,
  useWebhooksByEvent,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useToggleWebhook,
  useTestWebhook,
  useRegenerateWebhookSecret,
  useWebhookDeliveries,
  useWebhookDelivery,
  useRetryWebhookDelivery,
  usePrefetchWebhook,
  useWebhookManagement,
  useWebhookDeliveryMonitoring,
  webhookKeys,
} from "@/lib/hooks/useWebhooks"

// Integrations
export {
  useIntegrations,
  // Slack
  useTestSlack,
  useSendFindingToSlack,
  useSlackIntegration,
  // Jira
  useTestJira,
  useCreateJiraIssue,
  useJiraTransitions,
  useUpdateJiraStatus,
  useJiraIntegration,
  // GitHub
  useTestGitHub,
  useCreateGitHubIssue,
  useCloseGitHubIssue,
  useGitHubIntegration,
  // Teams
  useTestTeams,
  useSendFindingToTeams,
  useTeamsIntegration,
} from "@/lib/hooks/useIntegrations"

// Cache Management (Admin)
export {
  useCacheStatistics,
  useCacheHealth,
  useIsCacheHealthy,
  useCacheMemoryUsage,
  useCacheHitRate,
  useClearAllCache,
  useClearCacheByType,
  useClearCacheByTags,
  useWarmDashboardCache,
  useWarmStatisticsCache,
  useWarmAllCaches,
  useCacheManagement,
  cacheKeys,
} from "@/lib/hooks/useCache"

// Queue Management (Admin)
export {
  useQueueStatus,
  useQueueMetrics,
  useQueueJobs,
  useFailedJobs,
  useIsQueueHealthy,
  useTotalPendingJobs,
  useTotalFailedJobs,
  useQueueSuccessRate,
  useJobsByQueue,
  useFailedJobsByQueue,
  useRetryJob,
  useRetryMultipleJobs,
  useClearFailedJobs,
  useRetryAllFailedJobs,
  useQueueManagement,
  queueKeys,
} from "@/lib/hooks/useQueue"

// Saved Searches
export {
  useSavedSearches,
  useSavedSearch,
  usePublicSavedSearches,
  useMySavedSearches,
  useSavedSearchesByType,
  useMostUsedSavedSearches,
  useCreateSavedSearch,
  useUpdateSavedSearch,
  useDeleteSavedSearch,
  useExecuteSavedSearch,
  usePrefetchSavedSearch,
  useSavedSearchesManagement,
  savedSearchKeys,
} from "@/lib/hooks/useSavedSearches"

// Search
export {
  useGlobalSearch,
  useDebouncedGlobalSearch,
  useSearchByType,
  useDebouncedSearchByType,
  useSearchSuggestions,
  useQuickFilters,
  useExecuteQuickFilter,
  useSearchHistory,
  usePrefetchSearch,
  useCombinedSearch,
  searchKeys,
} from "@/lib/hooks/useSearch"

// CVEs (enhanced version from lib)
export {
  useCVE,
  useCVEs,
  useCVEStats,
  useCVEsBySeverity,
  useCVEsByProject,
  useCVEsByScope,
  useAffectedCVEs,
  useCreateCVE,
  useUpdateCVE,
  useDeleteCVE,
  useSyncCVEs,
  useMatchCVE,
  useRematchAllCVEs,
  usePrefetchCVE,
  cveKeys,
} from "@/lib/hooks/useCVEs"

// Scopes (enhanced version from lib)
export {
  useScopes as useScopesEnhanced,
  useScope as useScopeEnhanced,
  useProjectScopes,
  useScopeActivities,
  useInScopeItems,
  useCreateScope as useCreateScopeEnhanced,
  useUpdateScope as useUpdateScopeEnhanced,
  useDeleteScope as useDeleteScopeEnhanced,
  useBulkCreateScopes as useBulkCreateScopesEnhanced,
  usePrefetchScope,
  useScopeManagement,
  scopeKeys,
} from "@/lib/hooks/useScopes"

// Findings (enhanced version from lib)
export {
  useFinding as useFindingEnhanced,
  useFindings as useFindingsEnhanced,
  useScopeFindings,
  useFindingsBySeverity,
  useOpenFindings,
  useCriticalFindings,
  useFindingActivities as useFindingActivitiesEnhanced,
  useCreateFinding as useCreateFindingEnhanced,
  useUpdateFinding as useUpdateFindingEnhanced,
  useUpdateFindingStatus as useUpdateFindingStatusEnhanced,
  useBulkUpdateFindingStatus as useBulkUpdateFindingStatusEnhanced,
  useDeleteFinding as useDeleteFindingEnhanced,
  usePrefetchFinding,
  findingKeys,
} from "@/lib/hooks/useFindings"

// Projects (enhanced version from lib)
export {
  useProjects as useProjectsEnhanced,
  useProject as useProjectEnhanced,
  useProjectActivities as useProjectActivitiesEnhanced,
  useActiveProjects,
  useCreateProject as useCreateProjectEnhanced,
  useUpdateProject as useUpdateProjectEnhanced,
  useDeleteProject as useDeleteProjectEnhanced,
  useAssignUsers as useAssignUsersEnhanced,
  useAssignLead as useAssignLeadEnhanced,
  useUpdateMemberRole as useUpdateMemberRoleEnhanced,
  useRemoveUser as useRemoveUserEnhanced,
  usePrefetchProject,
  useProjectManagement,
  projectKeys,
} from "@/lib/hooks/useProjects"

// Notifications (enhanced version from lib)
export {
  useNotifications as useNotificationsEnhanced,
  useUnreadNotifications,
  useUnreadNotificationCount,
  useFindingNotifications,
  useCommentNotifications,
  useCVENotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification as useDeleteNotificationEnhanced,
  useDeleteAllReadNotifications,
  useNotificationPreferences,
  useUpdateNotificationPreference,
  useBulkUpdateNotificationPreferences,
  useEnableAllNotifications,
  useDisableAllNotifications,
  useResetNotificationPreferences,
  useNotificationManagement,
  useNotificationPreferenceManagement,
  useNotificationBell,
  notificationKeys,
} from "@/lib/hooks/useNotifications"

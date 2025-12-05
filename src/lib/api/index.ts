/**
 * API Services Barrel Export
 * Central export point for all API services
 */

// Core Services
export { apiClient, ApiError } from "./client"
export { authService } from "./auth"
export { dashboardService } from "./dashboard"

// Entity Management Services
export { projectsService } from "./projects"
export { scopesService } from "./scopes"
export { findingsService } from "./findings"
export { usersService } from "./users"

// CVE Tracking Service
export * as cveTrackingService from "./cve-tracking"

// Feature Services
export { searchService } from "./search"
export { activitiesService } from "./activities"
export { commentsService } from "./comments"
export { attachmentsService } from "./attachments"
export { savedSearchesService } from "./saved-searches"
export { notificationsService } from "./notifications"
export { notificationPreferencesService } from "./notification-preferences"

// Reports & Templates Services
export { reportsService } from "./reports"
export { templatesService } from "./templates"

// Automation & Integration Services (Phase 8)
export { workflowsService } from "./workflows"
export { webhooksService } from "./webhooks"
export { integrationsService } from "./integrations"

// System Management Services (Phase 9)
export * as cacheService from "./cache"
export * as queueService from "./queue"

// Types
export type { ApiResponse, PaginatedApiResponse, ValidationErrorResponse } from "./client"

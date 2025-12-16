/**
 * API Type Definitions
 * Matches backend Laravel API response structures
 */

// ===========================
// Authentication Types
// ===========================

export interface Role {
  id: number
  name: string
  display_name?: string
}

export interface Permission {
  id: number
  name: string
}

export interface ApiUser {
  id: string
  username: string
  email: string
  name?: string // Display name
  avatar?: string // Avatar URL
  is_active: boolean
  last_login: string | null
  roles: Role[]
  permissions: Permission[]
  created_at: string
  updated_at: string
  created_at_human?: string
}

// Alias for backward compatibility
export type User = ApiUser

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  user: ApiUser
  token: string
  token_type: string
}

// ===========================
// Project Types
// ===========================

export interface ApiProject {
  id: string
  name: string
  client: string
  description: string | null
  status: "planning" | "active" | "on-hold" | "completed" | "cancelled"
  test_type: string | null
  start_date: string
  end_date: string
  tags: string[]
  team: any[]
  scope_count: number
  findings_count: {
    critical: number
    high: number
    medium: number
    low: number
    info: number
  }
  progress: number
  last_updated: string
  created_by: string
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

export interface CreateProjectInput {
  name: string
  description?: string
  status: "planning" | "active" | "on-hold" | "completed" | "cancelled"
  start_date: string
  end_date: string
  created_by: string
  tags?: string[]
  metadata?: {
    client?: string
    testType?: "black-box" | "white-box" | "gray-box"
    [key: string]: any
  }
}

export interface UpdateProjectInput extends Partial<Omit<CreateProjectInput, 'created_by'>> {}

export interface AssignUsersInput {
  user_ids: string[]
  role?: "member" | "lead"
}

// ===========================
// Scope Types
// ===========================

export interface ScopeService {
  name: string
  version?: string
}

export interface ApiScope {
  id: string
  project_id: string
  name: string
  type: "domain" | "ip" | "subnet" | "service" | "application"
  target: string
  port?: number
  protocol?: string
  status: "in-scope" | "out-of-scope" | "testing" | "completed"
  notes?: string
  services?: ScopeService[]
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface CreateScopeInput {
  project_id: string
  name: string
  type: "domain" | "ip" | "subnet" | "service" | "application"
  target: string
  port?: number
  protocol?: string
  status: "in-scope" | "out-of-scope" | "testing" | "completed"
  notes?: string
  services?: ScopeService[]
  tags?: string[]
}

export interface BulkCreateScopesInput {
  project_id: string
  scopes: Omit<CreateScopeInput, "project_id">[]
}

export interface UpdateScopeInput extends Partial<CreateScopeInput> {}

// ===========================
// Finding Types
// ===========================

export interface CVSS {
  version: string
  score: number
  vector: string
}

export interface ProofOfConcept {
  steps?: string[]
  payload?: string
  screenshot?: string
}

export interface Remediation {
  summary: string
  steps?: string[]
  priority?: string
}

export interface ApiFinding {
  id: string
  project_id: string
  scope_id: string
  title: string
  description: string
  vulnerability_type: string
  severity: "info" | "low" | "medium" | "high" | "critical"
  cvss?: CVSS
  status: "open" | "confirmed" | "false-positive" | "fixed" | "accepted"
  proof_of_concept?: ProofOfConcept
  remediation?: Remediation
  attachments?: string[]
  tags?: string[]
  discovered_by: string
  discovered_at?: string
  last_modified?: string
  cve_references?: string[]
  created_at: string
  updated_at: string
}

export interface CreateFindingInput {
  scope_id: string
  title: string
  description: string
  vulnerability_type: string
  severity: "info" | "low" | "medium" | "high" | "critical"
  cvss?: CVSS
  status: "open" | "confirmed" | "false-positive" | "fixed" | "accepted"
  proof_of_concept?: ProofOfConcept
  remediation?: Remediation
  attachments?: string[]
  tags?: string[]
  discovered_by: string
  discovered_at?: string
  cve_references?: string[]
}

export interface UpdateFindingInput extends Partial<CreateFindingInput> {}

export interface UpdateFindingStatusInput {
  status: "open" | "confirmed" | "false-positive" | "fixed" | "accepted"
}

export interface BulkUpdateFindingStatusInput {
  finding_ids: string[]
  status: "open" | "confirmed" | "false-positive" | "fixed" | "accepted"
}

// ===========================
// User Management Types
// ===========================

export interface CreateUserInput {
  username: string
  email: string
  name?: string
  password: string
  password_confirmation: string
  is_active?: boolean
  role?: string
}

export interface UpdateUserInput {
  username?: string
  email?: string
  name?: string
}

export interface UpdatePasswordInput {
  current_password: string
  password: string
  password_confirmation: string
}

export interface UpdateUserRoleInput {
  role: string
}

export interface UserQueryParams extends ListQueryParams {
  role?: string
  is_active?: boolean
}

// ===========================
// Query Parameters
// ===========================

export interface ListQueryParams {
  search?: string
  searchColumn?: string
  sortBy?: string
  sortDirection?: "asc" | "desc"
  perPage?: number | "all"
  page?: number
  fromDate?: string
  toDate?: string
}

export interface FindingFilters extends ListQueryParams {
  severity?: "info" | "low" | "medium" | "high" | "critical"
  status?: "open" | "confirmed" | "false-positive" | "fixed" | "accepted"
  project_id?: string
  scope_id?: string
  discovered_by?: string
}

export interface ScopeFilters extends ListQueryParams {
  project_id?: string
  type?: "domain" | "ip" | "subnet" | "service" | "application"
  status?: "in-scope" | "out-of-scope" | "testing" | "completed"
}

export interface ActivityQueryParams extends ListQueryParams {
  action?: "created" | "updated" | "deleted" | "assigned" | "commented" | "status_changed"
  resource?: "Finding" | "Project" | "Scope" | "CveTracking" | "User"
  user_id?: string
  from_date?: string
  to_date?: string
}

// Backward compatibility alias
export type BulkUpdateStatusInput = BulkUpdateFindingStatusInput

// ===========================
// CVE Tracking Types
// ===========================

export interface CveCVSS {
  score: number
  vector: string
}

export interface CveTrackedService {
  projectId: string
  scopeId: string
  service: string
  isAffected: boolean
}

export interface ApiCveTracking {
  id: string
  cve_id: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  cvss: CveCVSS
  cvss_score: number
  cvss_vector: string
  published_date: string
  last_modified_date: string
  affected_products?: string[]
  references?: string[]
  tracked_services?: CveTrackedService[]
  affected_services_count: number
  is_critical: boolean
  created_at: string
  updated_at: string
  human_time: string
}

export interface CreateCveTrackingInput {
  cve_id: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  cvss: CveCVSS
  published_date: string
  affected_products?: string[]
  references?: string[]
}

export interface UpdateCveTrackingInput extends Partial<CreateCveTrackingInput> {}

export interface CveTrackingQueryParams extends ListQueryParams {
  severity?: "low" | "medium" | "high" | "critical"
  project_id?: string
  scope_id?: string
  affected_only?: boolean
  start_date?: string
  end_date?: string
}

// ===========================
// Pagination Types
// ===========================

export interface PaginatedData<T> {
  data: T[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    path: string
    per_page: number
    to: number
    total: number
  }
}

// ===========================
// Dashboard Types
// ===========================

export interface DashboardOverview {
  projects: ProjectStats
  findings: FindingStats
  cves: CVEStats
  team: TeamStats
}

export interface ProjectStats {
  total: number
  by_status: {
    planning: number
    active: number
    "on-hold": number
    completed: number
    cancelled: number
  }
  recent: ApiProject[]
}

export interface FindingStats {
  total: number
  by_severity: {
    critical: number
    high: number
    medium: number
    low: number
    info: number
  }
  by_status: {
    open: number
    confirmed: number
    "false-positive": number
    fixed: number
    accepted: number
  }
  recent: ApiFinding[]
}

export interface CVEStats {
  total: number
  by_severity: {
    critical: number
    high: number
    medium: number
    low: number
  }
  affected_services: number
  recent_additions?: number
  last_sync?: string
  recent?: ApiCveTracking[]
}

export interface TeamStats {
  total_users: number
  active_users: number
  by_role: Record<string, number>
}

export interface TrendData {
  date: string
  value: number
  label: string
}

// ===========================
// Comment Types
// ===========================

export interface Comment {
  id: string
  commentable_type: "Finding" | "Scope" | "Project"
  commentable_id: string
  user: ApiUser
  parent_id: string | null
  content: string
  mentions: string[]
  mentioned_users: ApiUser[]
  is_edited: boolean
  edited_at: string | null
  replies_count: number
  replies: Comment[]
  nesting_level: number
  created_at: string
  updated_at: string
  human_time: string
}

export interface CreateCommentInput {
  commentable_type: "Finding" | "Scope" | "Project"
  commentable_id: string
  content: string
  mentions?: string[]
}

export interface ReplyCommentInput {
  content: string
  mentions?: string[]
}

export interface UpdateCommentInput {
  content: string
  mentions?: string[]
}

// ===========================
// Activity Types
// ===========================

export interface Activity {
  id: string
  user: ApiUser
  action: "created" | "updated" | "deleted" | "assigned" | "commented" | "status_changed"
  resource: "Finding" | "Project" | "Scope" | "CveTracking" | "User"
  resource_id: string
  activity_type: string
  description: string
  metadata: Record<string, any>
  related_user: ApiUser | null
  timestamp: string
  timestamp_human: string
}

export interface ActivityStats {
  period: "today" | "week" | "month"
  total_activities: number
  by_action: Record<string, number>
  by_resource: Record<string, number>
  by_user: Record<string, number>
}

// ===========================
// Attachment Types
// ===========================

export interface Attachment {
  id: string
  original_filename: string
  file_size: number
  file_size_human: string
  mime_type: string
  file_extension: string
  description: string | null
  is_public: boolean
  download_count: number
  is_image: boolean
  is_document: boolean
  virus_scan_status: "pending" | "clean" | "infected" | "error"
  uploaded_by: ApiUser
  attachable_type: "Project" | "Finding" | "Scope" | "Comment"
  attachable_id: string
  uploaded_at: string
  uploaded_at_human: string
  download_url: string
}

export interface UploadAttachmentInput {
  file: File
  description?: string
}

export interface UpdateAttachmentInput {
  description?: string
  is_public?: boolean
}

// ===========================
// Search Types
// ===========================

export interface SearchResult {
  projects: SearchItem[]
  findings: SearchItem[]
  scopes: SearchItem[]
  cves: SearchItem[]
  total_results: number
  search_time: number
}

export interface SearchItem {
  id: string
  type: "project" | "finding" | "scope" | "cve"
  title: string
  description: string
  metadata: Record<string, any>
  score: number
  url: string
  highlights?: Record<string, string[]>
}

export interface SearchSuggestion {
  text: string
  type: "project" | "finding" | "scope" | "cve" | "query"
  count?: number
}

export interface QuickFilter {
  name: string
  label: string
  description: string
  count: number
}

// ===========================
// Saved Search Types
// ===========================

export interface SavedSearch {
  id: string
  user_id: string
  name: string
  query: string
  filters: Record<string, any>
  entity_type: "project" | "finding" | "scope" | "cve" | "all"
  is_public: boolean
  use_count: number
  created_at: string
  updated_at: string
}

export interface CreateSavedSearchInput {
  name: string
  query: string
  filters?: Record<string, any>
  entity_type: "project" | "finding" | "scope" | "cve" | "all"
  is_public?: boolean
}

export interface UpdateSavedSearchInput extends Partial<CreateSavedSearchInput> {}

// ===========================
// Notification Types
// ===========================

export interface Notification {
  id: string
  type:
    | "finding_created"
    | "finding_status_changed"
    | "project_assigned"
    | "comment_mention"
    | "comment_reply"
    | "cve_critical_match"
  data: Record<string, any>
  read_at: string | null
  created_at: string
  is_read: boolean
  title: string
  message: string
  action_url: string
  icon: string
  color: string
}

export interface NotificationPreference {
  notification_type: string
  enabled: boolean
  channels: ("database" | "mail")[]
}

export interface UpdateNotificationPreferenceInput {
  notification_type: string
  enabled: boolean
  channels: ("database" | "mail")[]
}

export interface BulkUpdateNotificationPreferencesInput {
  preferences: UpdateNotificationPreferenceInput[]
}

// ===========================
// Report Types
// ===========================

export interface Report {
  id: string
  project_id: string
  project_name: string
  report_type: "executive" | "technical" | "compliance" | "custom"
  title: string
  status: "pending" | "generating" | "completed" | "failed"
  format: "pdf" | "docx" | "html"
  file_path?: string
  file_size?: number
  file_size_human?: string
  generated_by: ApiUser
  generated_at: string
  download_url?: string
  expires_at?: string
  metadata?: {
    findings_included?: number
    scopes_included?: number
    executive_summary?: boolean
    technical_details?: boolean
    [key: string]: any
  }
  created_at: string
  updated_at: string
}

export interface GenerateReportInput {
  project_id: string
  report_type: "executive" | "technical" | "compliance" | "custom"
  format: "pdf" | "docx" | "html"
  title?: string
  include_findings?: string[] // Finding IDs to include
  include_scopes?: string[] // Scope IDs to include
  template_id?: string
  options?: {
    executive_summary?: boolean
    technical_details?: boolean
    proof_of_concept?: boolean
    remediation_steps?: boolean
    cvss_scores?: boolean
    [key: string]: any
  }
}

export interface SavedReportTemplate {
  id: string
  name: string
  description?: string
  report_type: "executive" | "technical" | "compliance" | "custom"
  format: "pdf" | "docx" | "html"
  is_public: boolean
  options: Record<string, any>
  created_by: ApiUser
  use_count: number
  created_at: string
  updated_at: string
}

export interface CreateSavedReportTemplateInput {
  name: string
  description?: string
  report_type: "executive" | "technical" | "compliance" | "custom"
  format: "pdf" | "docx" | "html"
  is_public?: boolean
  options?: Record<string, any>
}

export interface UpdateSavedReportTemplateInput extends Partial<CreateSavedReportTemplateInput> {}

// ===========================
// Template Types
// ===========================

export interface ProjectTemplate {
  id: string
  name: string
  description?: string
  type: "web-app" | "mobile-app" | "network" | "cloud" | "custom"
  settings: {
    default_test_type?: string
    default_status?: string
    default_tags?: string[]
    scope_templates?: string[]
    [key: string]: any
  }
  is_public: boolean
  created_by: ApiUser
  use_count: number
  created_at: string
  updated_at: string
}

export interface FindingTemplate {
  id: string
  title: string
  description: string
  vulnerability_type: string
  severity: "info" | "low" | "medium" | "high" | "critical"
  cvss?: CVSS
  remediation: Remediation
  references?: string[]
  tags?: string[]
  is_public: boolean
  created_by: ApiUser
  use_count: number
  created_at: string
  updated_at: string
}

export interface ScopeTemplate {
  id: string
  name: string
  description?: string
  type: "domain" | "ip" | "subnet" | "service" | "application"
  default_settings: {
    port?: number
    protocol?: string
    tags?: string[]
    [key: string]: any
  }
  is_public: boolean
  created_by: ApiUser
  use_count: number
  created_at: string
  updated_at: string
}

export interface CreateProjectTemplateInput {
  name: string
  description?: string
  type: "web-app" | "mobile-app" | "network" | "cloud" | "custom"
  settings?: Record<string, any>
  is_public?: boolean
}

export interface CreateFindingTemplateInput {
  title: string
  description: string
  vulnerability_type: string
  severity: "info" | "low" | "medium" | "high" | "critical"
  cvss?: CVSS
  remediation: Remediation
  references?: string[]
  tags?: string[]
  is_public?: boolean
}

export interface CreateScopeTemplateInput {
  name: string
  description?: string
  type: "domain" | "ip" | "subnet" | "service" | "application"
  default_settings?: Record<string, any>
  is_public?: boolean
}

export type UpdateProjectTemplateInput = Partial<CreateProjectTemplateInput>
export type UpdateFindingTemplateInput = Partial<CreateFindingTemplateInput>
export type UpdateScopeTemplateInput = Partial<CreateScopeTemplateInput>

// ===========================
// Workflow Types
// ===========================

export interface WorkflowCondition {
  field: string
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than"
  value: any
}

export interface WorkflowAction {
  type: "send_notification" | "update_status" | "assign_user" | "add_tag" | "webhook"
  config: Record<string, any>
}

export interface Workflow {
  id: string
  name: string
  description?: string
  trigger: "finding_created" | "finding_updated" | "project_created" | "status_changed"
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  is_active: boolean
  created_by: ApiUser
  execution_count: number
  last_executed_at?: string
  created_at: string
  updated_at: string
}

export interface WorkflowExecution {
  id: string
  workflow_id: string
  workflow_name: string
  status: "pending" | "running" | "completed" | "failed"
  trigger_data: Record<string, any>
  result?: Record<string, any>
  error?: string
  started_at: string
  completed_at?: string
  duration_ms?: number
}

export interface WorkflowExecutionStats {
  total_executions: number
  successful: number
  failed: number
  average_duration_ms: number
  by_workflow: Record<string, number>
}

export interface CreateWorkflowInput {
  name: string
  description?: string
  trigger: "finding_created" | "finding_updated" | "project_created" | "status_changed"
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  is_active?: boolean
}

export interface UpdateWorkflowInput extends Partial<CreateWorkflowInput> {}

// ===========================
// Webhook Types
// ===========================

export interface Webhook {
  id: string
  name: string
  url: string
  description?: string
  events: string[]
  secret?: string
  is_active: boolean
  headers?: Record<string, string>
  created_by: ApiUser
  delivery_count: number
  last_delivered_at?: string
  created_at: string
  updated_at: string
}

export interface WebhookDelivery {
  id: string
  webhook_id: string
  webhook_name: string
  event: string
  payload: Record<string, any>
  status: "pending" | "success" | "failed"
  response_code?: number
  response_body?: string
  error?: string
  attempts: number
  delivered_at?: string
  created_at: string
}

export interface WebhookEvent {
  name: string
  description: string
  payload_example: Record<string, any>
}

export interface CreateWebhookInput {
  name: string
  url: string
  description?: string
  events: string[]
  is_active?: boolean
  headers?: Record<string, string>
}

export interface UpdateWebhookInput extends Partial<CreateWebhookInput> {}

// ===========================
// Integration Types
// ===========================

export interface SlackTestInput {
  channel: string
  message: string
}

export interface SendFindingToSlackInput {
  channel: string
  include_details?: boolean
}

export interface JiraTestInput {
  project_key: string
}

export interface CreateJiraIssueInput {
  project_key: string
  issue_type: string
  summary?: string
  description?: string
  priority?: string
  labels?: string[]
}

export interface JiraTransition {
  id: string
  name: string
  to_status: string
}

export interface UpdateJiraStatusInput {
  issue_key: string
  transition_id: string
}

export interface GitHubTestInput {
  repo: string
}

export interface CreateGitHubIssueInput {
  repo: string
  title?: string
  body?: string
  labels?: string[]
  assignees?: string[]
}

export interface CloseGitHubIssueInput {
  repo: string
  issue_number: number
}

export interface TeamsTestInput {
  webhook_url: string
  message: string
}

export interface SendFindingToTeamsInput {
  webhook_url: string
  include_details?: boolean
}

// ===========================
// Cache & Queue Types
// ===========================

export interface CacheStatistics {
  total_keys: number
  total_size: number
  hit_rate: number
  miss_rate: number
  by_type: Record<string, number>
}

export interface CacheHealth {
  status: "healthy" | "degraded" | "unhealthy"
  connection: boolean
  latency_ms: number
  memory_usage: number
}

export interface QueueStatus {
  queue_name: string
  size: number
  processing: number
  failed: number
  completed: number
}

export interface QueueMetrics {
  total_jobs: number
  completed_jobs: number
  failed_jobs: number
  average_wait_time_ms: number
  average_process_time_ms: number
}

export interface QueueJob {
  id: string
  queue: string
  name: string
  data: Record<string, any>
  status: "waiting" | "active" | "completed" | "failed"
  attempts: number
  created_at: string
  processed_at?: string
  completed_at?: string
  failed_at?: string
  error?: string
}

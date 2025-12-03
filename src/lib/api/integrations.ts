/**
 * Integrations API Service
 *
 * Handles all third-party integration operations including
 * Slack, Jira, GitHub, and Microsoft Teams.
 */

import { apiClient, type ApiResponse } from "./client"
import type {
  SlackTestInput,
  SendFindingToSlackInput,
  JiraTestInput,
  CreateJiraIssueInput,
  JiraTransition,
  UpdateJiraStatusInput,
  GitHubTestInput,
  CreateGitHubIssueInput,
  CloseGitHubIssueInput,
  TeamsTestInput,
  SendFindingToTeamsInput,
} from "../types"

// ============================================================================
// Types
// ============================================================================

export interface IntegrationTestResult {
  success: boolean
  message: string
  error?: string
}

export interface SlackMessageResult {
  success: boolean
  message_ts?: string
  channel: string
  error?: string
}

export interface JiraIssueResult {
  success: boolean
  issue_key: string
  issue_url: string
  error?: string
}

export interface GitHubIssueResult {
  success: boolean
  issue_number: number
  issue_url: string
  error?: string
}

export interface TeamsMessageResult {
  success: boolean
  message_id?: string
  error?: string
}

// ============================================================================
// Integrations Service
// ============================================================================

class IntegrationsService {
  // --------------------------------------------------------------------------
  // Slack Integration
  // --------------------------------------------------------------------------

  /**
   * Test Slack connection
   * POST /integrations/slack/test
   */
  async testSlack(input: SlackTestInput): Promise<IntegrationTestResult> {
    const response = await apiClient.post<ApiResponse<IntegrationTestResult>>(
      "/integrations/slack/test",
      input
    )
    return response.data
  }

  /**
   * Send finding to Slack channel
   * POST /integrations/slack/findings/{finding}
   */
  async sendFindingToSlack(
    findingId: string,
    input: SendFindingToSlackInput
  ): Promise<SlackMessageResult> {
    const response = await apiClient.post<ApiResponse<SlackMessageResult>>(
      `/integrations/slack/findings/${findingId}`,
      input
    )
    return response.data
  }

  // --------------------------------------------------------------------------
  // Jira Integration
  // --------------------------------------------------------------------------

  /**
   * Test Jira connection
   * POST /integrations/jira/test
   */
  async testJira(input: JiraTestInput): Promise<IntegrationTestResult> {
    const response = await apiClient.post<ApiResponse<IntegrationTestResult>>(
      "/integrations/jira/test",
      input
    )
    return response.data
  }

  /**
   * Create Jira issue from finding
   * POST /integrations/jira/findings/{finding}/create-issue
   */
  async createJiraIssue(
    findingId: string,
    input: CreateJiraIssueInput
  ): Promise<JiraIssueResult> {
    const response = await apiClient.post<ApiResponse<JiraIssueResult>>(
      `/integrations/jira/findings/${findingId}/create-issue`,
      input
    )
    return response.data
  }

  /**
   * Get available Jira transitions for an issue
   * GET /integrations/jira/transitions
   */
  async getJiraTransitions(issueKey: string): Promise<JiraTransition[]> {
    const response = await apiClient.get<ApiResponse<JiraTransition[]>>(
      "/integrations/jira/transitions",
      { issue_key: issueKey }
    )
    return response.data
  }

  /**
   * Update Jira issue status
   * POST /integrations/jira/update-status
   */
  async updateJiraStatus(input: UpdateJiraStatusInput): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
      "/integrations/jira/update-status",
      input
    )
    return response.data
  }

  // --------------------------------------------------------------------------
  // GitHub Integration
  // --------------------------------------------------------------------------

  /**
   * Test GitHub connection
   * POST /integrations/github/test
   */
  async testGitHub(input: GitHubTestInput): Promise<IntegrationTestResult> {
    const response = await apiClient.post<ApiResponse<IntegrationTestResult>>(
      "/integrations/github/test",
      input
    )
    return response.data
  }

  /**
   * Create GitHub issue from finding
   * POST /integrations/github/findings/{finding}/create-issue
   */
  async createGitHubIssue(
    findingId: string,
    input: CreateGitHubIssueInput
  ): Promise<GitHubIssueResult> {
    const response = await apiClient.post<ApiResponse<GitHubIssueResult>>(
      `/integrations/github/findings/${findingId}/create-issue`,
      input
    )
    return response.data
  }

  /**
   * Close GitHub issue
   * POST /integrations/github/close-issue
   */
  async closeGitHubIssue(input: CloseGitHubIssueInput): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
      "/integrations/github/close-issue",
      input
    )
    return response.data
  }

  // --------------------------------------------------------------------------
  // Microsoft Teams Integration
  // --------------------------------------------------------------------------

  /**
   * Test Microsoft Teams connection
   * POST /integrations/teams/test
   */
  async testTeams(input: TeamsTestInput): Promise<IntegrationTestResult> {
    const response = await apiClient.post<ApiResponse<IntegrationTestResult>>(
      "/integrations/teams/test",
      input
    )
    return response.data
  }

  /**
   * Send finding to Microsoft Teams
   * POST /integrations/teams/findings/{finding}
   */
  async sendFindingToTeams(
    findingId: string,
    input: SendFindingToTeamsInput
  ): Promise<TeamsMessageResult> {
    const response = await apiClient.post<ApiResponse<TeamsMessageResult>>(
      `/integrations/teams/findings/${findingId}`,
      input
    )
    return response.data
  }

  // --------------------------------------------------------------------------
  // Convenience Aliases (for React Query compatibility)
  // --------------------------------------------------------------------------

  // Slack
  testSlackConnection = this.testSlack.bind(this)
  sendToSlack = this.sendFindingToSlack.bind(this)

  // Jira
  testJiraConnection = this.testJira.bind(this)
  createJiraTicket = this.createJiraIssue.bind(this)
  getTransitions = this.getJiraTransitions.bind(this)
  updateStatus = this.updateJiraStatus.bind(this)

  // GitHub
  testGitHubConnection = this.testGitHub.bind(this)
  createGitHubTicket = this.createGitHubIssue.bind(this)
  closeIssue = this.closeGitHubIssue.bind(this)

  // Teams
  testTeamsConnection = this.testTeams.bind(this)
  sendToTeams = this.sendFindingToTeams.bind(this)
}

// Export singleton instance
export const integrationsService = new IntegrationsService()

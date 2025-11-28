/**
 * Integrations React Query Hooks
 *
 * Provides hooks for third-party integrations including
 * Slack, Jira, GitHub, and Microsoft Teams.
 */

import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { integrationsService } from "../api/integrations"
import type {
  SlackTestInput,
  SendFindingToSlackInput,
  JiraTestInput,
  CreateJiraIssueInput,
  UpdateJiraStatusInput,
  GitHubTestInput,
  CreateGitHubIssueInput,
  CloseGitHubIssueInput,
  TeamsTestInput,
  SendFindingToTeamsInput,
} from "../types"
import { handleError } from "../errors"

// ============================================================================
// Slack Integration Hooks
// ============================================================================

/**
 * Hook to test Slack connection
 */
export function useTestSlack() {
  return useMutation({
    mutationFn: (input: SlackTestInput) => integrationsService.testSlack(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Slack connection successful", {
          description: result.message,
        })
      } else {
        toast.error("Slack connection failed", {
          description: result.error || result.message,
        })
      }
    },
    onError: (error) => {
      handleError(error, "Failed to test Slack connection")
    },
  })
}

/**
 * Hook to send a finding to Slack
 */
export function useSendFindingToSlack() {
  return useMutation({
    mutationFn: ({ findingId, input }: { findingId: string; input: SendFindingToSlackInput }) =>
      integrationsService.sendFindingToSlack(findingId, input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Finding sent to Slack", {
          description: `Posted to channel: ${result.channel}`,
        })
      } else {
        toast.error("Failed to send to Slack", {
          description: result.error,
        })
      }
    },
    onError: (error) => {
      handleError(error, "Failed to send finding to Slack")
    },
  })
}

// ============================================================================
// Jira Integration Hooks
// ============================================================================

/**
 * Hook to test Jira connection
 */
export function useTestJira() {
  return useMutation({
    mutationFn: (input: JiraTestInput) => integrationsService.testJira(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Jira connection successful", {
          description: result.message,
        })
      } else {
        toast.error("Jira connection failed", {
          description: result.error || result.message,
        })
      }
    },
    onError: (error) => {
      handleError(error, "Failed to test Jira connection")
    },
  })
}

/**
 * Hook to create a Jira issue from a finding
 */
export function useCreateJiraIssue() {
  return useMutation({
    mutationFn: ({ findingId, input }: { findingId: string; input: CreateJiraIssueInput }) =>
      integrationsService.createJiraIssue(findingId, input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Jira issue created", {
          description: `Issue: ${result.issue_key}`,
          action: {
            label: "View",
            onClick: () => window.open(result.issue_url, "_blank"),
          },
        })
      } else {
        toast.error("Failed to create Jira issue", {
          description: result.error,
        })
      }
    },
    onError: (error) => {
      handleError(error, "Failed to create Jira issue")
    },
  })
}

/**
 * Hook to get Jira transitions for an issue
 */
export function useJiraTransitions() {
  return useMutation({
    mutationFn: (issueKey: string) => integrationsService.getJiraTransitions(issueKey),
    onError: (error) => {
      handleError(error, "Failed to get Jira transitions")
    },
  })
}

/**
 * Hook to update Jira issue status
 */
export function useUpdateJiraStatus() {
  return useMutation({
    mutationFn: (input: UpdateJiraStatusInput) => integrationsService.updateJiraStatus(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Jira issue status updated", {
          description: result.message,
        })
      } else {
        toast.error("Failed to update Jira status")
      }
    },
    onError: (error) => {
      handleError(error, "Failed to update Jira status")
    },
  })
}

// ============================================================================
// GitHub Integration Hooks
// ============================================================================

/**
 * Hook to test GitHub connection
 */
export function useTestGitHub() {
  return useMutation({
    mutationFn: (input: GitHubTestInput) => integrationsService.testGitHub(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("GitHub connection successful", {
          description: result.message,
        })
      } else {
        toast.error("GitHub connection failed", {
          description: result.error || result.message,
        })
      }
    },
    onError: (error) => {
      handleError(error, "Failed to test GitHub connection")
    },
  })
}

/**
 * Hook to create a GitHub issue from a finding
 */
export function useCreateGitHubIssue() {
  return useMutation({
    mutationFn: ({ findingId, input }: { findingId: string; input: CreateGitHubIssueInput }) =>
      integrationsService.createGitHubIssue(findingId, input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("GitHub issue created", {
          description: `Issue #${result.issue_number}`,
          action: {
            label: "View",
            onClick: () => window.open(result.issue_url, "_blank"),
          },
        })
      } else {
        toast.error("Failed to create GitHub issue", {
          description: result.error,
        })
      }
    },
    onError: (error) => {
      handleError(error, "Failed to create GitHub issue")
    },
  })
}

/**
 * Hook to close a GitHub issue
 */
export function useCloseGitHubIssue() {
  return useMutation({
    mutationFn: (input: CloseGitHubIssueInput) => integrationsService.closeGitHubIssue(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("GitHub issue closed", {
          description: result.message,
        })
      } else {
        toast.error("Failed to close GitHub issue")
      }
    },
    onError: (error) => {
      handleError(error, "Failed to close GitHub issue")
    },
  })
}

// ============================================================================
// Microsoft Teams Integration Hooks
// ============================================================================

/**
 * Hook to test Microsoft Teams connection
 */
export function useTestTeams() {
  return useMutation({
    mutationFn: (input: TeamsTestInput) => integrationsService.testTeams(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Teams connection successful", {
          description: result.message,
        })
      } else {
        toast.error("Teams connection failed", {
          description: result.error || result.message,
        })
      }
    },
    onError: (error) => {
      handleError(error, "Failed to test Teams connection")
    },
  })
}

/**
 * Hook to send a finding to Microsoft Teams
 */
export function useSendFindingToTeams() {
  return useMutation({
    mutationFn: ({ findingId, input }: { findingId: string; input: SendFindingToTeamsInput }) =>
      integrationsService.sendFindingToTeams(findingId, input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Finding sent to Teams")
      } else {
        toast.error("Failed to send to Teams", {
          description: result.error,
        })
      }
    },
    onError: (error) => {
      handleError(error, "Failed to send finding to Teams")
    },
  })
}

// ============================================================================
// Combined Integration Hooks
// ============================================================================

/**
 * Combined hook for Slack integration
 */
export function useSlackIntegration() {
  const testSlack = useTestSlack()
  const sendFindingToSlack = useSendFindingToSlack()

  return {
    testSlack,
    sendFindingToSlack,
    isTesting: testSlack.isPending,
    isSending: sendFindingToSlack.isPending,
  }
}

/**
 * Combined hook for Jira integration
 */
export function useJiraIntegration() {
  const testJira = useTestJira()
  const createJiraIssue = useCreateJiraIssue()
  const getTransitions = useJiraTransitions()
  const updateStatus = useUpdateJiraStatus()

  return {
    testJira,
    createJiraIssue,
    getTransitions,
    updateStatus,
    isTesting: testJira.isPending,
    isCreating: createJiraIssue.isPending,
    isUpdating: updateStatus.isPending,
  }
}

/**
 * Combined hook for GitHub integration
 */
export function useGitHubIntegration() {
  const testGitHub = useTestGitHub()
  const createGitHubIssue = useCreateGitHubIssue()
  const closeGitHubIssue = useCloseGitHubIssue()

  return {
    testGitHub,
    createGitHubIssue,
    closeGitHubIssue,
    isTesting: testGitHub.isPending,
    isCreating: createGitHubIssue.isPending,
    isClosing: closeGitHubIssue.isPending,
  }
}

/**
 * Combined hook for Microsoft Teams integration
 */
export function useTeamsIntegration() {
  const testTeams = useTestTeams()
  const sendFindingToTeams = useSendFindingToTeams()

  return {
    testTeams,
    sendFindingToTeams,
    isTesting: testTeams.isPending,
    isSending: sendFindingToTeams.isPending,
  }
}

/**
 * Combined hook for all integrations
 */
export function useIntegrations() {
  const slack = useSlackIntegration()
  const jira = useJiraIntegration()
  const github = useGitHubIntegration()
  const teams = useTeamsIntegration()

  return {
    slack,
    jira,
    github,
    teams,
  }
}

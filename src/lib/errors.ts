/**
 * Custom Error Classes and Error Handling Utilities
 */

import { toast } from "sonner"
import { ApiError } from "./api/client"

/**
 * Validation Error
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = "ValidationError"
  }
}

/**
 * Network Error
 */
export class NetworkError extends Error {
  constructor(message: string = "Network connection failed") {
    super(message)
    this.name = "NetworkError"
  }
}

/**
 * Timeout Error
 */
export class TimeoutError extends Error {
  constructor(message: string = "Request timed out") {
    super(message)
    this.name = "TimeoutError"
  }
}

/**
 * Parse API error for user-friendly message
 */
export function parseApiError(error: unknown): string {
  if (error instanceof ApiError) {
    // Handle validation errors
    if (error.errors) {
      const errorMessages = Object.values(error.errors).flat()
      return errorMessages.join(", ")
    }
    return error.message
  }

  if (error instanceof ValidationError) {
    if (error.errors) {
      const errorMessages = Object.values(error.errors).flat()
      return errorMessages.join(", ")
    }
    return error.message
  }

  if (error instanceof NetworkError) {
    return "Network connection failed. Please check your internet connection."
  }

  if (error instanceof TimeoutError) {
    return "Request timed out. Please try again."
  }

  if (error instanceof Error) {
    return error.message
  }

  return "An unexpected error occurred"
}

/**
 * Get error status code
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof ApiError) {
    return error.status
  }
  return undefined
}

/**
 * Check if error is authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 401
  }
  return false
}

/**
 * Check if error is permission error
 */
export function isPermissionError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 403
  }
  return false
}

/**
 * Check if error is validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 422
  }
  return error instanceof ValidationError
}

/**
 * Check if error is rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 429
  }
  return false
}

/**
 * Check if error is server error
 */
export function isServerError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status >= 500
  }
  return false
}

/**
 * Handle error with toast notification
 */
export function handleError(error: unknown, customMessage?: string): void {
  const message = customMessage || parseApiError(error)

  // Show appropriate toast based on error type
  if (isAuthError(error)) {
    toast.error("Authentication required", {
      description: "Please log in to continue",
    })
  } else if (isPermissionError(error)) {
    toast.error("Permission denied", {
      description: message,
    })
  } else if (isValidationError(error)) {
    toast.error("Validation failed", {
      description: message,
    })
  } else if (isRateLimitError(error)) {
    toast.warning("Rate limit exceeded", {
      description: "Please slow down and try again later",
    })
  } else if (isServerError(error)) {
    toast.error("Server error", {
      description: "Something went wrong on our end. Please try again later.",
    })
  } else {
    toast.error("Error", {
      description: message,
    })
  }

  // Log error in development
  if (import.meta.env.DEV) {
    console.error("Error handled:", error)
  }
}

/**
 * Format validation errors for form display
 */
export function formatValidationErrors(
  error: unknown,
): Record<string, string> | null {
  if (error instanceof ApiError && error.errors) {
    return Object.entries(error.errors).reduce(
      (acc, [key, messages]) => {
        acc[key] = messages.join(", ")
        return acc
      },
      {} as Record<string, string>,
    )
  }

  if (error instanceof ValidationError && error.errors) {
    return Object.entries(error.errors).reduce(
      (acc, [key, messages]) => {
        acc[key] = messages.join(", ")
        return acc
      },
      {} as Record<string, string>,
    )
  }

  return null
}

/**
 * Retry operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number
    initialDelay?: number
    maxDelay?: number
    onRetry?: (attempt: number, error: unknown) => void
  } = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    onRetry,
  } = options

  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      // Don't retry on certain errors
      if (
        isAuthError(error) ||
        isPermissionError(error) ||
        isValidationError(error)
      ) {
        throw error
      }

      // Last attempt, throw error
      if (attempt === maxAttempts) {
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay)

      // Call retry callback
      onRetry?.(attempt, error)

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Create error logger (can be integrated with external services)
 */
export function logError(
  error: unknown,
  context?: Record<string, any>,
): void {
  const errorData = {
    message: parseApiError(error),
    status: getErrorStatus(error),
    timestamp: new Date().toISOString(),
    context,
    stack: error instanceof Error ? error.stack : undefined,
    url: window.location.href,
    userAgent: navigator.userAgent,
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error("Error logged:", errorData)
  }

  // Store error in localStorage for debugging
  try {
    const errors = JSON.parse(localStorage.getItem('error_logs') || '[]')
    errors.push(errorData)
    // Keep only last 50 errors
    if (errors.length > 50) {
      errors.shift()
    }
    localStorage.setItem('error_logs', JSON.stringify(errors))
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('Failed to store error log', e)
    }
  }

  // TODO: Send to error tracking service (e.g., Sentry, LogRocket)
  // Example: Sentry.captureException(error, { extra: context })
}

/**
 * Get error logs from localStorage
 */
export function getErrorLogs(): Array<{
  message: string
  status?: number
  timestamp: string
  context?: Record<string, any>
  stack?: string
  url?: string
  userAgent?: string
}> {
  try {
    return JSON.parse(localStorage.getItem('error_logs') || '[]')
  } catch {
    return []
  }
}

/**
 * Clear error logs
 */
export function clearErrorLogs(): void {
  localStorage.removeItem('error_logs')
}

/**
 * Export error logs as JSON file
 */
export function exportErrorLogs(): void {
  const logs = getErrorLogs()
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `error-logs-${new Date().toISOString()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

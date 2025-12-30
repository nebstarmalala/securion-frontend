/**
 * Environment Variables Configuration
 * Provides type-safe access to environment variables with validation
 */

interface EnvironmentConfig {
  // API Configuration
  apiBaseUrl: string
  apiTimeout: number
  maxRetries: number

  // Development Tools
  enableDevtools: boolean
  logApiCalls: boolean

  // Feature Flags
  enableWebsockets: boolean
  enableNotifications: boolean
}

class EnvironmentValidator {
  private config: EnvironmentConfig

  constructor() {
    this.config = this.loadAndValidate()
  }

  /**
   * Load and validate environment variables
   */
  private loadAndValidate(): EnvironmentConfig {
    const errors: string[] = []

    // Required variables
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
    if (!apiBaseUrl) {
      errors.push("VITE_API_BASE_URL is required")
    }

    // Optional with defaults
    const apiTimeout = this.parseNumber(
      import.meta.env.VITE_API_TIMEOUT,
      30000,
      "VITE_API_TIMEOUT"
    )
    const maxRetries = this.parseNumber(
      import.meta.env.VITE_MAX_RETRIES,
      3,
      "VITE_MAX_RETRIES"
    )

    // Boolean flags
    const enableDevtools = this.parseBoolean(
      import.meta.env.VITE_ENABLE_DEVTOOLS,
      false
    )
    const logApiCalls = this.parseBoolean(
      import.meta.env.VITE_LOG_API_CALLS,
      false
    )
    const enableWebsockets = this.parseBoolean(
      import.meta.env.VITE_ENABLE_WEBSOCKETS,
      false
    )
    const enableNotifications = this.parseBoolean(
      import.meta.env.VITE_ENABLE_NOTIFICATIONS,
      true
    )

    // Throw validation errors
    if (errors.length > 0) {
      throw new Error(
        `Environment validation failed:\n${errors.join("\n")}`
      )
    }

    return {
      apiBaseUrl: apiBaseUrl || "http://127.0.0.1:8000/api",
      apiTimeout: apiTimeout,
      maxRetries: maxRetries,
      enableDevtools,
      logApiCalls,
      enableWebsockets,
      enableNotifications,
    }
  }

  /**
   * Parse number with validation
   */
  private parseNumber(
    value: string | undefined,
    defaultValue: number,
    name: string
  ): number {
    if (!value) return defaultValue

    const parsed = parseInt(value, 10)
    if (isNaN(parsed)) {
      console.warn(
        `${name} must be a valid number, using default: ${defaultValue}`
      )
      return defaultValue
    }

    return parsed
  }

  /**
   * Parse boolean value
   */
  private parseBoolean(
    value: string | undefined,
    defaultValue: boolean
  ): boolean {
    if (!value) return defaultValue
    return value.toLowerCase() === "true"
  }

  /**
   * Get configuration
   */
  getConfig(): EnvironmentConfig {
    return { ...this.config }
  }

  /**
   * Get API base URL
   */
  getApiBaseUrl(): string {
    return this.config.apiBaseUrl
  }

  /**
   * Get API timeout
   */
  getApiTimeout(): number {
    return this.config.apiTimeout
  }

  /**
   * Get max retries
   */
  getMaxRetries(): number {
    return this.config.maxRetries
  }

  /**
   * Check if devtools are enabled
   */
  isDevtoolsEnabled(): boolean {
    return this.config.enableDevtools
  }

  /**
   * Check if API logging is enabled
   */
  isApiLoggingEnabled(): boolean {
    return this.config.logApiCalls
  }

  /**
   * Check if websockets are enabled
   */
  isWebsocketsEnabled(): boolean {
    return this.config.enableWebsockets
  }

  /**
   * Check if notifications are enabled
   */
  isNotificationsEnabled(): boolean {
    return this.config.enableNotifications
  }

  /**
   * Check if running in development mode
   */
  isDevelopment(): boolean {
    return import.meta.env.DEV
  }

  /**
   * Check if running in production mode
   */
  isProduction(): boolean {
    return import.meta.env.PROD
  }
}

// Export singleton instance
export const env = new EnvironmentValidator()

// Export config for direct access
export const envConfig = env.getConfig()

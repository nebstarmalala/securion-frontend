/**
 * API Client Configuration
 * Handles all HTTP requests with automatic token injection and error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"
const TOKEN_KEY = "securion_auth_token"
const REFRESH_TOKEN_KEY = "securion_refresh_token"
const TOKEN_EXPIRY_KEY = "securion_token_expiry"
const ENABLE_DEVTOOLS = import.meta.env.VITE_ENABLE_DEVTOOLS === "true"
const LOG_API_CALLS = import.meta.env.VITE_LOG_API_CALLS === "true"
const REQUEST_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || "30000", 10)
const MAX_RETRIES = parseInt(import.meta.env.VITE_MAX_RETRIES || "3", 10)

// API Response Structure (matches exact backend format)
export interface ApiResponse<T = any> {
  data: T
  message: string
}

export interface PaginatedApiResponse<T = any> {
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

// Alias for paginated response (without wrapping in data/message)
export type PaginatedResponse<T> = PaginatedApiResponse<T>

export interface ValidationErrorResponse {
  message: string
  errors: Record<string, string[]>
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public errors?: Record<string, string[]>,
    public retryAfter?: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

class ApiClient {
  private baseURL: string
  private isRefreshing: boolean = false
  private refreshSubscribers: Array<(token: string) => void> = []

  constructor() {
    this.baseURL = API_BASE_URL
  }

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  /**
   * Store authentication token with expiry
   */
  setToken(token: string, expiresIn?: number): void {
    localStorage.setItem(TOKEN_KEY, token)

    if (expiresIn) {
      const expiryTime = Date.now() + expiresIn * 1000
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
    }
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  /**
   * Store refresh token
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  }

  /**
   * Check if token is expired or about to expire (within 5 minutes)
   */
  isTokenExpired(): boolean {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
    if (!expiry) return false

    const expiryTime = parseInt(expiry, 10)
    const bufferTime = 5 * 60 * 1000 // 5 minutes buffer
    return Date.now() >= expiryTime - bufferTime
  }

  /**
   * Remove authentication tokens
   */
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
  }

  /**
   * Subscribe to token refresh
   */
  private subscribeTokenRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback)
  }

  /**
   * Notify subscribers about new token
   */
  private onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token))
    this.refreshSubscribers = []
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken()

    if (!refreshToken) {
      throw new ApiError(401, "No refresh token available")
    }

    if (this.isRefreshing) {
      // Wait for ongoing refresh to complete
      return new Promise((resolve) => {
        this.subscribeTokenRefresh((token: string) => {
          resolve(token)
        })
      })
    }

    this.isRefreshing = true

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!response.ok) {
        throw new ApiError(401, "Token refresh failed")
      }

      const data = await response.json()
      const newToken = data.data?.token || data.token
      const expiresIn = data.data?.expires_in || data.expires_in

      this.setToken(newToken, expiresIn)
      this.onTokenRefreshed(newToken)

      return newToken
    } catch (error) {
      this.removeToken()
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login"
      }
      throw error
    } finally {
      this.isRefreshing = false
    }
  }

  /**
   * Build headers with authentication
   */
  private async getHeaders(customHeaders?: HeadersInit): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...customHeaders,
    }

    // Check if token needs refresh
    if (this.isTokenExpired()) {
      try {
        await this.refreshToken()
      } catch (error) {
        // Token refresh failed, will be handled in handleResponse
      }
    }

    const token = this.getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  /**
   * Create fetch request with timeout
   */
  private fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = REQUEST_TIMEOUT,
  ): Promise<Response> {
    return Promise.race([
      fetch(url, options),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new ApiError(0, `Request timeout after ${timeout}ms`)), timeout),
      ),
    ])
  }

  /**
   * Log API request (dev mode only)
   */
  private logRequest(method: string, url: string, body?: any): void {
    if (LOG_API_CALLS && ENABLE_DEVTOOLS && import.meta.env.DEV) {
      console.group(`%c${method} ${url}`, "color: #0ea5e9; font-weight: bold")
      console.log("Timestamp:", new Date().toISOString())
      if (body) {
        console.log("Request Body:", body)
      }
      console.groupEnd()
    }
  }

  /**
   * Log API response (dev mode only)
   */
  private logResponse(method: string, url: string, status: number, data: any): void {
    if (LOG_API_CALLS && ENABLE_DEVTOOLS && import.meta.env.DEV) {
      const color = status >= 200 && status < 300 ? "#10b981" : "#ef4444"
      console.group(`%c${method} ${url} [${status}]`, `color: ${color}; font-weight: bold`)
      console.log("Timestamp:", new Date().toISOString())
      console.log("Response Data:", data)
      console.groupEnd()
    }
  }

  /**
   * Handle API response with comprehensive error handling
   */
  private async handleResponse<T>(response: Response, method: string, url: string): Promise<T> {
    const contentType = response.headers.get("content-type")
    const isJson = contentType?.includes("application/json")

    let data: any
    if (isJson) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    // Log response in dev mode
    this.logResponse(method, url, response.status, data)

    // Handle successful responses
    if (response.ok) {
      return data
    }

    // Extract retry-after header for rate limiting
    const retryAfter = response.headers.get("retry-after")
    const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : undefined

    // Handle error responses
    switch (response.status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        this.removeToken()
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login"
        }
        throw new ApiError(401, data?.message || "Authentication required", undefined, retryAfterSeconds)

      case 403:
        // Forbidden - permission denied
        throw new ApiError(
          403,
          data?.message || "You don't have permission to perform this action",
          undefined,
          retryAfterSeconds,
        )

      case 404:
        // Not found
        throw new ApiError(404, data?.message || "Resource not found", undefined, retryAfterSeconds)

      case 422:
        // Validation error
        throw new ApiError(422, data?.message || "Validation failed", data?.errors, retryAfterSeconds)

      case 429:
        // Rate limit exceeded
        throw new ApiError(
          429,
          data?.message || "Too many requests. Please try again later.",
          undefined,
          retryAfterSeconds,
        )

      case 500:
        // Server error
        throw new ApiError(500, data?.message || "Internal server error occurred", undefined, retryAfterSeconds)

      case 503:
        // Service unavailable
        throw new ApiError(503, data?.message || "Service temporarily unavailable", undefined, retryAfterSeconds)

      default:
        throw new ApiError(response.status, data?.message || "An error occurred", undefined, retryAfterSeconds)
    }
  }

  /**
   * Retry logic with exponential backoff
   */
  private async retryRequest<T>(
    fn: () => Promise<Response>,
    method: string,
    url: string,
    maxRetries: number = MAX_RETRIES,
    initialDelay: number = 1000,
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fn()
        return await this.handleResponse<T>(response, method, url)
      } catch (error) {
        lastError = error as Error

        // Don't retry on client errors (4xx except 429)
        if (error instanceof ApiError) {
          if (error.status >= 400 && error.status < 500 && error.status !== 429) {
            throw error
          }

          // If rate limited and retry-after is provided, wait that duration
          if (error.status === 429 && error.retryAfter) {
            const delay = error.retryAfter * 1000
            if (LOG_API_CALLS && ENABLE_DEVTOOLS && import.meta.env.DEV) {
              console.warn(`Rate limited. Retrying after ${error.retryAfter}s...`)
            }
            await new Promise((resolve) => setTimeout(resolve, delay))
            continue
          }
        }

        // Exponential backoff for other errors
        if (attempt < maxRetries) {
          const delay = initialDelay * Math.pow(2, attempt)
          if (LOG_API_CALLS && ENABLE_DEVTOOLS && import.meta.env.DEV) {
            console.warn(`Request failed. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`)
          }
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError || new Error("Request failed after retries")
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`)

    // Add query parameters (filter out empty strings, null, undefined)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        // Skip null, undefined, empty strings, and empty arrays
        if (value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0)) {
          // Trim strings before adding
          const stringValue = typeof value === 'string' ? value.trim() : String(value)
          if (stringValue !== "") {
            url.searchParams.append(key, stringValue)
          }
        }
      })
    }

    const fullUrl = url.toString()
    this.logRequest("GET", fullUrl)

    return this.retryRequest<T>(
      async () =>
        this.fetchWithTimeout(fullUrl, {
          method: "GET",
          headers: await this.getHeaders(),
        }),
      "GET",
      fullUrl,
    )
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, body?: any): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    this.logRequest("POST", url, body)

    return this.retryRequest<T>(
      async () =>
        this.fetchWithTimeout(url, {
          method: "POST",
          headers: await this.getHeaders(),
          body: body ? JSON.stringify(body) : undefined,
        }),
      "POST",
      url,
    )
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, body?: any): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    this.logRequest("PUT", url, body)

    return this.retryRequest<T>(
      async () =>
        this.fetchWithTimeout(url, {
          method: "PUT",
          headers: await this.getHeaders(),
          body: body ? JSON.stringify(body) : undefined,
        }),
      "PUT",
      url,
    )
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, body?: any): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    this.logRequest("PATCH", url, body)

    return this.retryRequest<T>(
      async () =>
        this.fetchWithTimeout(url, {
          method: "PATCH",
          headers: await this.getHeaders(),
          body: body ? JSON.stringify(body) : undefined,
        }),
      "PATCH",
      url,
    )
  }

  /**
   * DELETE request
   * Some API endpoints require passing data in the request body for DELETE
   */
  async delete<T = any>(endpoint: string, body?: any): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    this.logRequest("DELETE", url, body)

    return this.retryRequest<T>(
      async () =>
        this.fetchWithTimeout(url, {
          method: "DELETE",
          headers: await this.getHeaders(),
          body: body ? JSON.stringify(body) : undefined,
        }),
      "DELETE",
      url,
    )
  }

  /**
   * Upload file (multipart/form-data) with validation
   * Validates file size (max 10MB) and allowed types before upload
   */
  async upload<T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      throw new ApiError(422, 'File size exceeds 10MB limit')
    }

    // Validate file type
    const ALLOWED_TYPES = [
      'pdf', 'doc', 'docx', 'txt', 'md',
      'jpg', 'jpeg', 'png', 'gif', 'svg',
      'zip', 'tar', 'gz', 'xml', 'json', 'csv'
    ]
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !ALLOWED_TYPES.includes(extension)) {
      throw new ApiError(422, `File type .${extension} is not allowed`)
    }

    const url = `${this.baseURL}${endpoint}`
    this.logRequest("POST", url, { file: file.name, size: file.size })

    const token = this.getToken()
    const headers: HeadersInit = {
      Accept: "application/json",
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    // Use XMLHttpRequest for upload progress tracking
    if (onProgress) {
      return new Promise<T>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100)
            onProgress(progress)
          }
        })

        xhr.addEventListener("load", async () => {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText)
              // Laravel backend returns { data, message }, extract data
              resolve(response.data || response)
            } else {
              const error = JSON.parse(xhr.responseText)
              reject(new ApiError(xhr.status, error.message, error.errors))
            }
          } catch (error) {
            reject(error)
          }
        })

        xhr.addEventListener("error", () => {
          reject(new ApiError(0, "Network error occurred during upload"))
        })

        xhr.open("POST", url)
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value as string)
        })
        xhr.send(formData)
      })
    }

    // Fallback without progress tracking
    return this.retryRequest<T>(
      () =>
        fetch(url, {
          method: "POST",
          headers,
          body: formData,
        }),
      "POST",
      url,
      1, // Don't retry file uploads by default
    )
  }

  /**
   * Download file
   */
  async download(endpoint: string, filename?: string): Promise<Blob> {
    const url = `${this.baseURL}${endpoint}`
    this.logRequest("GET", url)

    const response = await fetch(url, {
      method: "GET",
      headers: await this.getHeaders(),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new ApiError(response.status, data?.message || "Download failed")
    }

    const blob = await response.blob()

    // Trigger download if filename is provided
    if (filename) {
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    }

    return blob
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

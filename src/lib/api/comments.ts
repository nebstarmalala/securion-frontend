/**
 * Comments API Service
 * Handles all comment management API operations
 *
 * Supported Entities:
 * - Finding
 * - Scope
 * - Project
 *
 * Features:
 * - Nested replies (threading)
 * - User mentions with notifications
 * - Edit tracking
 * - Nesting level tracking
 */

import { apiClient, type ApiResponse, type PaginatedApiResponse } from "./client"
import type {
  Comment,
  CreateCommentInput,
  ReplyCommentInput,
  UpdateCommentInput,
  PaginatedData,
  QueryParams,
} from "@/lib/types/api"

class CommentsService {
  /**
   * Get all comments for a specific entity
   * GET /comments?commentable_type={type}&commentable_id={id}
   *
   * Query Parameters:
   * - page: Page number
   * - per_page: Items per page
   * - commentable_type: Entity type (Finding, Scope, Project)
   * - commentable_id: Entity ID
   *
   * @param commentableType - Type of entity (Finding, Scope, Project)
   * @param commentableId - ID of the entity
   * @param params - Additional query parameters
   * @returns Paginated list of comments
   */
  async list(
    commentableType: string,
    commentableId: string,
    params?: QueryParams
  ): Promise<PaginatedData<Comment>> {
    const response = await apiClient.get<PaginatedApiResponse<Comment>>("/comments", {
      commentable_type: commentableType,
      commentable_id: commentableId,
      ...params,
    })
    return response
  }

  /**
   * Create a new comment
   * POST /comments
   *
   * @param data - Comment creation data
   * @returns Created comment
   */
  async create(data: CreateCommentInput): Promise<Comment> {
    const response = await apiClient.post<ApiResponse<Comment>>("/comments", data)
    return response.data
  }

  /**
   * Reply to an existing comment
   * POST /comments/{comment}/reply
   *
   * @param commentId - Parent comment ID
   * @param data - Reply data
   * @returns Created reply comment
   */
  async reply(commentId: string, data: ReplyCommentInput): Promise<Comment> {
    const response = await apiClient.post<ApiResponse<Comment>>(
      `/comments/${commentId}/reply`,
      data
    )
    return response.data
  }

  /**
   * Update an existing comment
   * PUT /comments/{comment}
   *
   * @param commentId - Comment ID
   * @param data - Updated content
   * @returns Updated comment
   */
  async update(commentId: string, data: UpdateCommentInput): Promise<Comment> {
    const response = await apiClient.put<ApiResponse<Comment>>(`/comments/${commentId}`, data)
    return response.data
  }

  /**
   * Delete a comment
   * DELETE /comments/{comment}
   *
   * @param commentId - Comment ID
   */
  async delete(commentId: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/comments/${commentId}`)
  }

  /**
   * Get comments for a Finding
   * Convenience method for Finding comments
   *
   * @param findingId - Finding ID
   * @param params - Query parameters
   * @returns Paginated list of comments
   */
  async getFindingComments(
    findingId: string,
    params?: QueryParams
  ): Promise<PaginatedData<Comment>> {
    return this.list("Finding", findingId, params)
  }

  /**
   * Get comments for a Scope
   * Convenience method for Scope comments
   *
   * @param scopeId - Scope ID
   * @param params - Query parameters
   * @returns Paginated list of comments
   */
  async getScopeComments(scopeId: string, params?: QueryParams): Promise<PaginatedData<Comment>> {
    return this.list("Scope", scopeId, params)
  }

  /**
   * Get comments for a Project
   * Convenience method for Project comments
   *
   * @param projectId - Project ID
   * @param params - Query parameters
   * @returns Paginated list of comments
   */
  async getProjectComments(
    projectId: string,
    params?: QueryParams
  ): Promise<PaginatedData<Comment>> {
    return this.list("Project", projectId, params)
  }
}

// Export singleton instance
export const commentsService = new CommentsService()

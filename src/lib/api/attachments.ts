/**
 * Attachments API Service
 * Handles all file attachment API operations
 *
 * Supported Entities:
 * - projects
 * - findings
 * - scopes
 * - comments
 *
 * File Constraints:
 * - Max file size: 10 MB
 * - Allowed types: images (jpg, png, gif), documents (pdf, docx, txt), archives (zip)
 * - Virus scanning enabled
 */

import { apiClient, type ApiResponse } from "./client"
import type { Attachment, UploadAttachmentInput, UpdateAttachmentInput } from "@/lib/types/api"

class AttachmentsService {
  /**
   * Get all attachments for a specific entity
   * GET /{entityType}/{entityId}/attachments
   *
   * @param entityType - Type of entity (projects, findings, scopes, comments)
   * @param entityId - ID of the entity
   * @returns List of attachments
   */
  async list(entityType: string, entityId: string): Promise<Attachment[]> {
    const response = await apiClient.get<ApiResponse<Attachment[]>>(
      `/${entityType}/${entityId}/attachments`
    )
    return response.data
  }

  /**
   * Upload a file attachment
   * POST /{entityType}/{entityId}/attachments
   *
   * @param entityType - Type of entity (projects, findings, scopes, comments)
   * @param entityId - ID of the entity
   * @param file - File to upload
   * @param description - Optional description
   * @returns Uploaded attachment
   */
  async upload(
    entityType: string,
    entityId: string,
    file: File,
    description?: string
  ): Promise<Attachment> {
    const formData = new FormData()
    formData.append("file", file)
    if (description) {
      formData.append("description", description)
    }

    const response = await apiClient.post<ApiResponse<Attachment>>(
      `/${entityType}/${entityId}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return response.data
  }

  /**
   * Upload multiple files at once
   * POST /{entityType}/{entityId}/attachments (multiple calls)
   *
   * @param entityType - Type of entity
   * @param entityId - ID of the entity
   * @param files - Array of files to upload
   * @param description - Optional description for all files
   * @returns Array of uploaded attachments
   */
  async uploadMultiple(
    entityType: string,
    entityId: string,
    files: File[],
    description?: string
  ): Promise<Attachment[]> {
    const uploadPromises = files.map((file) => this.upload(entityType, entityId, file, description))
    return Promise.all(uploadPromises)
  }

  /**
   * Get attachment metadata
   * GET /attachments/{attachment}
   *
   * @param attachmentId - Attachment ID
   * @returns Attachment metadata
   */
  async get(attachmentId: string): Promise<Attachment> {
    const response = await apiClient.get<ApiResponse<Attachment>>(`/attachments/${attachmentId}`)
    return response.data
  }

  /**
   * Download a file attachment
   * GET /attachments/{attachment}/download
   *
   * @param attachmentId - Attachment ID
   * @returns File blob
   */
  async download(attachmentId: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(`/attachments/${attachmentId}/download`, undefined, {
      responseType: "blob",
    })
    return response
  }

  /**
   * Download attachment and trigger browser download
   * Convenience method that downloads and saves file
   *
   * @param attachmentId - Attachment ID
   * @param filename - Filename to save as
   */
  async downloadAndSave(attachmentId: string, filename: string): Promise<void> {
    const blob = await this.download(attachmentId)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  /**
   * Update attachment metadata
   * PUT /attachments/{attachment}
   *
   * @param attachmentId - Attachment ID
   * @param data - Updated metadata
   * @returns Updated attachment
   */
  async update(attachmentId: string, data: UpdateAttachmentInput): Promise<Attachment> {
    const response = await apiClient.put<ApiResponse<Attachment>>(
      `/attachments/${attachmentId}`,
      data
    )
    return response.data
  }

  /**
   * Delete an attachment
   * DELETE /attachments/{attachment}
   *
   * @param attachmentId - Attachment ID
   */
  async delete(attachmentId: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/attachments/${attachmentId}`)
  }

  /**
   * Get attachments for a Project
   * Convenience method for Project attachments
   *
   * @param projectId - Project ID
   * @returns List of attachments
   */
  async getProjectAttachments(projectId: string): Promise<Attachment[]> {
    return this.list("projects", projectId)
  }

  /**
   * Get attachments for a Finding
   * Convenience method for Finding attachments
   *
   * @param findingId - Finding ID
   * @returns List of attachments
   */
  async getFindingAttachments(findingId: string): Promise<Attachment[]> {
    return this.list("findings", findingId)
  }

  /**
   * Get attachments for a Scope
   * Convenience method for Scope attachments
   *
   * @param scopeId - Scope ID
   * @returns List of attachments
   */
  async getScopeAttachments(scopeId: string): Promise<Attachment[]> {
    return this.list("scopes", scopeId)
  }

  /**
   * Get attachments for a Comment
   * Convenience method for Comment attachments
   *
   * @param commentId - Comment ID
   * @returns List of attachments
   */
  async getCommentAttachments(commentId: string): Promise<Attachment[]> {
    return this.list("comments", commentId)
  }

  /**
   * Validate file before upload
   * Check file size and type constraints
   *
   * @param file - File to validate
   * @returns Validation result
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB in bytes
    const ALLOWED_TYPES = [
      // Images
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      // Documents
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      // Archives
      "application/zip",
      "application/x-zip-compressed",
    ]

    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      }
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `File type "${file.type}" is not allowed. Allowed types: jpg, png, gif, pdf, docx, txt, zip`,
      }
    }

    return { valid: true }
  }

  /**
   * Validate multiple files before upload
   *
   * @param files - Files to validate
   * @returns Validation results for all files
   */
  validateFiles(files: File[]): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    files.forEach((file, index) => {
      const result = this.validateFile(file)
      if (!result.valid && result.error) {
        errors.push(`File ${index + 1} (${file.name}): ${result.error}`)
      }
    })

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

// Export singleton instance
export const attachmentsService = new AttachmentsService()

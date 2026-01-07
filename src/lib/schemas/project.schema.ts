/**
 * Project Validation Schemas
 * Zod schemas for validating project data before submission to API
 */

import { z } from "zod"

// ===========================
// Enums
// ===========================

export const projectStatusEnum = z.enum([
  "planning",
  "active",
  "on-hold",
  "completed",
  "cancelled",
])

export const testTypeEnum = z.enum(["black-box", "white-box", "gray-box"])

// ===========================
// Metadata Schema
// ===========================

export const projectMetadataSchema = z
  .object({
    testType: testTypeEnum.optional(),
    scope: z.string().max(1000, "Scope description too long").optional(),
    client: z.string().max(255, "Client name too long").optional(),
  })
  .optional()

// ===========================
// Create Project Schema
// ===========================

export const createProjectSchema = z
  .object({
    name: z
      .string()
      .min(1, "Project name is required")
      .max(255, "Project name too long (max 255 characters)"),
    description: z
      .string()
      .max(5000, "Description too long (max 5000 characters)")
      .optional()
      .nullable(),
    status: projectStatusEnum,
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)"),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)")
      .optional()
      .nullable(),
    created_by: z.string().uuid("Invalid user ID"),
    tags: z
      .array(z.string().max(50, "Tag too long (max 50 characters)"))
      .max(20, "Too many tags (max 20)")
      .optional(),
    metadata: projectMetadataSchema,
  })
  .refine(
    (data) => {
      if (data.end_date && data.start_date) {
        return new Date(data.end_date) >= new Date(data.start_date)
      }
      return true
    },
    {
      message: "End date must be on or after start date",
      path: ["end_date"],
    }
  )

// ===========================
// Update Project Schema
// ===========================

export const updateProjectSchema = z
  .object({
    name: z
      .string()
      .min(1, "Project name is required")
      .max(255, "Project name too long (max 255 characters)")
      .optional(),
    description: z
      .string()
      .max(5000, "Description too long (max 5000 characters)")
      .optional()
      .nullable(),
    status: projectStatusEnum.optional(),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)")
      .optional(),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)")
      .optional()
      .nullable(),
    tags: z
      .array(z.string().max(50, "Tag too long (max 50 characters)"))
      .max(20, "Too many tags (max 20)")
      .optional(),
    metadata: projectMetadataSchema,
  })
  .refine(
    (data) => {
      if (data.end_date && data.start_date) {
        return new Date(data.end_date) >= new Date(data.start_date)
      }
      return true
    },
    {
      message: "End date must be on or after start date",
      path: ["end_date"],
    }
  )

// ===========================
// Assign Users Schema
// ===========================

export const assignUsersSchema = z.object({
  user_ids: z
    .array(z.string().uuid("Invalid user ID"))
    .min(1, "At least one user is required")
    .max(50, "Too many users (max 50)"),
  role: z.enum(["member", "lead"]).optional().default("member"),
})

// ===========================
// Type Exports
// ===========================

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type AssignUsersInput = z.infer<typeof assignUsersSchema>
export type ProjectStatus = z.infer<typeof projectStatusEnum>
export type TestType = z.infer<typeof testTypeEnum>

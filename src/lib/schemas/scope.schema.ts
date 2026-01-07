/**
 * Scope Validation Schemas
 * Zod schemas for validating scope data including services array
 */

import { z } from "zod"

// ===========================
// Enums
// ===========================

export const scopeTypeEnum = z.enum(["domain", "ip", "subnet", "service", "application"])

export const scopeStatusEnum = z.enum(["in-scope", "out-of-scope", "testing", "completed"])

export const protocolEnum = z.enum(["tcp", "udp", "http", "https", "ftp", "ssh", "smtp", "dns"])

// ===========================
// Service Schema
// ===========================

export const scopeServiceSchema = z.object({
  name: z
    .string()
    .min(1, "Service name is required")
    .max(100, "Service name too long (max 100 characters)"),
  version: z.string().max(50, "Version too long (max 50 characters)").optional(),
})

// ===========================
// Create Scope Schema
// ===========================

export const createScopeSchema = z.object({
  project_id: z.string().uuid("Invalid project ID"),
  name: z
    .string()
    .min(1, "Scope name is required")
    .max(255, "Scope name too long (max 255 characters)"),
  type: scopeTypeEnum,
  target: z
    .string()
    .min(1, "Target is required")
    .max(255, "Target too long (max 255 characters)"),
  port: z
    .number()
    .int("Port must be an integer")
    .min(1, "Port must be between 1 and 65535")
    .max(65535, "Port must be between 1 and 65535")
    .optional()
    .nullable(),
  protocol: protocolEnum.optional().nullable(),
  status: scopeStatusEnum,
  notes: z.string().max(5000, "Notes too long (max 5000 characters)").optional().nullable(),
  services: z
    .array(scopeServiceSchema)
    .max(100, "Too many services (max 100)")
    .optional()
    .nullable(),
  tags: z
    .array(z.string().max(50, "Tag too long (max 50 characters)"))
    .max(20, "Too many tags (max 20)")
    .optional(),
})

// ===========================
// Update Scope Schema
// ===========================

export const updateScopeSchema = createScopeSchema.partial()

// ===========================
// Bulk Create Scopes Schema
// ===========================

export const bulkCreateScopesSchema = z.object({
  project_id: z.string().uuid("Invalid project ID"),
  scopes: z
    .array(createScopeSchema.omit({ project_id: true }))
    .min(1, "At least one scope is required")
    .max(100, "Too many scopes (max 100)"),
})

// ===========================
// Type Exports
// ===========================

export type CreateScopeInput = z.infer<typeof createScopeSchema>
export type UpdateScopeInput = z.infer<typeof updateScopeSchema>
export type BulkCreateScopesInput = z.infer<typeof bulkCreateScopesSchema>
export type ScopeType = z.infer<typeof scopeTypeEnum>
export type ScopeStatus = z.infer<typeof scopeStatusEnum>
export type Protocol = z.infer<typeof protocolEnum>
export type ScopeService = z.infer<typeof scopeServiceSchema>

/**
 * Finding Validation Schemas
 * Zod schemas for validating finding data with nested objects (CVSS, PoC, Remediation)
 */

import { z } from "zod"

// ===========================
// Enums
// ===========================

export const severityEnum = z.enum(["info", "low", "medium", "high", "critical"])

export const findingStatusEnum = z.enum([
  "open",
  "confirmed",
  "false-positive",
  "fixed",
  "accepted",
])

export const cvssVersionEnum = z.enum(["2.0", "3.0", "3.1", "4.0"])

// ===========================
// CVE ID Validation
// ===========================

export const cveIdSchema = z
  .string()
  .regex(/^CVE-\d{4}-\d{4,}$/, "Invalid CVE ID format (expected CVE-YYYY-NNNN)")

// ===========================
// CVSS Schema
// ===========================

export const cvssSchema = z
  .object({
    version: cvssVersionEnum,
    vector: z
      .string()
      .min(1, "CVSS vector is required")
      .max(100, "CVSS vector too long (max 100 characters)"),
    score: z
      .number()
      .min(0, "CVSS score must be between 0 and 10")
      .max(10, "CVSS score must be between 0 and 10"),
  })
  .optional()
  .nullable()

// ===========================
// Proof of Concept Schema
// ===========================

export const proofOfConceptSchema = z
  .object({
    steps: z
      .array(z.string().max(1000, "Step too long (max 1000 characters)"))
      .max(50, "Too many steps (max 50)")
      .optional(),
    payload: z.string().max(5000, "Payload too long (max 5000 characters)").optional(),
    screenshot: z.string().url("Invalid screenshot URL").optional(),
  })
  .optional()
  .nullable()

// ===========================
// Remediation Schema
// ===========================

export const remediationSchema = z
  .object({
    summary: z
      .string()
      .min(1, "Remediation summary is required")
      .max(10000, "Summary too long (max 10000 characters)"),
    steps: z
      .array(z.string().max(1000, "Step too long (max 1000 characters)"))
      .max(50, "Too many steps (max 50)")
      .optional(),
    priority: z.string().max(50, "Priority too long").optional(),
  })
  .optional()
  .nullable()

// ===========================
// Create Finding Schema
// ===========================

export const createFindingSchema = z.object({
  scope_id: z.string().uuid("Invalid scope ID"),
  title: z
    .string()
    .min(1, "Finding title is required")
    .max(255, "Title too long (max 255 characters)"),
  description: z
    .string()
    .min(1, "Finding description is required")
    .max(10000, "Description too long (max 10000 characters)"),
  vulnerability_type: z
    .string()
    .min(1, "Vulnerability type is required")
    .max(100, "Vulnerability type too long (max 100 characters)"),
  severity: severityEnum,
  cvss: cvssSchema,
  status: findingStatusEnum,
  proof_of_concept: proofOfConceptSchema,
  remediation: remediationSchema,
  attachments: z
    .array(z.string().max(500, "Attachment path too long"))
    .max(50, "Too many attachments (max 50)")
    .optional(),
  tags: z
    .array(z.string().max(50, "Tag too long (max 50 characters)"))
    .max(20, "Too many tags (max 20)")
    .optional(),
  discovered_by: z.string().uuid("Invalid user ID"),
  discovered_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)")
    .optional(),
  cve_references: z.array(cveIdSchema).max(10, "Too many CVE references (max 10)").optional(),
})

// ===========================
// Update Finding Schema
// ===========================

export const updateFindingSchema = createFindingSchema.partial()

// ===========================
// Update Finding Status Schema
// ===========================

export const updateFindingStatusSchema = z.object({
  status: findingStatusEnum,
})

// ===========================
// Bulk Update Status Schema
// ===========================

export const bulkUpdateFindingStatusSchema = z.object({
  finding_ids: z
    .array(z.string().uuid("Invalid finding ID"))
    .min(1, "At least one finding is required")
    .max(100, "Too many findings (max 100)"),
  status: findingStatusEnum,
})

// ===========================
// Type Exports
// ===========================

export type CreateFindingInput = z.infer<typeof createFindingSchema>
export type UpdateFindingInput = z.infer<typeof updateFindingSchema>
export type UpdateFindingStatusInput = z.infer<typeof updateFindingStatusSchema>
export type BulkUpdateFindingStatusInput = z.infer<typeof bulkUpdateFindingStatusSchema>
export type Severity = z.infer<typeof severityEnum>
export type FindingStatus = z.infer<typeof findingStatusEnum>
export type CVSSVersion = z.infer<typeof cvssVersionEnum>
export type CVSS = z.infer<typeof cvssSchema>
export type ProofOfConcept = z.infer<typeof proofOfConceptSchema>
export type Remediation = z.infer<typeof remediationSchema>

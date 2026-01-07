/**
 * CVE Tracking Validation Schemas
 * Zod schemas for validating CVE tracking data with affected products
 */

import { z } from "zod"

// ===========================
// Enums
// ===========================

export const cveSeverityEnum = z.enum(["low", "medium", "high", "critical"])

export const cvssVersionEnum = z.enum(["2.0", "3.0", "3.1", "4.0"])

// ===========================
// CVE ID Validation
// ===========================

/**
 * CVE ID format: CVE-YYYY-NNNN (or more digits)
 * Examples: CVE-2024-1234, CVE-2023-12345
 */
export const cveIdSchema = z
  .string()
  .regex(/^CVE-\d{4}-\d{4,}$/, "Invalid CVE ID format (expected CVE-YYYY-NNNN)")
  .toUpperCase()

// ===========================
// CVSS Schema
// ===========================

export const cveCVSSSchema = z.object({
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

// ===========================
// Affected Product Schema
// ===========================

export const affectedProductSchema = z.object({
  vendor: z
    .string()
    .min(1, "Vendor is required")
    .max(255, "Vendor name too long (max 255 characters)"),
  product: z
    .string()
    .min(1, "Product is required")
    .max(255, "Product name too long (max 255 characters)"),
  versionStart: z.string().max(50, "Version too long (max 50 characters)").optional(),
  versionEnd: z.string().max(50, "Version too long (max 50 characters)").optional(),
})

// ===========================
// Tracked Service Schema
// ===========================

export const trackedServiceSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  scopeId: z.string().uuid("Invalid scope ID"),
  service: z
    .string()
    .min(1, "Service name is required")
    .max(255, "Service name too long (max 255 characters)"),
  isAffected: z.boolean(),
})

// ===========================
// Create CVE Tracking Schema
// ===========================

export const createCveTrackingSchema = z.object({
  cve_id: cveIdSchema,
  description: z
    .string()
    .min(1, "CVE description is required")
    .max(10000, "Description too long (max 10000 characters)"),
  severity: cveSeverityEnum,
  cvss: cveCVSSSchema,
  published_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)"),
  affected_products: z
    .array(affectedProductSchema)
    .max(100, "Too many affected products (max 100)")
    .optional(),
  references: z
    .array(z.string().url("Invalid reference URL"))
    .max(50, "Too many references (max 50)")
    .optional(),
})

// ===========================
// Update CVE Tracking Schema
// ===========================

export const updateCveTrackingSchema = createCveTrackingSchema.partial()

// ===========================
// Match Services Schema
// ===========================

export const matchServicesSchema = z.object({
  project_id: z.string().uuid("Invalid project ID"),
  services: z
    .array(
      z.object({
        name: z.string().min(1, "Service name is required"),
        version: z.string().optional(),
      })
    )
    .min(1, "At least one service is required")
    .max(100, "Too many services (max 100)"),
})

// ===========================
// CVE Sync Schema
// ===========================

export const cveSyncSchema = z.object({
  source: z.enum(["nvd", "mitre"]).optional().default("nvd"),
  from_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)")
    .optional(),
  to_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)")
    .optional(),
})

// ===========================
// Type Exports
// ===========================

export type CreateCveTrackingInput = z.infer<typeof createCveTrackingSchema>
export type UpdateCveTrackingInput = z.infer<typeof updateCveTrackingSchema>
export type MatchServicesInput = z.infer<typeof matchServicesSchema>
export type CveSyncInput = z.infer<typeof cveSyncSchema>
export type CveSeverity = z.infer<typeof cveSeverityEnum>
export type CVSSVersion = z.infer<typeof cvssVersionEnum>
export type CveCVSS = z.infer<typeof cveCVSSSchema>
export type AffectedProduct = z.infer<typeof affectedProductSchema>
export type TrackedService = z.infer<typeof trackedServiceSchema>

// ===========================
// CVE Helpers
// ===========================

/**
 * Parse CVE ID and extract year and number
 */
export function parseCveId(cveId: string): { year: number; number: number } | null {
  const match = cveId.match(/^CVE-(\d{4})-(\d{4,})$/)
  if (!match) return null

  return {
    year: parseInt(match[1], 10),
    number: parseInt(match[2], 10),
  }
}

/**
 * Format CVE ID to uppercase
 */
export function formatCveId(cveId: string): string {
  return cveId.toUpperCase()
}

/**
 * Validate CVE ID and return detailed result
 */
export function validateCveId(
  cveId: string
): { isValid: boolean; formatted: string; error?: string } {
  const result = cveIdSchema.safeParse(cveId)

  if (result.success) {
    return {
      isValid: true,
      formatted: result.data,
    }
  }

  return {
    isValid: false,
    formatted: cveId.toUpperCase(),
    error: result.error.errors[0]?.message || "Invalid CVE ID",
  }
}

/**
 * Get severity color class for UI
 */
export function getCveSeverityColor(severity: CveSeverity): string {
  const colors: Record<CveSeverity, string> = {
    low: "text-blue-600 bg-blue-50",
    medium: "text-yellow-600 bg-yellow-50",
    high: "text-orange-600 bg-orange-50",
    critical: "text-red-600 bg-red-50",
  }
  return colors[severity]
}

/**
 * Convert CVSS score to severity
 */
export function cvssScoreToSeverity(score: number): CveSeverity {
  if (score >= 9.0) return "critical"
  if (score >= 7.0) return "high"
  if (score >= 4.0) return "medium"
  return "low"
}

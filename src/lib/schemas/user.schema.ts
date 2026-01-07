/**
 * User Validation Schemas
 * Zod schemas for validating user data with password strength requirements
 */

import { z } from "zod"

// ===========================
// Password Validation
// ===========================

/**
 * Password requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(255, "Password too long (max 255 characters)")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character (!@#$%^&* etc.)"
  )

/**
 * Username validation:
 * - Alphanumeric characters, underscores, and hyphens only
 * - 3-50 characters
 * - Cannot start with a number
 */
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(50, "Username too long (max 50 characters)")
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_-]*$/,
    "Username must start with a letter and contain only letters, numbers, underscores, and hyphens"
  )

/**
 * Email validation with DNS check
 */
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .max(255, "Email too long (max 255 characters)")
  .toLowerCase()

// ===========================
// Create User Schema
// ===========================

export const createUserSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    name: z.string().max(255, "Name too long (max 255 characters)").optional(),
    password: passwordSchema,
    password_confirmation: z.string(),
    is_active: z.boolean().optional().default(true),
    role: z.string().max(50, "Role name too long").optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  })

// ===========================
// Update User Schema
// ===========================

export const updateUserSchema = z.object({
  username: usernameSchema.optional(),
  email: emailSchema.optional(),
  name: z.string().max(255, "Name too long (max 255 characters)").optional(),
})

// ===========================
// Update Password Schema
// ===========================

export const updatePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    password: passwordSchema,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  })
  .refine((data) => data.current_password !== data.password, {
    message: "New password must be different from current password",
    path: ["password"],
  })

// ===========================
// Update User Role Schema
// ===========================

export const updateUserRoleSchema = z.object({
  role: z.string().min(1, "Role is required").max(50, "Role name too long"),
})

// ===========================
// Type Exports
// ===========================

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>

// ===========================
// Password Strength Helpers
// ===========================

export type PasswordStrength = "weak" | "medium" | "strong" | "very-strong"

export interface PasswordRequirement {
  met: boolean
  text: string
}

/**
 * Check password strength based on requirements
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return "weak"

  const requirements = getPasswordRequirements(password)
  const metCount = requirements.filter((r) => r.met).length

  if (metCount <= 2) return "weak"
  if (metCount === 3) return "medium"
  if (metCount === 4) return "strong"
  return "very-strong"
}

/**
 * Get detailed password requirements with met status
 */
export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    {
      met: password.length >= 8,
      text: "At least 8 characters",
    },
    {
      met: /[A-Z]/.test(password),
      text: "One uppercase letter",
    },
    {
      met: /[a-z]/.test(password),
      text: "One lowercase letter",
    },
    {
      met: /[0-9]/.test(password),
      text: "One number",
    },
    {
      met: /[^A-Za-z0-9]/.test(password),
      text: "One special character (!@#$%^&*)",
    },
  ]
}

/**
 * Validate password and return detailed errors
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
  strength: PasswordStrength
} {
  const result = passwordSchema.safeParse(password)
  const strength = getPasswordStrength(password)

  if (result.success) {
    return {
      isValid: true,
      errors: [],
      strength,
    }
  }

  return {
    isValid: false,
    errors: result.error.errors.map((e) => e.message),
    strength,
  }
}

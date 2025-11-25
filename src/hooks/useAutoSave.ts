/**
 * Auto-Save Hook
 *
 * Automatically saves form data with debouncing and status tracking.
 * Supports draft saving, conflict detection, and recovery.
 */

import { useState, useEffect, useRef, useCallback } from "react"
import { useDebounce } from "./use-debounce"

// ============================================================================
// Types
// ============================================================================

export interface AutoSaveOptions {
  /** Debounce delay in milliseconds (default: 2000ms) */
  debounceMs?: number
  /** Whether to save on unmount (default: true) */
  saveOnUnmount?: boolean
  /** Minimum number of changes before auto-saving (default: 1) */
  minChanges?: number
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean
  /** Storage key for draft persistence */
  draftKey?: string
  /** Callback when save starts */
  onSaveStart?: () => void
  /** Callback when save completes */
  onSaveComplete?: (data: any) => void
  /** Callback when save fails */
  onSaveError?: (error: Error) => void
}

export interface AutoSaveState {
  /** Whether currently saving */
  isSaving: boolean
  /** Whether save is pending (debouncing) */
  isPending: boolean
  /** Last successful save timestamp */
  lastSaved: Date | null
  /** Number of unsaved changes */
  unsavedChanges: number
  /** Last error if any */
  error: Error | null
  /** Whether there's a draft available */
  hasDraft: boolean
}

export interface AutoSaveReturn<T> extends AutoSaveState {
  /** Trigger immediate save */
  saveNow: () => Promise<void>
  /** Clear the draft from storage */
  clearDraft: () => void
  /** Load draft from storage */
  loadDraft: () => T | null
  /** Reset the auto-save state */
  reset: () => void
  /** Mark data as saved (useful after manual save) */
  markSaved: () => void
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  options: AutoSaveOptions = {}
): AutoSaveReturn<T> {
  const {
    debounceMs = 2000,
    saveOnUnmount = true,
    minChanges = 1,
    enabled = true,
    draftKey,
    onSaveStart,
    onSaveComplete,
    onSaveError,
  } = options

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [unsavedChanges, setUnsavedChanges] = useState(0)
  const [error, setError] = useState<Error | null>(null)
  const [hasDraft, setHasDraft] = useState(false)

  // Refs for tracking
  const lastSavedDataRef = useRef<string>(JSON.stringify(data))
  const dataRef = useRef<T>(data)
  const isMountedRef = useRef(true)
  const savePromiseRef = useRef<Promise<void> | null>(null)

  // Update data ref
  useEffect(() => {
    dataRef.current = data
  }, [data])

  // Debounced data for triggering saves
  const debouncedData = useDebounce(data, debounceMs)

  // Check if data has changed
  const hasDataChanged = useCallback(() => {
    return JSON.stringify(dataRef.current) !== lastSavedDataRef.current
  }, [])

  // -------------------------------------------------------------------------
  // Draft Persistence
  // -------------------------------------------------------------------------

  // Check for existing draft on mount
  useEffect(() => {
    if (draftKey) {
      try {
        const draft = sessionStorage.getItem(`autosave_draft_${draftKey}`)
        setHasDraft(!!draft)
      } catch {
        // Ignore storage errors
      }
    }
  }, [draftKey])

  // Save draft to storage
  const saveDraft = useCallback(() => {
    if (draftKey && hasDataChanged()) {
      try {
        sessionStorage.setItem(
          `autosave_draft_${draftKey}`,
          JSON.stringify({
            data: dataRef.current,
            timestamp: new Date().toISOString(),
          })
        )
        setHasDraft(true)
      } catch {
        // Ignore storage errors
      }
    }
  }, [draftKey, hasDataChanged])

  // Load draft from storage
  const loadDraft = useCallback((): T | null => {
    if (!draftKey) return null

    try {
      const stored = sessionStorage.getItem(`autosave_draft_${draftKey}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.data as T
      }
    } catch {
      // Ignore parsing errors
    }
    return null
  }, [draftKey])

  // Clear draft from storage
  const clearDraft = useCallback(() => {
    if (draftKey) {
      try {
        sessionStorage.removeItem(`autosave_draft_${draftKey}`)
        setHasDraft(false)
      } catch {
        // Ignore storage errors
      }
    }
  }, [draftKey])

  // -------------------------------------------------------------------------
  // Save Logic
  // -------------------------------------------------------------------------

  const performSave = useCallback(async () => {
    if (!hasDataChanged() || isSaving) {
      return
    }

    // Check minimum changes threshold
    if (unsavedChanges < minChanges) {
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      onSaveStart?.()

      // Save draft first as backup
      saveDraft()

      const savePromise = onSave(dataRef.current)
      savePromiseRef.current = savePromise
      await savePromise

      if (isMountedRef.current) {
        lastSavedDataRef.current = JSON.stringify(dataRef.current)
        setLastSaved(new Date())
        setUnsavedChanges(0)
        clearDraft()
        onSaveComplete?.(dataRef.current)
      }
    } catch (err) {
      if (isMountedRef.current) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        onSaveError?.(error)
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false)
        savePromiseRef.current = null
      }
    }
  }, [
    hasDataChanged,
    isSaving,
    unsavedChanges,
    minChanges,
    onSave,
    onSaveStart,
    onSaveComplete,
    onSaveError,
    saveDraft,
    clearDraft,
  ])

  // Immediate save function
  const saveNow = useCallback(async () => {
    if (savePromiseRef.current) {
      await savePromiseRef.current
    }
    await performSave()
  }, [performSave])

  // Mark as saved (for external saves)
  const markSaved = useCallback(() => {
    lastSavedDataRef.current = JSON.stringify(dataRef.current)
    setLastSaved(new Date())
    setUnsavedChanges(0)
    clearDraft()
  }, [clearDraft])

  // Reset state
  const reset = useCallback(() => {
    lastSavedDataRef.current = JSON.stringify(dataRef.current)
    setLastSaved(null)
    setUnsavedChanges(0)
    setError(null)
    clearDraft()
  }, [clearDraft])

  // -------------------------------------------------------------------------
  // Track Changes
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (hasDataChanged()) {
      setUnsavedChanges((prev) => prev + 1)
    }
  }, [data, hasDataChanged])

  // -------------------------------------------------------------------------
  // Auto-save Effect
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (enabled && hasDataChanged() && unsavedChanges >= minChanges) {
      performSave()
    }
  }, [debouncedData, enabled, hasDataChanged, unsavedChanges, minChanges, performSave])

  // -------------------------------------------------------------------------
  // Cleanup
  // -------------------------------------------------------------------------

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false

      // Save on unmount if enabled and there are changes
      if (saveOnUnmount && hasDataChanged()) {
        // Save draft synchronously for persistence
        if (draftKey) {
          try {
            sessionStorage.setItem(
              `autosave_draft_${draftKey}`,
              JSON.stringify({
                data: dataRef.current,
                timestamp: new Date().toISOString(),
              })
            )
          } catch {
            // Ignore storage errors
          }
        }
      }
    }
  }, [saveOnUnmount, hasDataChanged, draftKey])

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------

  return {
    isSaving,
    isPending: unsavedChanges > 0 && !isSaving,
    lastSaved,
    unsavedChanges,
    error,
    hasDraft,
    saveNow,
    clearDraft,
    loadDraft,
    reset,
    markSaved,
  }
}

// ============================================================================
// Auto-Save Status Component
// ============================================================================

export interface AutoSaveStatusProps {
  state: AutoSaveState
  className?: string
  showPending?: boolean
}

export function formatAutoSaveStatus(state: AutoSaveState): string {
  if (state.isSaving) {
    return "Saving..."
  }

  if (state.error) {
    return "Save failed"
  }

  if (state.lastSaved) {
    const diff = Date.now() - state.lastSaved.getTime()
    if (diff < 5000) {
      return "Saved"
    }
    if (diff < 60000) {
      return "Saved just now"
    }
    return `Saved at ${state.lastSaved.toLocaleTimeString()}`
  }

  if (state.unsavedChanges > 0) {
    return "Unsaved changes"
  }

  return ""
}

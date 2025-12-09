import { useEffect, useRef } from "react"
import { UseFormWatch } from "react-hook-form"
import { useDebounce } from "./useDebounce"

interface UseFormAutoSaveOptions {
  formId: string
  watch: UseFormWatch<any>
  interval?: number
  onSave?: (data: any) => void
}

/**
 * Auto-save form data to localStorage with debouncing
 * @param options - Configuration options
 * @returns Methods to get and clear saved drafts
 */
export function useFormAutoSave({
  formId,
  watch,
  interval = 2000,
  onSave,
}: UseFormAutoSaveOptions) {
  const formData = watch()
  const debouncedData = useDebounce(formData, interval)
  const hasChanged = useRef(false)

  useEffect(() => {
    if (hasChanged.current && debouncedData) {
      const draftKey = `draft-${formId}`
      try {
        localStorage.setItem(draftKey, JSON.stringify(debouncedData))
        localStorage.setItem(`${draftKey}-timestamp`, new Date().toISOString())
        onSave?.(debouncedData)
      } catch (error) {
        console.error("Failed to save form draft:", error)
      }
    }
    hasChanged.current = true
  }, [debouncedData, formId, onSave])

  const getDraft = () => {
    const draftKey = `draft-${formId}`
    try {
      const draft = localStorage.getItem(draftKey)
      const timestamp = localStorage.getItem(`${draftKey}-timestamp`)

      if (draft && timestamp) {
        return {
          data: JSON.parse(draft),
          savedAt: new Date(timestamp),
        }
      }
    } catch (error) {
      console.error("Failed to retrieve form draft:", error)
    }
    return null
  }

  const clearDraft = () => {
    const draftKey = `draft-${formId}`
    try {
      localStorage.removeItem(draftKey)
      localStorage.removeItem(`${draftKey}-timestamp`)
    } catch (error) {
      console.error("Failed to clear form draft:", error)
    }
  }

  return { getDraft, clearDraft }
}

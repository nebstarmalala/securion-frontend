/**
 * Recently Viewed Items Hook
 * Tracks and persists recently viewed items in localStorage
 */

import { useState, useEffect, useCallback } from "react"

export interface RecentlyViewedItem {
  id: string
  type: "project" | "scope" | "finding" | "cve" | "report"
  title: string
  href: string
  viewedAt: string
  metadata?: {
    status?: string
    severity?: string
    projectName?: string
  }
}

const STORAGE_KEY = "securion_recently_viewed"
const MAX_ITEMS = 10

function getStoredItems(): RecentlyViewedItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Invalid JSON, reset
  }
  return []
}

function setStoredItems(items: RecentlyViewedItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    setItems(getStoredItems())
  }, [])

  // Add or update an item
  const addItem = useCallback((item: Omit<RecentlyViewedItem, "viewedAt">) => {
    setItems(prevItems => {
      // Remove existing item with same id and type
      const filtered = prevItems.filter(
        i => !(i.id === item.id && i.type === item.type)
      )

      // Add new item at the beginning
      const newItem: RecentlyViewedItem = {
        ...item,
        viewedAt: new Date().toISOString(),
      }

      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS)
      setStoredItems(updated)
      return updated
    })
  }, [])

  // Remove an item
  const removeItem = useCallback((id: string, type: RecentlyViewedItem["type"]) => {
    setItems(prevItems => {
      const filtered = prevItems.filter(
        i => !(i.id === id && i.type === type)
      )
      setStoredItems(filtered)
      return filtered
    })
  }, [])

  // Clear all items
  const clearAll = useCallback(() => {
    setItems([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Get items by type
  const getByType = useCallback((type: RecentlyViewedItem["type"]) => {
    return items.filter(i => i.type === type)
  }, [items])

  return {
    items,
    addItem,
    removeItem,
    clearAll,
    getByType,
  }
}

/**
 * Helper to track page views
 * Call this in detail pages to track views
 */
export function trackView(
  type: RecentlyViewedItem["type"],
  id: string,
  title: string,
  href: string,
  metadata?: RecentlyViewedItem["metadata"]
) {
  const items = getStoredItems()

  // Remove existing
  const filtered = items.filter(
    i => !(i.id === id && i.type === type)
  )

  // Add new at beginning
  const newItem: RecentlyViewedItem = {
    id,
    type,
    title,
    href,
    viewedAt: new Date().toISOString(),
    metadata,
  }

  const updated = [newItem, ...filtered].slice(0, MAX_ITEMS)
  setStoredItems(updated)
}

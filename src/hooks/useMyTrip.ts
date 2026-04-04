import { useState } from 'react'

const STORAGE_KEY = 'hue-ni-trip'

function getStoredIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function useMyTrip() {
  const [savedIds, setSavedIds] = useState<string[]>(getStoredIds)

  function addPlace(id: string) {
    setSavedIds(current => {
      if (current.includes(id)) return current
      const next = [...current, id]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function removePlace(id: string) {
    setSavedIds(current => {
      const next = current.filter(sid => sid !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function clearAll() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    setSavedIds([])
  }

  function isSaved(id: string): boolean {
    return savedIds.includes(id)
  }

  return { savedIds, addPlace, removePlace, clearAll, isSaved }
}

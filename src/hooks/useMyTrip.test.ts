import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useMyTrip } from './useMyTrip'

beforeEach(() => {
  localStorage.clear()
})

describe('useMyTrip', () => {
  it('starts with empty list when localStorage is empty', () => {
    const { result } = renderHook(() => useMyTrip())
    expect(result.current.savedIds).toEqual([])
  })

  it('restores saved ids from localStorage on mount', () => {
    localStorage.setItem('hue-ni-trip', JSON.stringify(['tu-duc-tomb', 'hue-citadel']))
    const { result } = renderHook(() => useMyTrip())
    expect(result.current.savedIds).toEqual(['tu-duc-tomb', 'hue-citadel'])
  })

  it('adds a place id', () => {
    const { result } = renderHook(() => useMyTrip())
    act(() => result.current.addPlace('khai-dinh-tomb'))
    expect(result.current.savedIds).toContain('khai-dinh-tomb')
  })

  it('does not add duplicate ids', () => {
    const { result } = renderHook(() => useMyTrip())
    act(() => {
      result.current.addPlace('khai-dinh-tomb')
      result.current.addPlace('khai-dinh-tomb')
    })
    expect(result.current.savedIds).toHaveLength(1)
  })

  it('removes a place id', () => {
    const { result } = renderHook(() => useMyTrip())
    act(() => result.current.addPlace('khai-dinh-tomb'))
    act(() => result.current.removePlace('khai-dinh-tomb'))
    expect(result.current.savedIds).not.toContain('khai-dinh-tomb')
  })

  it('removes only the specified id', () => {
    const { result } = renderHook(() => useMyTrip())
    act(() => {
      result.current.addPlace('khai-dinh-tomb')
      result.current.addPlace('tu-duc-tomb')
    })
    act(() => result.current.removePlace('khai-dinh-tomb'))
    expect(result.current.savedIds).toContain('tu-duc-tomb')
    expect(result.current.savedIds).not.toContain('khai-dinh-tomb')
  })

  it('clears all saved ids', () => {
    const { result } = renderHook(() => useMyTrip())
    act(() => {
      result.current.addPlace('khai-dinh-tomb')
      result.current.addPlace('tu-duc-tomb')
    })
    act(() => result.current.clearAll())
    expect(result.current.savedIds).toEqual([])
  })

  it('isSaved returns true for a saved id', () => {
    const { result } = renderHook(() => useMyTrip())
    act(() => result.current.addPlace('khai-dinh-tomb'))
    expect(result.current.isSaved('khai-dinh-tomb')).toBe(true)
  })

  it('isSaved returns false for an unsaved id', () => {
    const { result } = renderHook(() => useMyTrip())
    expect(result.current.isSaved('khai-dinh-tomb')).toBe(false)
  })

  it('persists changes to localStorage', () => {
    const { result } = renderHook(() => useMyTrip())
    act(() => result.current.addPlace('khai-dinh-tomb'))
    expect(JSON.parse(localStorage.getItem('hue-ni-trip')!)).toContain('khai-dinh-tomb')
  })

  it('clears localStorage on clearAll', () => {
    const { result } = renderHook(() => useMyTrip())
    act(() => result.current.addPlace('khai-dinh-tomb'))
    act(() => result.current.clearAll())
    expect(JSON.parse(localStorage.getItem('hue-ni-trip')!)).toEqual([])
  })
})

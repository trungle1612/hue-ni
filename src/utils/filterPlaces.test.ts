import { describe, it, expect } from 'vitest'
import { filterPlaces } from './filterPlaces'
import type { Place } from '../types'

const base: Omit<Place, 'id' | 'category' | 'specialty' | 'tags'> = {
  name: 'Test',
  coverImage: '',
  gallery: [],
  address: '',
  coordinates: { lat: 0, lng: 0 },
  rating: 4.5,
  priceRange: '₫₫',
  hours: { open: '08:00', close: '22:00' },
  vibe: '',
  description: '',
  insiderTips: [],
}

const cafe = (id: string, specialty: boolean | undefined, tags: string[] = []): Place => ({
  ...base,
  id,
  category: 'cafe',
  specialty,
  tags,
})

const tomb = (id: string): Place => ({
  ...base,
  id,
  category: 'tomb',
  tags: [],
})

describe('filterPlaces', () => {
  it('returns all places when category is all', () => {
    const places = [cafe('c1', true), tomb('t1')]
    expect(filterPlaces(places, 'all', null)).toHaveLength(2)
  })

  it('returns only specialty:true cafes when category is cafe', () => {
    const places = [
      cafe('c1', true),
      cafe('c2', false),
      cafe('c3', undefined),
    ]
    const result = filterPlaces(places, 'cafe', null)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c1')
  })

  it('filters specialty cafes by sub-type tag', () => {
    const places = [
      cafe('c1', true, ['hoai-co']),
      cafe('c2', true, ['san-vuon']),
    ]
    const result = filterPlaces(places, 'cafe', 'hoai-co')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c1')
  })

  it('returns all specialty cafes when subFilter is null', () => {
    const places = [
      cafe('c1', true, ['hoai-co']),
      cafe('c2', true, ['san-vuon']),
    ]
    expect(filterPlaces(places, 'cafe', null)).toHaveLength(2)
  })

  it('excludes non-specialty cafes even with matching tag', () => {
    const places = [
      cafe('c1', false, ['hoai-co']),
      cafe('c2', true, ['hoai-co']),
    ]
    const result = filterPlaces(places, 'cafe', 'hoai-co')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c2')
  })

  it('filters by non-cafe category, ignores specialty', () => {
    const places = [tomb('t1'), cafe('c1', false)]
    const result = filterPlaces(places, 'tomb', null)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('t1')
  })
})

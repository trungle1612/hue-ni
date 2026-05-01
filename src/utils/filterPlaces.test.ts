import { describe, it, expect } from 'vitest'
import { filterPlaces } from './filterPlaces'
import type { Place } from '../types'

const makeFood = (id: string, dishType: string[]): Place => ({
  id,
  name: `Place ${id}`,
  category: 'food',
  tags: [],
  coverImage: '',
  gallery: [],
  address: '',
  coordinates: { lat: 0, lng: 0 },
  rating: 4,
  priceRange: '₫',
  hours: { open: '07:00', close: '21:00' },
  vibe: '',
  description: '',
  insiderTips: [],
  foodTags: { dishType, mealTime: [], vibe: [] },
})

const places: Place[] = [
  makeFood('bun-bo-1',        ['bun-bo']),
  makeFood('bun-chay-1',      ['bun-chay']),
  makeFood('oc-1',            ['oc']),
  makeFood('che-1',           ['che']),
  makeFood('com-hen-1',       ['com-hen']),
  makeFood('banh-ep-1',       ['banh-ep']),
  makeFood('banh-canh-1',     ['banh-canh']),
  makeFood('cha-cua-1',       ['cha-cua']),
  makeFood('untagged-1',      []),
]

describe('filterPlaces – food category', () => {
  it('returns all food places when activeKey is all', () => {
    expect(filterPlaces(places, 'food', null)).toHaveLength(9)
  })

  it('returns only bun places when foodGroup=bun and no dish selected', () => {
    const result = filterPlaces(places, 'food', null, 'bun')
    expect(result.map(p => p.id)).toEqual(['bun-bo-1', 'bun-chay-1'])
  })

  it('returns only bun-bo when foodGroup=bun and foodDish=bun-bo', () => {
    const result = filterPlaces(places, 'food', null, 'bun', 'bun-bo')
    expect(result.map(p => p.id)).toEqual(['bun-bo-1'])
  })

  it('matches all banh-canh sub-variants when foodGroup=banh-canh', () => {
    const result = filterPlaces(places, 'food', null, 'banh-canh')
    expect(result.map(p => p.id)).toContain('banh-canh-1')
    expect(result.map(p => p.id)).toContain('cha-cua-1')
  })

  it('matches only cha-cua when foodDish=cha-cua', () => {
    const result = filterPlaces(places, 'food', null, 'banh-canh', 'cha-cua')
    expect(result.map(p => p.id)).toEqual(['cha-cua-1'])
  })

  it('returns oc places when foodGroup=oc', () => {
    const result = filterPlaces(places, 'food', null, 'oc')
    expect(result.map(p => p.id)).toEqual(['oc-1'])
  })

  it('excludes untagged places when a filter is active', () => {
    const result = filterPlaces(places, 'food', null, 'che')
    expect(result.every(p => p.id !== 'untagged-1')).toBe(true)
  })

  it('returns untagged places when filter is all', () => {
    const result = filterPlaces(places, 'food', null)
    expect(result.some(p => p.id === 'untagged-1')).toBe(true)
  })
})

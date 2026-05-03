import { describe, it, expect } from 'vitest'
import { filterExperiences } from './experienceUtils'
import type { Experience, ExperienceCategory } from '../types'

function makeExp(id: string, category: ExperienceCategory): Experience {
  return {
    id,
    title: '',
    category,
    hostName: '',
    shortDesc: '',
    highlights: [],
    priceEstimate: '',
    duration: '',
    address: '',
    contactInfo: { phone: '' },
    coverImage: '',
  }
}

const MOCK = [
  makeExp('1', 'living_history'),
  makeExp('2', 'workshop'),
  makeExp('3', 'eco_local'),
]

describe('filterExperiences', () => {
  it('returns all experiences when category is "all"', () => {
    expect(filterExperiences(MOCK, 'all')).toHaveLength(3)
  })

  it('returns only workshop experiences when category is "workshop"', () => {
    const result = filterExperiences(MOCK, 'workshop')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('returns empty array when no experiences match the category', () => {
    expect(filterExperiences([], 'eco_local')).toHaveLength(0)
  })
})

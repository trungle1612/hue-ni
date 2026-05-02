import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { FestivalEvent } from '../types'
import {
  getEventBadge,
  sortEventsByDate,
  filterEventsByCategory,
  partitionEventsByTime,
  getEventsForDate,
} from './festivalUtils'

const makeEvent = (overrides: Partial<FestivalEvent> = {}): FestivalEvent => ({
  id: 'e1',
  title: 'Test Event',
  category: 'royal',
  isAnnual: false,
  summary: '',
  highlights: [],
  timeString: '01/01/2026',
  location: 'Huế',
  organizer: 'Test',
  date: { start: '2026-06-01T08:00:00', end: '2026-06-01T18:00:00' },
  thumbnail: '',
  ...overrides,
})

const NOW = new Date('2026-05-02T12:00:00')
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(NOW) })
afterEach(() => { vi.useRealTimers() })

describe('getEventBadge', () => {
  it('returns happening_now when now is between start and end', () => {
    const e = makeEvent({ date: { start: '2026-05-02T08:00:00', end: '2026-05-02T20:00:00' } })
    expect(getEventBadge(e)).toBe('happening_now')
  })

  it('returns days_left when event is in the future', () => {
    const e = makeEvent({ date: { start: '2026-05-10T08:00:00', end: '2026-05-10T18:00:00' } })
    expect(getEventBadge(e)).toEqual({ type: 'days_left', days: 8 })
  })

  it('returns past when event end is before now', () => {
    const e = makeEvent({ date: { start: '2026-04-01T08:00:00', end: '2026-04-01T18:00:00' } })
    expect(getEventBadge(e)).toBe('past')
  })

  it('treats no end date as end of start day', () => {
    const e = makeEvent({ date: { start: '2026-05-02T06:00:00' } })
    expect(getEventBadge(e)).toBe('happening_now')
  })
})

describe('sortEventsByDate', () => {
  it('sorts chronologically by start date', () => {
    const events = [
      makeEvent({ id: 'e3', date: { start: '2026-06-01T08:00:00' } }),
      makeEvent({ id: 'e1', date: { start: '2026-05-10T08:00:00' } }),
      makeEvent({ id: 'e2', date: { start: '2026-05-15T08:00:00' } }),
    ]
    expect(sortEventsByDate(events).map(e => e.id)).toEqual(['e1', 'e2', 'e3'])
  })
})

describe('filterEventsByCategory', () => {
  it('returns all when category is all', () => {
    const events = [makeEvent({ category: 'royal' }), makeEvent({ category: 'art_music' })]
    expect(filterEventsByCategory(events, 'all')).toHaveLength(2)
  })

  it('filters to matching category', () => {
    const events = [makeEvent({ id: 'e1', category: 'royal' }), makeEvent({ id: 'e2', category: 'art_music' })]
    expect(filterEventsByCategory(events, 'art_music')).toEqual([events[1]])
  })
})

describe('partitionEventsByTime', () => {
  it('separates upcoming from past', () => {
    const events = [
      makeEvent({ id: 'future', date: { start: '2026-06-01T08:00:00', end: '2026-06-01T18:00:00' } }),
      makeEvent({ id: 'now', date: { start: '2026-05-02T08:00:00', end: '2026-05-02T20:00:00' } }),
      makeEvent({ id: 'past', date: { start: '2026-04-01T08:00:00', end: '2026-04-01T18:00:00' } }),
    ]
    const { upcoming, past } = partitionEventsByTime(events)
    expect(upcoming.map(e => e.id)).toContain('future')
    expect(upcoming.map(e => e.id)).toContain('now')
    expect(past.map(e => e.id)).toEqual(['past'])
  })
})

describe('getEventsForDate', () => {
  it('returns events that span a given date', () => {
    const events = [
      makeEvent({ id: 'match', date: { start: '2026-05-10T08:00:00', end: '2026-05-12T18:00:00' } }),
      makeEvent({ id: 'no-match', date: { start: '2026-06-01T08:00:00', end: '2026-06-01T18:00:00' } }),
    ]
    expect(getEventsForDate(events, new Date('2026-05-11')).map(e => e.id)).toEqual(['match'])
  })
})

import { parseISO, isAfter, differenceInCalendarDays, endOfDay, startOfDay } from 'date-fns'
import type { FestivalEvent, EventCategory } from '../types'

export type EventBadge =
  | 'happening_now'
  | 'past'
  | { type: 'days_left'; days: number }

export function getEventBadge(event: FestivalEvent): EventBadge {
  const now = new Date()
  const start = parseISO(event.date.start)
  const end = event.date.end ? parseISO(event.date.end) : endOfDay(start)
  if (isAfter(now, end)) return 'past'
  if (!isAfter(start, now)) return 'happening_now'
  return { type: 'days_left', days: differenceInCalendarDays(start, now) }
}

export function sortEventsByDate(events: FestivalEvent[]): FestivalEvent[] {
  return [...events].sort((a, b) =>
    parseISO(a.date.start).getTime() - parseISO(b.date.start).getTime()
  )
}

export function filterEventsByCategory(
  events: FestivalEvent[],
  category: EventCategory | 'all'
): FestivalEvent[] {
  if (category === 'all') return events
  return events.filter(e => e.category === category)
}

export function partitionEventsByTime(events: FestivalEvent[]): {
  upcoming: FestivalEvent[]
  past: FestivalEvent[]
} {
  const now = new Date()
  const upcoming: FestivalEvent[] = []
  const past: FestivalEvent[] = []
  for (const event of events) {
    const end = event.date.end ? parseISO(event.date.end) : endOfDay(parseISO(event.date.start))
    ;(isAfter(end, now) ? upcoming : past).push(event)
  }
  return { upcoming, past }
}

export function getEventsForDate(events: FestivalEvent[], date: Date): FestivalEvent[] {
  const day = startOfDay(date)
  return events.filter(event => {
    const start = startOfDay(parseISO(event.date.start))
    const end = event.date.end ? startOfDay(parseISO(event.date.end)) : start
    return !isAfter(start, day) && !isAfter(day, end)
  })
}

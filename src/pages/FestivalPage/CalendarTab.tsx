import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { parseISO, startOfDay, isAfter } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { FestivalEvent } from '../../types'
import { getEventsForDate, getEventBadge } from '../../utils/festivalUtils'
import { EventCard } from './EventCard'
import 'react-day-picker/dist/style.css'
import './CalendarTab.css'

function getEventDates(events: FestivalEvent[]): Date[] {
  const dates: Date[] = []
  for (const event of events) {
    const start = startOfDay(parseISO(event.date.start))
    const end = event.date.end ? startOfDay(parseISO(event.date.end)) : start
    const cur = new Date(start)
    while (!isAfter(cur, end)) {
      dates.push(new Date(cur))
      cur.setDate(cur.getDate() + 1)
    }
  }
  return dates
}

export function CalendarTab({ events }: { events: FestivalEvent[] }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const eventDates = getEventDates(events)
  const selectedEvents = selectedDate ? getEventsForDate(events, selectedDate) : []

  return (
    <div className="calendar-tab">
      <div className="calendar-tab__picker-wrap">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={vi}
          modifiers={{ hasEvent: eventDates }}
          modifiersClassNames={{ hasEvent: 'rdp-day--has-event' }}
        />
      </div>

      {selectedDate && (
        <div className="calendar-tab__detail" aria-live="polite">
          {selectedEvents.length === 0 ? (
            <p className="calendar-tab__no-events">Không có sự kiện vào ngày này.</p>
          ) : (
            <div className="calendar-tab__events-list">
              {selectedEvents.map(event => (
                <EventCard key={event.id} event={event} badge={getEventBadge(event)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

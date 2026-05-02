import { useState } from 'react'
import type { FestivalEvent, EventCategory } from '../../types'
import {
  filterEventsByCategory,
  partitionEventsByTime,
  getEventBadge,
} from '../../utils/festivalUtils'
import { EventCard } from './EventCard'
import './TimelineTab.css'

const FILTER_CHIPS: { value: EventCategory | 'all'; label: string }[] = [
  { value: 'all', label: '🎪 Tất cả' },
  { value: 'royal', label: '👑 Hoàng triều' },
  { value: 'culture', label: '🎎 Văn hóa' },
  { value: 'art_music', label: '🎶 Nghệ thuật' },
  { value: 'exhibition', label: '🖼️ Triển lãm' },
  { value: 'sport', label: '🏃 Thể thao' },
  { value: 'food', label: '🍜 Ẩm thực' },
]

export function TimelineTab({ events }: { events: FestivalEvent[] }) {
  const [category, setCategory] = useState<EventCategory | 'all'>('all')

  const filtered = filterEventsByCategory(events, category)
  const { upcoming, past } = partitionEventsByTime(filtered)

  return (
    <div className="timeline-tab">
      <div className="timeline-tab__filters" role="group" aria-label="Lọc theo loại sự kiện">
        {FILTER_CHIPS.map(chip => (
          <button
            key={chip.value}
            className={`timeline-tab__chip${category === chip.value ? ' timeline-tab__chip--active' : ''}`}
            onClick={() => setCategory(chip.value)}
            aria-pressed={category === chip.value}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="timeline-tab__list">
        {filtered.length === 0 ? (
          <p className="timeline-tab__empty">Không có sự kiện nào trong danh mục này.</p>
        ) : (
          <>
            {upcoming.map(event => (
              <EventCard key={event.id} event={event} badge={getEventBadge(event)} />
            ))}
            {past.length > 0 && (
              <>
                <h2 className="timeline-tab__section-heading">Đã diễn ra</h2>
                {past.map(event => (
                  <EventCard key={event.id} event={event} badge={getEventBadge(event)} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

import type { FestivalEvent } from '../../types'
import type { EventBadge } from '../../utils/festivalUtils'
import './EventCard.css'

const CATEGORY_ICONS: Record<string, string> = {
  royal: '👑', music: '🎶', sports: '🏃', cultural: '🎭',
}
const CATEGORY_LABELS: Record<string, string> = {
  royal: 'Hoàng triều', music: 'Âm nhạc', sports: 'Thể thao', cultural: 'Văn hóa',
}

interface EventCardProps {
  event: FestivalEvent
  badge: EventBadge
}

export function EventCard({ event, badge }: EventCardProps) {
  return (
    <article className="event-card">
      <div className="event-card__image-wrap">
        <img className="event-card__image" src={event.thumbnail} alt={event.title} loading="lazy" />
        <span className="event-card__category-badge">
          {CATEGORY_ICONS[event.category]} {CATEGORY_LABELS[event.category]}
        </span>
        {badge === 'happening_now' && (
          <span className="event-card__status event-card__status--live">🔴 Đang diễn ra</span>
        )}
        {badge !== 'happening_now' && badge !== 'past' && (
          <span className="event-card__status event-card__status--upcoming">
            ⏳ Còn {badge.days} ngày
          </span>
        )}
      </div>
      <div className="event-card__body">
        <h3 className="event-card__title">{event.title}</h3>
        <div className="event-card__meta">
          <span>📅 {event.timeString}</span>
          <span>📍 {event.location}</span>
        </div>
        <p className="event-card__summary">{event.summary}</p>
        {event.highlights.length > 0 && (
          <ul className="event-card__highlights">
            {event.highlights.map((h, i) => (
              <li key={i} className="event-card__highlight">{h}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

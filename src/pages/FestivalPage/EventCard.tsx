import type { FestivalEvent } from '../../types'
import type { EventBadge } from '../../utils/festivalUtils'
import royalImg from '../../assets/images/royal.jpg'
import cultureImg from '../../assets/images/dua-ghe-song-huong-hue.png'
import exhibitionImg from '../../assets/images/exhibition.png'
import artMusicImg from '../../assets/images/am-nhac-hue.jpg'
import sportImg from '../../assets/images/vnexpress-marathon-hue.jpg'
import foodImg from '../../assets/images/beo-nam-loc.jpg'
import './EventCard.css'

const CATEGORY_ICONS: Record<string, string> = {
  royal: '👑',
  culture: '🎎',
  exhibition: '🖼️',
  sport: '🏃',
  art_music: '🎶',
  food: '🍜',
}
const CATEGORY_LABELS: Record<string, string> = {
  royal: 'Hoàng triều',
  culture: 'Văn hóa',
  exhibition: 'Triển lãm',
  sport: 'Thể thao',
  art_music: 'Nghệ thuật',
  food: 'Ẩm thực',
}
const CATEGORY_DEFAULT_IMG: Record<string, string> = {
  royal: royalImg,
  culture: cultureImg,
  exhibition: exhibitionImg,
  sport: sportImg,
  art_music: artMusicImg,
  food: foodImg,
}

interface EventCardProps {
  event: FestivalEvent
  badge: EventBadge
}

export function EventCard({ event, badge }: EventCardProps) {
  const coverSrc = event.thumbnail || CATEGORY_DEFAULT_IMG[event.category]
  return (
    <article className="event-card">
      <div className="event-card__image-wrap">
        <img className="event-card__image" src={coverSrc} alt={event.title} loading="lazy" />
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

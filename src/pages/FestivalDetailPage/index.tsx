import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { FestivalEvent } from '../../types'
import { getEventBadge } from '../../utils/festivalUtils'
import royalImg from '../../assets/images/royal.jpg'
import cultureImg from '../../assets/images/dua-ghe-song-huong-hue.png'
import exhibitionImg from '../../assets/images/exhibition.png'
import artMusicImg from '../../assets/images/am-nhac-hue.jpg'
import sportImg from '../../assets/images/vnexpress-marathon-hue.jpg'
import foodImg from '../../assets/images/beo-nam-loc.jpg'
import './style.css'

const CATEGORY_DEFAULT_IMG: Record<string, string> = {
  royal: royalImg,
  culture: cultureImg,
  exhibition: exhibitionImg,
  sport: sportImg,
  art_music: artMusicImg,
  food: foodImg,
}

const CATEGORY_LABELS: Record<string, string> = {
  royal: 'Hoàng triều',
  culture: 'Văn hóa',
  exhibition: 'Triển lãm',
  sport: 'Thể thao',
  art_music: 'Nghệ thuật',
  food: 'Ẩm thực',
}

export function FestivalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<FestivalEvent | null | undefined>(undefined)

  useEffect(() => {
    if (!id) { setEvent(null); return }
    import('../../data/festivals.json').then(mod => {
      const found = (mod.default.events as FestivalEvent[]).find(e => e.id === id)
      setEvent(found ?? null)
    })
  }, [id])

  if (event === undefined) {
    return (
      <div className="festival-detail">
        <div className="festival-detail__loading" aria-label="Đang tải..." />
      </div>
    )
  }

  if (event === null) {
    return (
      <div className="festival-detail festival-detail--not-found">
        <p>Không tìm thấy sự kiện.</p>
        <button onClick={() => navigate('/festivals')}>← Quay lại</button>
      </div>
    )
  }

  const badge = getEventBadge(event)
  const coverSrc = event.thumbnail || CATEGORY_DEFAULT_IMG[event.category]

  return (
    <div className="festival-detail">
      <div className="festival-detail__hero">
        <img className="festival-detail__cover" src={coverSrc} alt={event.title} />
        <div className="festival-detail__hero-overlay" />

        <button
          className="festival-detail__back"
          onClick={() => navigate('/festivals')}
          aria-label="Quay lại"
        >
          ←
        </button>

        {badge === 'happening_now' && (
          <span className="festival-detail__badge festival-detail__badge--live">🔴 Đang diễn ra</span>
        )}
        {badge !== 'happening_now' && badge !== 'past' && (
          <span className="festival-detail__badge festival-detail__badge--upcoming">⏳ Còn {badge.days} ngày</span>
        )}
      </div>

      <div className="festival-detail__body">
        <span className="festival-detail__category">{CATEGORY_LABELS[event.category]}</span>
        <h1 className="festival-detail__title">{event.title}</h1>

        <div className="festival-detail__meta">
          <div className="festival-detail__meta-row">
            <span className="festival-detail__meta-icon">📅</span>
            <span>{event.timeString}</span>
          </div>
          <div className="festival-detail__meta-row">
            <span className="festival-detail__meta-icon">📍</span>
            <span>{event.location}</span>
          </div>
          <div className="festival-detail__meta-row">
            <span className="festival-detail__meta-icon">🏛️</span>
            <span>{event.organizer}</span>
          </div>
        </div>

        {event.summary && (
          <p className="festival-detail__summary">{event.summary}</p>
        )}

        {event.highlights.length > 0 && (
          <div className="festival-detail__highlights">
            <h2 className="festival-detail__section-title">Điểm nổi bật</h2>
            <ul className="festival-detail__highlight-list">
              {event.highlights.map((h, i) => (
                <li key={i} className="festival-detail__highlight">{h}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

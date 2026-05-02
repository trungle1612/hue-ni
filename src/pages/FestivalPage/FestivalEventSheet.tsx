import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FestivalEvent } from '../../types'
import { getEventBadge } from '../../utils/festivalUtils'
import royalImg from '../../assets/images/royal.jpg'
import cultureImg from '../../assets/images/dua-ghe-song-huong-hue.png'
import exhibitionImg from '../../assets/images/exhibition.png'
import artMusicImg from '../../assets/images/am-nhac-hue.jpg'
import sportImg from '../../assets/images/vnexpress-marathon-hue.jpg'
import foodImg from '../../assets/images/beo-nam-loc.jpg'
import './FestivalEventSheet.css'

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

interface FestivalEventSheetProps {
  event: FestivalEvent | null
  isOpen: boolean
  onClose: () => void
}

export function FestivalEventSheet({ event, isOpen, onClose }: FestivalEventSheetProps) {
  const navigate = useNavigate()
  const dragStartY = useRef<number | null>(null)

  if (!event) return null

  const badge = getEventBadge(event)
  const coverSrc = event.thumbnail || CATEGORY_DEFAULT_IMG[event.category]

  function handleDragStart(e: React.PointerEvent) {
    dragStartY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handleDragEnd(e: React.PointerEvent) {
    if (dragStartY.current === null) return
    const delta = e.clientY - dragStartY.current
    dragStartY.current = null
    if (delta >= 50) onClose()
  }

  return (
    <>
      <div
        className={`festival-event-sheet__backdrop${isOpen ? ' festival-event-sheet__backdrop--open' : ''}`}
        onClick={onClose}
      />
      <div className={`festival-event-sheet${isOpen ? ' festival-event-sheet--open' : ''}`}>
        <div
          className="festival-event-sheet__handle"
          onPointerDown={handleDragStart}
          onPointerUp={handleDragEnd}
          onPointerCancel={() => { dragStartY.current = null }}
        >
          <div className="festival-event-sheet__handle-bar" />
        </div>

        <div className="festival-event-sheet__cover-wrap">
          <img
            className="festival-event-sheet__cover"
            src={coverSrc}
            alt={event.title}
          />
          <div className="festival-event-sheet__cover-overlay" />
          <div className="festival-event-sheet__badges">
            <span className="festival-event-sheet__category-badge">
              {CATEGORY_LABELS[event.category]}
            </span>
            {badge === 'happening_now' && (
              <span className="festival-event-sheet__status festival-event-sheet__status--live">
                🔴 Đang diễn ra
              </span>
            )}
            {badge !== 'happening_now' && badge !== 'past' && (
              <span className="festival-event-sheet__status festival-event-sheet__status--upcoming">
                ⏳ Còn {badge.days} ngày
              </span>
            )}
          </div>
        </div>

        <div className="festival-event-sheet__body">
          <h2 className="festival-event-sheet__title">{event.title}</h2>

          <div className="festival-event-sheet__meta">
            <div className="festival-event-sheet__meta-row">
              <span className="festival-event-sheet__meta-icon">📅</span>
              <span>{event.timeString}</span>
            </div>
            <div className="festival-event-sheet__meta-row">
              <span className="festival-event-sheet__meta-icon">📍</span>
              <span>{event.location}</span>
            </div>
            <div className="festival-event-sheet__meta-row">
              <span className="festival-event-sheet__meta-icon">🏛️</span>
              <span>{event.organizer}</span>
            </div>
          </div>

          {event.summary && (
            <p className="festival-event-sheet__summary">{event.summary}</p>
          )}

          {event.highlights.length > 0 && (
            <>
              <h3 className="festival-event-sheet__section-title">Điểm nổi bật</h3>
              <ul className="festival-event-sheet__highlights">
                {event.highlights.map((h, i) => (
                  <li key={i} className="festival-event-sheet__highlight">{h}</li>
                ))}
              </ul>
            </>
          )}

          <button
            className="festival-event-sheet__deeplink"
            onClick={() => navigate(`/festivals/${event.id}`)}
          >
            Xem trang đầy đủ →
          </button>
        </div>
      </div>
    </>
  )
}

import { useNavigate } from 'react-router-dom'
import type { Place } from '../types'
import { CATEGORY_LABELS } from '../data/constants'
import { useMyTripContext } from '../contexts/MyTripContext'
import './PlaceCard.css'

interface PlaceCardProps {
  place: Place
  variant?: 'vertical' | 'horizontal'
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  const path = 'M5 3h14a1 1 0 011 1v17.28a.5.5 0 01-.8.4L12 17.22l-7.2 4.46A.5.5 0 014 21.28V4a1 1 0 011-1z'
  return filled ? (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

export function PlaceCard({ place, variant = 'vertical' }: PlaceCardProps) {
  const navigate = useNavigate()
  const { isSaved, addPlace, removePlace } = useMyTripContext()
  const saved = isSaved(place.id)

  function handleClick() {
    navigate(`/details/${place.id}`)
  }

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation()
    if (saved) removePlace(place.id)
    else addPlace(place.id)
  }

  return (
    <article
      className={`place-card${variant === 'horizontal' ? ' place-card--horizontal' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={place.name}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
    >
      <div className="place-card__image-wrap">
        <img src={place.coverImage} alt={place.name} loading="lazy" />
        <span className="place-card__category-badge">
          {CATEGORY_LABELS[place.category] ?? place.category}
        </span>
        <button
          className={`place-card__save-btn${saved ? ' place-card__save-btn--saved' : ''}`}
          onClick={handleSave}
          aria-label={saved ? 'Bỏ lưu' : 'Lưu địa điểm'}
          type="button"
        >
          <BookmarkIcon filled={saved} />
        </button>
      </div>

      <div className="place-card__body">
        <h3 className="place-card__name">{place.name}</h3>
        <p className="place-card__vibe">{place.vibe}</p>
        <div className="place-card__meta">
          <span className="place-card__rating">★ {place.rating}</span>
          <span className="place-card__price">{place.priceRange}</span>
        </div>
        <p className="place-card__address">
          <span aria-hidden="true">📍 </span>
          {place.address}
        </p>
      </div>
    </article>
  )
}

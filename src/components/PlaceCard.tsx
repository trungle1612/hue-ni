import { useNavigate } from 'react-router-dom'
import type { Place } from '../types'
import './PlaceCard.css'

const CATEGORY_LABELS: Record<string, string> = {
  tomb: 'Lăng tẩm',
  landmark: 'Di tích',
  cafe: 'Cà phê',
  food: 'Ẩm thực',
  homestay: 'Homestay',
  service: 'Dịch vụ',
}

interface PlaceCardProps {
  place: Place
  variant?: 'vertical' | 'horizontal'
}

export function PlaceCard({ place, variant = 'vertical' }: PlaceCardProps) {
  const navigate = useNavigate()

  function handleClick() {
    navigate(`/details/${place.id}`)
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
      </div>
      <div className="place-card__body">
        <h3 className="place-card__name">{place.name}</h3>
        <p className="place-card__vibe">{place.vibe}</p>
        <div className="place-card__meta">
          <span className="place-card__rating">★ {place.rating}</span>
          <span className="place-card__price">{place.priceRange}</span>
        </div>
        <p className="place-card__address">{place.address}</p>
      </div>
    </article>
  )
}

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ImageGallery } from '../../components/ImageGallery'
import { useMyTripContext } from '../../contexts/MyTripContext'
import placesData from '../../data/places.json'
import type { Place, Review } from '../../types'
import { CATEGORY_LABELS } from '../../data/constants'
import './style.css'

const ALL_PLACES = placesData.places as Place[]

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function renderStars(rating: number): string {
  return Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆')).join('')
}

type LightboxState = { images: string[]; index: number }

function ReviewCard({ review, onPhotoClick, index }: { review: Review; onPhotoClick: (state: LightboxState) => void; index: number }) {
  const photos = review.photos ?? []
  const visiblePhotos = photos.slice(0, 3)
  const overflow = photos.length - visiblePhotos.length

  return (
    <div className="details-page__review-card" style={{ '--review-i': index } as React.CSSProperties}>
      <div className="details-page__review-header">
        <div className="details-page__review-avatar">{getInitials(review.author)}</div>
        <div>
          <div className="details-page__review-author">{review.author}</div>
          {review.rating !== undefined && (
            <div className="details-page__review-stars">{renderStars(review.rating)}</div>
          )}
        </div>
      </div>
      <p className="details-page__review-text">{review.text}</p>
      {visiblePhotos.length > 0 && (
        <div className="details-page__review-photos">
          {visiblePhotos.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Anh danh gia ${i + 1}`}
              className="details-page__review-photo"
              loading="lazy"
              onClick={() => onPhotoClick({ images: photos, index: i })}
            />
          ))}
          {overflow > 0 && (
            <button
              className="details-page__review-photo-more"
              onClick={() => onPhotoClick({ images: photos, index: 3 })}
              aria-label={`Xem them ${overflow} anh`}
            >
              +{overflow}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function DetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isSaved, addPlace, removePlace } = useMyTripContext()
  const [lightbox, setLightbox] = useState<LightboxState | null>(null)

  const place = ALL_PLACES.find(p => p.id === id)

  if (!place) {
    return (
      <div className="details-page">
        <button className="details-page__back" onClick={() => navigate(-1)} aria-label="Quay lại">
          ←
        </button>
        <div className="details-page__not-found">
          <p>Không tìm thấy địa điểm này.</p>
        </div>
      </div>
    )
  }

  // TypeScript doesn't narrow across function closure boundaries; assert non-null
  // since the early return above guarantees place is defined at this point.
  const saved = isSaved(place!.id)

  function handleDirections() {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place!.coordinates.lat},${place!.coordinates.lng}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function handleSave() {
    if (saved) {
      removePlace(place!.id)
    } else {
      addPlace(place!.id)
    }
  }

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: place!.name,
          text: place!.vibe,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
      }
    } catch (err) {
      // User cancelled share or clipboard access denied — not an error worth surfacing
      if (err instanceof DOMException && err.name === 'AbortError') return
      console.warn('Share failed:', err)
    }
  }

  return (
    <div className="details-page">
      <button
        className="details-page__back"
        onClick={() => navigate(-1)}
        aria-label="Quay lại"
      >
        ←
      </button>

      {/* Cover image */}
      <div className="details-page__cover">
        <img src={place.coverImage} alt={place.name} />
      </div>

      {/* Main content */}
      <div className="details-page__content">
        <p className="details-page__category">
          {CATEGORY_LABELS[place.category] ?? place.category}
        </p>
        <h1 className="details-page__name">{place.name}</h1>
        <p className="details-page__vibe">{place.vibe}</p>

        {/* Info grid */}
        <div className="details-page__info">
          <div className="details-page__info-item">
            <span className="details-page__info-label">Đánh giá</span>
            <span className="details-page__info-value">★ {place.rating}</span>
          </div>
          <div className="details-page__info-item">
            <span className="details-page__info-label">Giá</span>
            <span className="details-page__info-value">{place.priceRange}</span>
          </div>
          <div className="details-page__info-item">
            <span className="details-page__info-label">Giờ mở cửa</span>
            <span className="details-page__info-value">
              {place.hours.open} – {place.hours.close}
            </span>
          </div>
          <div className="details-page__info-item">
            <span className="details-page__info-label">Địa chỉ</span>
            <span className="details-page__info-value" style={{ fontSize: '0.75rem' }}>
              {place.address}
            </span>
          </div>
          {place.phone && (
            <div className="details-page__info-item">
              <span className="details-page__info-label">Điện thoại</span>
              <a
                className="details-page__info-value"
                href={`tel:${place.phone}`}
                style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
              >
                {place.phone}
              </a>
            </div>
          )}
          {place.website && (
            <div className="details-page__info-item">
              <span className="details-page__info-label">Website</span>
              <a
                className="details-page__info-value"
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.75rem' }}
              >
                {place.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </div>
          )}
        </div>

        <p className="details-page__description">{place.description}</p>
      </div>

      {/* Gallery */}
      {place.gallery.length > 0 && (
        <>
          <h2 className="details-page__gallery-title">Hình ảnh</h2>
          <ImageGallery images={place.gallery} placeName={place.name} />
        </>
      )}

      {/* Insider tips */}
      {place.insiderTips.length > 0 && (
        <div className="details-page__tips">
          <h2 className="details-page__tips-title">💡 Mẹo nội bộ</h2>
          {place.insiderTips.map((tip, i) => (
            <div key={i} className="details-page__tip">
              {tip}
            </div>
          ))}
        </div>
      )}

      {/* Reviews */}
      {(place.reviews?.length ?? 0) > 0 && (
        <div className="details-page__reviews">
          <h2 className="details-page__reviews-title">🗣 Đánh giá từ khách</h2>
          {place.reviews!.map((review, i) => (
            <ReviewCard key={i} index={i} review={review} onPhotoClick={setLightbox} />
          ))}
        </div>
      )}

      {/* Photo lightbox */}
      {lightbox && (
        <div
          className="details-page__lightbox"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Anh phong to"
        >
          <button
            className="details-page__lightbox-close"
            onClick={() => setLightbox(null)}
            aria-label="Dong"
          >
            ×
          </button>
          <img
            src={lightbox.images[lightbox.index]}
            alt="Anh danh gia"
            className="details-page__lightbox-img"
            onClick={e => e.stopPropagation()}
          />
          {lightbox.images.length > 1 && (
            <>
              <button
                className="details-page__lightbox-nav details-page__lightbox-nav--prev"
                onClick={e => { e.stopPropagation(); setLightbox(lb => lb && lb.index > 0 ? { ...lb, index: lb.index - 1 } : lb) }}
                aria-label="Anh truoc"
                disabled={lightbox.index === 0}
              >
                ‹
              </button>
              <button
                className="details-page__lightbox-nav details-page__lightbox-nav--next"
                onClick={e => { e.stopPropagation(); setLightbox(lb => lb && lb.index < lb.images.length - 1 ? { ...lb, index: lb.index + 1 } : lb) }}
                aria-label="Anh sau"
                disabled={lightbox.index === lightbox.images.length - 1}
              >
                ›
              </button>
              <div className="details-page__lightbox-counter">
                {lightbox.index + 1} / {lightbox.images.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Sticky action bar */}
      <div className="details-page__actions">
        {/* Save — icon circle, clearly filled vs outlined */}
        <button
          className={`details-page__icon-btn${saved ? ' details-page__icon-btn--saved' : ''}`}
          onClick={handleSave}
          aria-label={saved ? 'Bỏ lưu' : 'Lưu địa điểm'}
        >
          {saved ? (
            /* Filled bookmark */
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M5 3h14a1 1 0 011 1v17.28a.5.5 0 01-.8.4L12 17.22l-7.2 4.46A.5.5 0 014 21.28V4a1 1 0 011-1z"/>
            </svg>
          ) : (
            /* Outline bookmark */
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 3h14a1 1 0 011 1v17.28a.5.5 0 01-.8.4L12 17.22l-7.2 4.46A.5.5 0 014 21.28V4a1 1 0 011-1z"/>
            </svg>
          )}
        </button>

        {/* Directions — primary wide CTA */}
        <button
          className="details-page__cta-btn"
          onClick={handleDirections}
          aria-label="Chỉ đường"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="3,11 22,2 13,21 11,13"/>
          </svg>
          Chỉ đường
        </button>

        {/* Share — icon circle */}
        <button
          className="details-page__icon-btn"
          onClick={handleShare}
          aria-label="Chia sẻ"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

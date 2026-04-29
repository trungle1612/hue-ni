import './ReviewCard.css'
import type { Review } from '../types'

export type LightboxState = { images: string[]; index: number }

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function renderStars(rating: number): string {
  return Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆')).join('')
}

export function ReviewCard({
  review,
  onPhotoClick,
  index,
}: {
  review: Review
  onPhotoClick: (state: LightboxState) => void
  index: number
}) {
  const photos = review.photos ?? []
  const visiblePhotos = photos.slice(0, 3)
  const overflow = photos.length - visiblePhotos.length

  return (
    <div className="review-card" style={{ '--review-i': index } as React.CSSProperties}>
      <div className="review-card__header">
        <div className="review-card__avatar">{getInitials(review.author)}</div>
        <div>
          <div className="review-card__author">{review.author}</div>
          {review.rating !== undefined && (
            <div className="review-card__stars">{renderStars(review.rating)}</div>
          )}
        </div>
      </div>
      <p className="review-card__text">{review.text}</p>
      {visiblePhotos.length > 0 && (
        <div className="review-card__photos">
          {visiblePhotos.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Ảnh đánh giá ${i + 1}`}
              className="review-card__photo"
              loading="lazy"
              onClick={() => onPhotoClick({ images: photos, index: i })}
            />
          ))}
          {overflow > 0 && (
            <button
              className="review-card__photo-more"
              onClick={() => onPhotoClick({ images: photos, index: 3 })}
              aria-label={`Xem thêm ${overflow} ảnh`}
            >
              +{overflow}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

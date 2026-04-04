import { useParams, useNavigate } from 'react-router-dom'
import { ImageGallery } from '../components/ImageGallery'
import { useMyTrip } from '../hooks/useMyTrip'
import placesData from '../data/places.json'
import type { Place } from '../types'
import './DetailsPage.css'

const CATEGORY_LABELS: Record<string, string> = {
  tomb: 'Lăng tẩm',
  landmark: 'Di tích',
  cafe: 'Cà phê',
  food: 'Ẩm thực',
  homestay: 'Homestay',
  service: 'Dịch vụ',
}

const ALL_PLACES = placesData.places as Place[]

export function DetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isSaved, addPlace, removePlace } = useMyTrip()

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

      {/* Sticky action bar */}
      <div className="details-page__actions">
        <button
          className="details-page__action-btn details-page__action-btn--primary"
          onClick={handleDirections}
          aria-label="Chỉ đường"
        >
          🧭 Đường đi
        </button>
        <button
          className="details-page__action-btn details-page__action-btn--secondary"
          onClick={handleSave}
          aria-label={saved ? 'Bỏ lưu' : 'Lưu địa điểm'}
        >
          {saved ? '📌 Đã lưu' : '📌 Lưu'}
        </button>
        <button
          className="details-page__action-btn details-page__action-btn--secondary"
          onClick={handleShare}
          aria-label="Chia sẻ"
        >
          🔗 Chia sẻ
        </button>
      </div>
    </div>
  )
}

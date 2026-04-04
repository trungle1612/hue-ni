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

  // place is defined here (early return guards the undefined case)
  const found: Place = place
  const saved = isSaved(found.id)

  function handleDirections() {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${found.coordinates.lat},${found.coordinates.lng}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function handleSave() {
    if (saved) {
      removePlace(found.id)
    } else {
      addPlace(found.id)
    }
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: found.name,
        text: found.vibe,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
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
        <img src={found.coverImage} alt={found.name} />
      </div>

      {/* Main content */}
      <div className="details-page__content">
        <p className="details-page__category">
          {CATEGORY_LABELS[found.category] ?? found.category}
        </p>
        <h1 className="details-page__name">{found.name}</h1>
        <p className="details-page__vibe">{found.vibe}</p>

        {/* Info grid */}
        <div className="details-page__info">
          <div className="details-page__info-item">
            <span className="details-page__info-label">Đánh giá</span>
            <span className="details-page__info-value">★ {found.rating}</span>
          </div>
          <div className="details-page__info-item">
            <span className="details-page__info-label">Giá</span>
            <span className="details-page__info-value">{found.priceRange}</span>
          </div>
          <div className="details-page__info-item">
            <span className="details-page__info-label">Giờ mở cửa</span>
            <span className="details-page__info-value">
              {found.hours.open} – {found.hours.close}
            </span>
          </div>
          <div className="details-page__info-item">
            <span className="details-page__info-label">Địa chỉ</span>
            <span className="details-page__info-value" style={{ fontSize: '0.75rem' }}>
              {found.address}
            </span>
          </div>
        </div>

        <p className="details-page__description">{found.description}</p>
      </div>

      {/* Gallery */}
      {found.gallery.length > 0 && (
        <>
          <h2 className="details-page__gallery-title">Hình ảnh</h2>
          <ImageGallery images={found.gallery} placeName={found.name} />
        </>
      )}

      {/* Insider tips */}
      {found.insiderTips.length > 0 && (
        <div className="details-page__tips">
          <h2 className="details-page__tips-title">💡 Mẹo nội bộ</h2>
          {found.insiderTips.map((tip, i) => (
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

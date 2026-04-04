import { useNavigate } from 'react-router-dom'
import { useMyTrip } from '../hooks/useMyTrip'
import placesData from '../data/places.json'
import type { Place } from '../types'
import './MyTripPage.css'

const ALL_PLACES = placesData.places as Place[]

export function MyTripPage() {
  const navigate = useNavigate()
  const { savedIds, removePlace, clearAll } = useMyTrip()

  const savedPlaces = savedIds
    .map(id => ALL_PLACES.find(p => p.id === id))
    .filter((p): p is Place => p !== undefined)

  function handleDirections(place: Place) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="my-trip-page">
      <h1 className="my-trip-page__title">Hành trình của tôi</h1>

      {savedPlaces.length === 0 ? (
        <div className="my-trip-page__empty">
          <span className="my-trip-page__empty-icon">🗺️</span>
          <p className="my-trip-page__empty-text">Chưa có địa điểm nào được lưu</p>
          <p className="my-trip-page__empty-hint">
            Khám phá Di sản và nhấn 📌 để lưu những nơi bạn muốn ghé thăm.
          </p>
          <button
            className="my-trip-page__explore-btn"
            onClick={() => navigate('/heritage')}
          >
            Khám phá ngay
          </button>
        </div>
      ) : (
        <>
          <div className="my-trip-page__list">
            {savedPlaces.map(place => (
              <div key={place.id} className="my-trip-page__item">
                <img
                  src={place.coverImage}
                  alt={place.name}
                  className="my-trip-page__item-image"
                />
                <div className="my-trip-page__item-info">
                  <p className="my-trip-page__item-name">{place.name}</p>
                  <p className="my-trip-page__item-address">{place.address}</p>
                </div>
                <div className="my-trip-page__item-actions">
                  <button
                    className="my-trip-page__item-btn my-trip-page__item-btn--directions"
                    onClick={() => handleDirections(place)}
                    aria-label={`Đường đi đến ${place.name}`}
                  >
                    🧭
                  </button>
                  <button
                    className="my-trip-page__item-btn my-trip-page__item-btn--remove"
                    onClick={() => removePlace(place.id)}
                    aria-label={`Xóa ${place.name} khỏi hành trình`}
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            className="my-trip-page__clear-btn"
            onClick={clearAll}
            aria-label="Xóa tất cả địa điểm đã lưu"
          >
            🗑️ Xóa tất cả
          </button>
        </>
      )}
    </div>
  )
}

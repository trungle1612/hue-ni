import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMyTripContext } from '../../contexts/MyTripContext'
import placesData from '../../data/places.json'
import type { Place } from '../../types'
import { CATEGORY_LABELS } from '../../data/constants'
import './style.css'

const ALL_PLACES = placesData.places as Place[]

function IconMapEmpty() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="my-trip-page__empty-svg">
      <rect x="8" y="16" width="48" height="36" rx="4" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M8 24l12-6 12 6 12-6 12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="24" cy="34" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M24 30v-6M20 34h-6M28 34h6M24 38v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M36 36l10 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

function IconDirections() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2l2.5 2.5L10 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.5 4.5H6a4 4 0 000 8h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M9 15l3 3 3-3M12 18v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconRemove() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function IconTrash() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5h14M8 5V3h4v2M6 5l1 12h6l1-12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 9v5M11 9v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

export function MyTripPage() {
  const navigate = useNavigate()
  const { savedIds, removePlace, clearAll } = useMyTripContext()
  const [confirmingId, setConfirmingId] = useState<string | 'all' | null>(null)
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const savedPlaces = savedIds
    .map(id => ALL_PLACES.find(p => p.id === id))
    .filter((p): p is Place => p !== undefined)

  function handleDirections(place: Place) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function requestConfirm(id: string | 'all') {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    setConfirmingId(id)
    confirmTimerRef.current = setTimeout(() => setConfirmingId(null), 3000)
  }

  function handleRemove(id: string) {
    if (confirmingId === id) {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
      setConfirmingId(null)
      removePlace(id)
    } else {
      requestConfirm(id)
    }
  }

  function handleClearAll() {
    if (confirmingId === 'all') {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
      setConfirmingId(null)
      clearAll()
    } else {
      requestConfirm('all')
    }
  }

  useEffect(() => () => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
  }, [])

  return (
    <div className="my-trip-page">
      <header className="my-trip-page__header">
        <p className="my-trip-page__overline">Của tôi</p>
        <h1 className="my-trip-page__title">Hành trình</h1>
        {savedPlaces.length > 0 && (
          <span className="my-trip-page__count">{savedPlaces.length} địa điểm</span>
        )}
      </header>

      {savedPlaces.length === 0 ? (
        <div className="my-trip-page__empty">
          <IconMapEmpty />
          <p className="my-trip-page__empty-text">Chưa có địa điểm nào</p>
          <p className="my-trip-page__empty-hint">
            Khám phá di sản và nhấn lưu để thêm vào hành trình của bạn.
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
                <div className="my-trip-page__item-body">
                  <div className="my-trip-page__item-info">
                    <span className="my-trip-page__item-category">
                      {CATEGORY_LABELS[place.category] ?? place.category}
                    </span>
                    <p className="my-trip-page__item-name">{place.name}</p>
                    <p className="my-trip-page__item-address">{place.address}</p>
                  </div>
                  <div className="my-trip-page__item-actions">
                    <button
                      className="my-trip-page__action-btn my-trip-page__action-btn--directions"
                      onClick={() => handleDirections(place)}
                      aria-label={`Đường đi đến ${place.name}`}
                    >
                      <IconDirections />
                      <span>Chỉ đường</span>
                    </button>
                    <button
                      className={`my-trip-page__action-btn my-trip-page__action-btn--remove${confirmingId === place.id ? ' my-trip-page__action-btn--confirm' : ''}`}
                      onClick={() => handleRemove(place.id)}
                      aria-label={confirmingId === place.id ? 'Xác nhận xóa' : `Xóa ${place.name}`}
                    >
                      {confirmingId === place.id ? (
                        <span className="my-trip-page__confirm-text">Xóa?</span>
                      ) : (
                        <IconRemove />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className={`my-trip-page__clear-btn${confirmingId === 'all' ? ' my-trip-page__clear-btn--confirm' : ''}`}
            onClick={handleClearAll}
            aria-label={confirmingId === 'all' ? 'Xác nhận xóa tất cả' : 'Xóa tất cả'}
          >
            <IconTrash />
            <span>{confirmingId === 'all' ? 'Xác nhận xóa tất cả?' : 'Xóa tất cả'}</span>
          </button>
        </>
      )}
    </div>
  )
}

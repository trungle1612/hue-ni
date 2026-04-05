import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingModal } from '../components/OnboardingModal'
import { MapView } from '../components/MapView'
import { hasSeenOnboarding } from '../utils/onboarding'
import placesData from '../data/places.json'
import type { Place } from '../types'
import { CATEGORY_LABELS } from '../data/constants'
import './HomePage.css'

const ALL_PLACES = placesData.places as Place[]

const MAP_FILTER_OPTIONS = [
  { value: 'all',      icon: '🗺️', label: 'Tất cả' },
  { value: 'cafe',     icon: '☕',  label: 'Cà phê' },
  { value: 'homestay', icon: '🏡', label: 'Homestay' },
  { value: 'food',      icon: '🍜',  label: 'Ẩm thực' },
  { value: 'tomb',      icon: '⛩️',  label: 'Lăng tẩm' },
]

export function HomePage() {
  const navigate = useNavigate()
  const [showOnboarding, setShowOnboarding] = useState(() => !hasSeenOnboarding())
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)

  const visiblePlaces =
    selectedCategory === 'all'
      ? ALL_PLACES
      : ALL_PLACES.filter(p => p.category === selectedCategory)

  function handleSelectPlace(place: Place | null) {
    setSelectedPlace(place)
  }

  function handleExplore() {
    if (!selectedPlace) return
    navigate(`/details/${selectedPlace.id}`)
  }

  return (
    <>
      {showOnboarding && (
        <OnboardingModal onDismiss={() => setShowOnboarding(false)} />
      )}

      <div className="home-map-page">
        {/* ── Header ── */}
        <header className="home-map-header">
          <img
            src="/images/hue-ni-logo.png"
            alt="Huế nì"
            className="home-map-header__logo"
          />
          <div className="home-map-header__brand">
            <p className="home-map-header__overline">Khám phá cố đô</p>
            <span className="home-map-header__title">Huế nì</span>
          </div>
        </header>

        {/* ── Map area ── */}
        <div className="home-map-area">
          {/* Category filter — floats over map */}
          <div className="home-map-filters" role="group" aria-label="Lọc địa điểm">
            {MAP_FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`home-map-chip${selectedCategory === opt.value ? ' home-map-chip--active' : ''}`}
                onClick={() => {
                  setSelectedCategory(opt.value)
                  setSelectedPlace(null)
                }}
                aria-pressed={selectedCategory === opt.value}
              >
                <span className="home-map-chip__icon">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Leaflet map */}
          <MapView
            places={visiblePlaces}
            selectedPlace={selectedPlace}
            onSelectPlace={handleSelectPlace}
          />

          {/* ── Bottom place sheet ── */}
          {selectedPlace && (
            <div className="home-map-sheet" role="dialog" aria-label={selectedPlace.name}>
              <div className="home-map-sheet__drag-handle" />

              <div className="home-map-sheet__body">
                {/* Thumbnail */}
                <div className="home-map-sheet__thumb-wrap">
                  <img
                    className="home-map-sheet__thumb"
                    src={selectedPlace.coverImage}
                    alt={selectedPlace.name}
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="home-map-sheet__info">
                  <span className="home-map-sheet__category">
                    {CATEGORY_LABELS[selectedPlace.category] ?? selectedPlace.category}
                  </span>

                  <h2 className="home-map-sheet__name">{selectedPlace.name}</h2>

                  <div className="home-map-sheet__meta">
                    <span className="home-map-sheet__rating">★ {selectedPlace.rating}</span>
                  </div>

                  <p className="home-map-sheet__address">
                    <span className="home-map-sheet__address-icon">📍</span>
                    {selectedPlace.address}
                  </p>

                  <div className="home-map-sheet__actions">
                    <button
                      className="home-map-sheet__cta"
                      onClick={handleExplore}
                      aria-label={`Khám phá ${selectedPlace.name}`}
                    >
                      Khám phá chi tiết
                    </button>
                    <button
                      className="home-map-sheet__share"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: selectedPlace.name, text: selectedPlace.vibe })
                            .catch(() => {/* user cancelled */})
                        }
                      }}
                      aria-label="Chia sẻ"
                    >
                      ↗
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

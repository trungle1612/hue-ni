import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingModal } from '../../components/OnboardingModal'
import { MapView } from '../../components/MapView'
import { hasSeenOnboarding } from '../../utils/onboarding'
import { useMyTripContext } from '../../contexts/MyTripContext'
import placesData from '../../data/places.json'
import type { Place, Category } from '../../types'
import { CATEGORY_LABELS, CAFE_SUB_FILTERS } from '../../data/constants'
import { filterPlaces } from '../../utils/filterPlaces'
import './style.css'

const ALL_PLACES = placesData.places as Place[]

const MAP_FILTER_OPTIONS: Array<{ value: Category; icon: string; label: string }> = [
  { value: 'cafe',     icon: '☕',  label: 'Cà phê' },
  { value: 'homestay', icon: '🏡', label: 'Homestay' },
  { value: 'food',      icon: '🍜',  label: 'Ẩm thực' },
  { value: 'tomb',      icon: '⛩️',  label: 'Lăng tẩm' },
]

const BOOKMARK_PATH = 'M5 3h14a1 1 0 011 1v17.28a.5.5 0 01-.8.4L12 17.22l-7.2 4.46A.5.5 0 014 21.28V4a1 1 0 011-1z'

export function HomePage() {
  const navigate = useNavigate()
  const { isSaved, addPlace, removePlace, savedIds } = useMyTripContext()
  const [showOnboarding, setShowOnboarding] = useState(() => !hasSeenOnboarding())
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('cafe')
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [sheetClosing, setSheetClosing] = useState(false)
  const [activeSubFilter, setActiveSubFilter] = useState<string | null>(null)
  const [showSavedToast, setShowSavedToast] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const visiblePlaces = filterPlaces(ALL_PLACES, selectedCategory, activeSubFilter)

  function dismissSheet() {
    if (!selectedPlace) return
    setSheetClosing(true)
    closeTimerRef.current = setTimeout(() => {
      setSelectedPlace(null)
      setSheetClosing(false)
    }, 240)
  }

  function handleSelectPlace(place: Place | null) {
    if (place === null) {
      dismissSheet()
    } else {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      setSheetClosing(false)
      setSelectedPlace(place)
    }
  }

  function handleSaveToggle(place: Place) {
    if (isSaved(place.id)) {
      removePlace(place.id)
    } else {
      addPlace(place.id)
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      setShowSavedToast(true)
      toastTimerRef.current = setTimeout(() => setShowSavedToast(false), 2200)
    }
  }

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
  }, [])

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
            <span className="home-map-header__title">Huế nì</span>
            <p className="home-map-header__overline">Khám phá cố đô</p>
          </div>
        </header>

        {/* ── Map area ── */}
        <div className="home-map-area">
          {/* Category filter — floats over map */}
          <div className="home-map-filters" role="group" aria-label="Lọc địa điểm">
            {/* Primary row */}
            <div className="home-map-filters__row">
              {MAP_FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`home-map-chip${selectedCategory === opt.value ? ' home-map-chip--active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(opt.value)
                    setActiveSubFilter(null)
                    dismissSheet()
                  }}
                  aria-pressed={selectedCategory === opt.value}
                >
                  <span className="home-map-chip__icon">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Secondary row — only visible when café is selected */}
            {selectedCategory === 'cafe' && (
              <div className="home-map-filters__row home-map-subfilter-row">
                {CAFE_SUB_FILTERS.map(opt => (
                  <button
                    key={String(opt.value)}
                    className={`home-map-chip home-map-chip--sub${activeSubFilter === opt.value ? ' home-map-chip--sub-active' : ''}`}
                    onClick={() => setActiveSubFilter(opt.value)}
                    aria-pressed={activeSubFilter === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Saved toast */}
          {showSavedToast && (
            <div className="home-map-toast" role="status" aria-live="polite">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="home-map-toast__icon">
                <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15"/>
                <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Đã lưu vào hành trình
            </div>
          )}

          {/* Leaflet map */}
          <MapView
            places={visiblePlaces}
            selectedPlace={selectedPlace}
            onSelectPlace={handleSelectPlace}
            sheetOpen={selectedPlace !== null && !sheetClosing}
            savedIds={savedIds}
          />

          {/* ── Bottom place sheet ── */}
          {selectedPlace && (
            <div className={`home-map-sheet${sheetClosing ? ' home-map-sheet--closing' : ''}`} role="dialog" aria-label={selectedPlace.name}>
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
                      className={`home-map-sheet__save${isSaved(selectedPlace.id) ? ' home-map-sheet__save--saved' : ''}`}
                      onClick={() => handleSaveToggle(selectedPlace)}
                      aria-label={isSaved(selectedPlace.id) ? 'Bỏ lưu' : 'Lưu địa điểm'}
                      type="button"
                    >
                      {isSaved(selectedPlace.id) ? (
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d={BOOKMARK_PATH} />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d={BOOKMARK_PATH} />
                        </svg>
                      )}
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

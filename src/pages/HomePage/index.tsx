import { useState, useRef, useEffect } from 'react'
import { OnboardingModal } from '../../components/OnboardingModal'
import { MapView } from '../../components/MapView'
import { hasSeenOnboarding } from '../../utils/onboarding'
import { useMyTripContext } from '../../contexts/MyTripContext'
import { loadCategory } from '../../utils/loadCategory'
import type { Place, Category } from '../../types'
import { CAFE_SUB_FILTERS, FOOD_GROUP_OPTIONS, FOOD_DISH_MAP } from '../../data/constants'
import { FilterCombobox } from '../../components/FilterCombobox'
import { filterPlaces } from '../../utils/filterPlaces'
import { PlaceDetailSheet, type SnapState } from '../../components/PlaceDetailSheet'
import './style.css'

const MAP_FILTER_OPTIONS: Array<{ value: Category; icon: string; label: string }> = [
  { value: 'cafe',     icon: '☕',  label: 'Cà phê' },
  { value: 'homestay', icon: '🏡', label: 'Homestay' },
  { value: 'food',      icon: '🍜',  label: 'Ẩm thực' },
  { value: 'tomb',      icon: '⛩️',  label: 'Lăng tẩm' },
]

export function HomePage() {
  const { savedIds } = useMyTripContext()
  const [showOnboarding, setShowOnboarding] = useState(() => !hasSeenOnboarding())
  const [selectedCategory, setSelectedCategory] = useState<Category>('cafe')
  const [categoryPlaces, setCategoryPlaces] = useState<Place[]>([])
  const [isLoadingCategory, setIsLoadingCategory] = useState(true)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [snapState, setSnapState] = useState<SnapState>('closed')
  const [activeSubFilter, setActiveSubFilter] = useState<string | null>(null)
  const [foodGroup, setFoodGroup] = useState<string>('all')
  const [foodDish,  setFoodDish]  = useState<string | null>(null)
  const [showSavedToast, setShowSavedToast] = useState(false)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const visiblePlaces = filterPlaces(categoryPlaces, selectedCategory, activeSubFilter, foodGroup, foodDish)

  useEffect(() => {
    let cancelled = false
    setIsLoadingCategory(true)
    loadCategory(selectedCategory).then(places => {
      if (!cancelled) {
        setCategoryPlaces(places)
        setIsLoadingCategory(false)
      }
    })
    return () => { cancelled = true }
  }, [selectedCategory])

  function handleSelectPlace(place: Place | null) {
    if (place === null) {
      setSnapState('closed')
      setSelectedPlace(null)
    } else {
      setSelectedPlace(place)
      setSnapState('peek')
    }
  }

  function handleSheetSave() {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setShowSavedToast(true)
    toastTimerRef.current = setTimeout(() => setShowSavedToast(false), 2200)
  }

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
  }, [])

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
                    setFoodGroup('all')
                    setFoodDish(null)
                    handleSelectPlace(null)
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

            {selectedCategory === 'food' && (
              <div className="home-map-filters__combobox-row home-map-subfilter-row">
                <FilterCombobox
                  options={FOOD_GROUP_OPTIONS}
                  value={foodGroup}
                  onChange={v => { setFoodGroup(v); setFoodDish(null) }}
                />
              </div>
            )}

            {selectedCategory === 'food' && foodGroup !== 'all' && FOOD_DISH_MAP[foodGroup] && (
              <div className="home-map-filters__row home-map-subfilter-row">
                <button
                  className={`home-map-chip home-map-chip--sub${foodDish === null ? ' home-map-chip--sub-active' : ''}`}
                  onClick={() => setFoodDish(null)}
                  aria-pressed={foodDish === null}
                >
                  Tất cả
                </button>
                {FOOD_DISH_MAP[foodGroup].map(dish => (
                  <button
                    key={dish.value}
                    className={`home-map-chip home-map-chip--sub${foodDish === dish.value ? ' home-map-chip--sub-active' : ''}`}
                    onClick={() => setFoodDish(dish.value)}
                    aria-pressed={foodDish === dish.value}
                  >
                    {dish.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category loading indicator */}
          {isLoadingCategory && (
            <div className="home-map-loading" aria-live="polite" aria-label="Đang tải..." />
          )}

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
            sheetOpen={snapState !== 'closed'}
            savedIds={savedIds}
          />

          <PlaceDetailSheet
            place={selectedPlace}
            snapState={snapState}
            onSnap={setSnapState}
            onClose={() => { setSnapState('closed'); setTimeout(() => setSelectedPlace(null), 300) }}
            onSave={handleSheetSave}
          />
        </div>
      </div>
    </>
  )
}

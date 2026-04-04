import { useState } from 'react'
import { CategoryFilter, type FilterOption } from '../components/CategoryFilter'
import { PlaceCard } from '../components/PlaceCard'
import placesData from '../data/places.json'
import type { Place, Collection } from '../types'
import './HomePage.css'

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'tomb', label: 'Lăng tẩm' },
  { value: 'landmark', label: 'Di tích' },
  { value: 'cafe', label: 'Cà phê' },
  { value: 'food', label: 'Ẩm thực' },
  { value: 'homestay', label: 'Homestay' },
  { value: 'service', label: 'Dịch vụ' },
]

const ALL_PLACES = placesData.places as Place[]
const ALL_COLLECTIONS = placesData.collections as Collection[]

// Pre-computed at module level (static data — no need to recompute on render)
const COLLECTION_PLACES = new Map(
  ALL_COLLECTIONS.map(c => [
    c.id,
    ALL_PLACES.filter(p => p.collection === c.id),
  ])
)

function normalize(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

export function HomePage() {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const searchResults = query.trim().length > 0
    ? ALL_PLACES.filter(p =>
        normalize(p.name).includes(normalize(query)) ||
        p.tags.some(t => normalize(t).includes(normalize(query)))
      )
    : null

  // MVP placeholder: no geolocation yet; show first 5 entries
  const nearMePlaces = ALL_PLACES.slice(0, 5)

  return (
    <div className="home-page">
      <header className="home-page__header">
        <span className="home-page__app-name">The Imperial Chronicler</span>
      </header>

      {/* Search */}
      <div className="home-page__search-wrap">
        <input
          className="home-page__search"
          type="search"
          placeholder="Tìm địa điểm, ẩm thực..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Tìm kiếm địa điểm"
        />
      </div>

      {/* Search results */}
      {searchResults !== null && (
        <div className="home-page__section">
          <div className="home-page__section-header">
            <h2 className="home-page__section-title">Kết quả tìm kiếm</h2>
            <span className="home-page__section-subtitle">{searchResults.length} nơi</span>
          </div>
          {searchResults.length === 0 ? (
            <p className="home-page__empty">Không tìm thấy địa điểm phù hợp.</p>
          ) : (
            <div className="home-page__scroll-row">
              {searchResults.map(place => (
                <PlaceCard key={place.id} place={place} variant="horizontal" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category filter + Near Me (shown when not searching) */}
      {searchResults === null && (
        <>
          <div className="home-page__section">
            <CategoryFilter
              options={FILTER_OPTIONS}
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>

          <div className="home-page__section">
            <div className="home-page__section-header">
              <h2 className="home-page__section-title">Gần đây</h2>
              <span className="home-page__section-subtitle">Những nơi đáng ghé</span>
            </div>
            <div className="home-page__scroll-row">
              {(selectedCategory === 'all'
                ? nearMePlaces
                : ALL_PLACES.filter(p => p.category === selectedCategory).slice(0, 5)
              ).map(place => (
                <PlaceCard key={place.id} place={place} variant="horizontal" />
              ))}
            </div>
          </div>

          {/* Curated Collections */}
          {ALL_COLLECTIONS.map(collection => {
            const places = COLLECTION_PLACES.get(collection.id) ?? []
            if (places.length === 0) return null
            return (
              <div key={collection.id} className="home-page__collection">
                <div className="home-page__collection-banner">
                  <h2 className="home-page__collection-title">{collection.title}</h2>
                  <p className="home-page__collection-desc">{collection.description}</p>
                </div>
                <div className="home-page__scroll-row">
                  {places.map(place => (
                    <PlaceCard key={place.id} place={place} variant="horizontal" />
                  ))}
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

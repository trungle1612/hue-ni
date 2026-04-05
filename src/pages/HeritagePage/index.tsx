import { useState } from 'react'
import { CategoryFilter } from '../../components/CategoryFilter'
import { PlaceCard } from '../../components/PlaceCard'
import placesData from '../../data/places.json'
import type { Place } from '../../types'
import { FILTER_OPTIONS } from '../../data/constants'
import './style.css'

const ALL_PLACES = placesData.places as Place[]

export function HeritagePage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filtered = selectedCategory === 'all'
    ? ALL_PLACES
    : ALL_PLACES.filter(p => p.category === selectedCategory)

  return (
    <div className="heritage-page">
      <header className="heritage-page__header">
        <p className="heritage-page__overline">Di sản Huế</p>
        <h1 className="heritage-page__title">Vọng âm triều đại</h1>
        <p className="heritage-page__subtitle">
          {selectedCategory === 'all'
            ? `${filtered.length} địa điểm`
            : `${filtered.length} trong ${ALL_PLACES.length} địa điểm`}
        </p>
      </header>

      <CategoryFilter
        options={FILTER_OPTIONS}
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />

      <div className="heritage-page__list">
        {filtered.length === 0 ? (
          <div className="heritage-page__empty">
            <p className="heritage-page__empty-text">
              Không tìm thấy địa điểm nào trong danh mục này.
            </p>
            <button
              className="heritage-page__empty-reset"
              onClick={() => setSelectedCategory('all')}
            >
              Xem tất cả
            </button>
          </div>
        ) : (
          filtered.map(place => (
            <PlaceCard key={place.id} place={place} variant="vertical" />
          ))
        )}
      </div>
    </div>
  )
}

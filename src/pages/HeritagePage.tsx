import { useState } from 'react'
import { CategoryFilter } from '../components/CategoryFilter'
import { PlaceCard } from '../components/PlaceCard'
import placesData from '../data/places.json'
import type { Place } from '../types'
import { FILTER_OPTIONS } from '../data/constants'
import './HeritagePage.css'

const ALL_PLACES = placesData.places as Place[]

export function HeritagePage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filtered = selectedCategory === 'all'
    ? ALL_PLACES
    : ALL_PLACES.filter(p => p.category === selectedCategory)

  return (
    <div className="heritage-page">
      <header className="heritage-page__header">
        <h1 className="heritage-page__title">Vọng âm triều đại</h1>
        <p className="heritage-page__subtitle">
          {filtered.length} địa điểm
        </p>
      </header>

      <CategoryFilter
        options={FILTER_OPTIONS}
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />

      <div className="heritage-page__list">
        {filtered.map(place => (
          <PlaceCard key={place.id} place={place} variant="vertical" />
        ))}
      </div>
    </div>
  )
}

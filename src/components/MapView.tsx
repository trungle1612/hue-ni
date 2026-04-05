import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Place } from '../types'
import './MapView.css'

const CATEGORY_ICONS: Record<string, string> = {
  tomb: '⛩️',
  landmark: '🏛️',
  cafe: '☕',
  food: '🍜',
  homestay: '🏡',
  service: '🛎️',
}

function createPinIcon(place: Place, selected: boolean): L.DivIcon {
  const emoji = CATEGORY_ICONS[place.category] ?? '📍'
  if (selected) {
    return L.divIcon({
      html: `<div class="map-pin map-pin--selected">
        <div class="map-pin__bubble">${emoji}</div>
        <div class="map-pin__label">${place.name}</div>
      </div>`,
      className: '',
      iconSize: [120, 72],
      iconAnchor: [60, 44],
    })
  }
  return L.divIcon({
    html: `<div class="map-pin">
      <div class="map-pin__bubble">${emoji}</div>
    </div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

interface MapViewProps {
  places: Place[]
  selectedPlace: Place | null
  onSelectPlace: (place: Place | null) => void
}

export function MapView({ places, selectedPlace, onSelectPlace }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const onSelectRef = useRef(onSelectPlace)

  // Keep callback ref current without re-running effects
  useEffect(() => {
    onSelectRef.current = onSelectPlace
  })

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const hueBounds = L.latLngBounds([16.35, 107.50], [16.55, 107.70])

    const map = L.map(containerRef.current, {
      center: [16.46, 107.585],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      maxBounds: hueBounds,
      maxBoundsViscosity: 0.85,
      minZoom: 12,
    })

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      { maxZoom: 19 }
    ).addTo(map)

    map.on('click', () => onSelectRef.current(null))

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Recreate markers when places list changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current.clear()

    places.forEach(place => {
      const isSelected = selectedPlace?.id === place.id
      const marker = L.marker(
        [place.coordinates.lat, place.coordinates.lng],
        { icon: createPinIcon(place, isSelected) }
      )
        .addTo(map)
        .on('click', e => {
          L.DomEvent.stopPropagation(e)
          onSelectRef.current(place)
        })
      markersRef.current.set(place.id, marker)
    })
  }, [places]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update marker icons when selection changes (no full rebuild)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((marker, id) => {
      const place = places.find(p => p.id === id)
      if (!place) return
      marker.setIcon(createPinIcon(place, selectedPlace?.id === id))
    })

    if (selectedPlace) {
      map.panTo(
        [selectedPlace.coordinates.lat, selectedPlace.coordinates.lng],
        { animate: true, duration: 0.4 }
      )
    }
  }, [selectedPlace, places])

  return <div ref={containerRef} className="map-view" />
}

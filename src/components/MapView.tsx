import { useEffect, useRef, useState } from 'react'
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
  sheetOpen?: boolean
}

export function MapView({ places, selectedPlace, onSelectPlace, sheetOpen = false }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const locationMarkerRef = useRef<L.Marker | null>(null)
  const onSelectRef = useRef(onSelectPlace)

  const [isLocating, setIsLocating] = useState(false)
  const [locateError, setLocateError] = useState(false)

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

  function handleLocate() {
    if (!navigator.geolocation || isLocating) return
    setIsLocating(true)
    setLocateError(false)

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords
        const map = mapRef.current
        if (!map) return

        locationMarkerRef.current?.remove()
        locationMarkerRef.current = L.marker([latitude, longitude], {
          icon: L.divIcon({
            html: '<div class="map-user-dot"><div class="map-user-dot__ring"></div><div class="map-user-dot__core"></div></div>',
            className: '',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          }),
          zIndexOffset: 1000,
        }).addTo(map)

        map.flyTo([latitude, longitude], 15, { duration: 1.2 })
        setIsLocating(false)
      },
      () => {
        setIsLocating(false)
        setLocateError(true)
        setTimeout(() => setLocateError(false), 2000)
      },
      { timeout: 10000, maximumAge: 30000 }
    )
  }

  const btnClass = [
    'map-locate-btn',
    isLocating ? 'map-locate-btn--loading' : '',
    locateError ? 'map-locate-btn--error' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={`map-view-wrapper${sheetOpen ? ' map-view-wrapper--sheet-open' : ''}`}>
      <div ref={containerRef} className="map-view" />

      <button
        className={btnClass}
        onClick={handleLocate}
        aria-label="Vị trí của tôi"
        type="button"
      >
        {isLocating ? (
          <svg className="map-locate-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeDasharray="28 56" />
          </svg>
        ) : locateError ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" aria-hidden="true" width="20" height="20">
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="20" height="20">
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        )}
      </button>
    </div>
  )
}

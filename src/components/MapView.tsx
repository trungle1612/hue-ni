import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Supercluster from 'supercluster'
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

function bubbleContent(place: Place): string {
  const emoji = CATEGORY_ICONS[place.category] ?? '📍'
  if (place.logo) {
    return `<span class="map-pin__bubble-emoji">${emoji}</span>` +
      `<img class="map-pin__bubble-logo" src="${place.logo}" alt="" ` +
      `onerror="this.style.display='none'" />`
  }
  return emoji
}

function createPinIcon(place: Place, selected: boolean, saved: boolean): L.DivIcon {
  const logoClass = place.logo ? ' map-pin__bubble--logo' : ''
  if (selected) {
    return L.divIcon({
      html: `<div class="map-pin map-pin--selected${saved ? ' map-pin--saved' : ''}">
        <div class="map-pin__bubble${logoClass}">${bubbleContent(place)}</div>
        <div class="map-pin__label">${place.name}</div>
      </div>`,
      className: '',
      iconSize: [120, 62],
      iconAnchor: [60, 36],
    })
  }
  return L.divIcon({
    html: `<div class="map-pin${saved ? ' map-pin--saved' : ''}">
      <div class="map-pin__bubble${logoClass}">${bubbleContent(place)}</div>
    </div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

function createClusterIcon(count: number): L.DivIcon {
  let sizeClass: string
  let dims: number
  if (count < 10) { sizeClass = 'sm'; dims = 36 }
  else if (count < 50) { sizeClass = 'md'; dims = 44 }
  else { sizeClass = 'lg'; dims = 54 }

  return L.divIcon({
    html: `<div class="map-cluster map-cluster--${sizeClass}"><span>${count}</span></div>`,
    className: '',
    iconSize: [dims, dims],
    iconAnchor: [dims / 2, dims / 2],
  })
}

type PlaceFeature = GeoJSON.Feature<GeoJSON.Point, { placeId: string }>

interface MapViewProps {
  places: Place[]
  selectedPlace: Place | null
  onSelectPlace: (place: Place | null) => void
  sheetOpen?: boolean
  savedIds?: string[]
}

export function MapView({
  places,
  selectedPlace,
  onSelectPlace,
  sheetOpen = false,
  savedIds = [],
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const renderedMarkersRef = useRef<Map<string, L.Marker>>(new Map())
  const placeMarkersRef = useRef<Map<string, L.Marker>>(new Map())
  const clusterIndexRef = useRef<Supercluster | null>(null)
  const locationMarkerRef = useRef<L.Marker | null>(null)
  const onSelectRef = useRef(onSelectPlace)
  const selectedPlaceRef = useRef(selectedPlace)
  const savedIdsRef = useRef(savedIds)

  const [isLocating, setIsLocating] = useState(false)
  const [locateError, setLocateError] = useState(false)

  useEffect(() => { onSelectRef.current = onSelectPlace })
  useEffect(() => { selectedPlaceRef.current = selectedPlace })
  useEffect(() => { savedIdsRef.current = savedIds })

  function renderClusters(map: L.Map, index: Supercluster) {
    const bounds = map.getBounds()
    const zoom = Math.round(map.getZoom())
    const bbox: [number, number, number, number] = [
      bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth(),
    ]
    const clusters = index.getClusters(bbox, zoom)

    // Keys expected after this render
    const nextKeys = new Set(clusters.map(c =>
      c.properties.cluster
        ? `cluster-${c.properties.cluster_id}`
        : `place-${(c.properties as { placeId: string }).placeId}`
    ))

    // Remove markers no longer visible
    renderedMarkersRef.current.forEach((marker, key) => {
      if (!nextKeys.has(key)) {
        marker.remove()
        renderedMarkersRef.current.delete(key)
      }
    })

    clusters.forEach(cluster => {
      const [lng, lat] = cluster.geometry.coordinates

      if (cluster.properties.cluster) {
        const clusterId = cluster.properties.cluster_id as number
        const key = `cluster-${clusterId}`
        if (renderedMarkersRef.current.has(key)) return

        const count = cluster.properties.point_count as number
        const marker = L.marker([lat, lng], { icon: createClusterIcon(count) })
          .on('click', e => {
            L.DomEvent.stopPropagation(e)
            const expansionZoom = Math.min(index.getClusterExpansionZoom(clusterId), 17)
            map.flyTo([lat, lng], expansionZoom, { duration: 0.5 })
          })
          .addTo(map)
        renderedMarkersRef.current.set(key, marker)
      } else {
        const placeId = (cluster.properties as { placeId: string }).placeId
        const key = `place-${placeId}`
        if (renderedMarkersRef.current.has(key)) return

        const placeMarker = placeMarkersRef.current.get(placeId)
        if (!placeMarker) return
        placeMarker.addTo(map)
        renderedMarkersRef.current.set(key, placeMarker)
      }
    })
  }

  // ── 1. Init map (must be first effect so mapRef is set before places effect) ──
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
    map.on('moveend', () => {
      if (clusterIndexRef.current) renderClusters(map, clusterIndexRef.current)
    })

    mapRef.current = map

    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(containerRef.current!)

    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
      clusterIndexRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Rebuild cluster index when places list changes ──
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Tear down previous markers
    renderedMarkersRef.current.forEach(m => m.remove())
    renderedMarkersRef.current.clear()
    placeMarkersRef.current.clear()

    // Build supercluster index
    const index = new Supercluster({ radius: 60, maxZoom: 17 })
    const features: PlaceFeature[] = places.map(p => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.coordinates.lng, p.coordinates.lat] },
      properties: { placeId: p.id },
    }))
    index.load(features)
    clusterIndexRef.current = index

    // Pre-build individual place markers
    places.forEach(place => {
      const marker = L.marker(
        [place.coordinates.lat, place.coordinates.lng],
        {
          icon: createPinIcon(
            place,
            selectedPlaceRef.current?.id === place.id,
            savedIdsRef.current.includes(place.id)
          ),
        }
      ).on('click', e => {
        L.DomEvent.stopPropagation(e)
        onSelectRef.current(place)
      })
      placeMarkersRef.current.set(place.id, marker)
    })

    renderClusters(map, index)
  }, [places]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 3. Update icons and pan when selection / saved state changes ──
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    placeMarkersRef.current.forEach((marker, id) => {
      const place = places.find(p => p.id === id)
      if (!place) return
      marker.setIcon(createPinIcon(place, selectedPlace?.id === id, savedIds.includes(id)))
    })

    if (selectedPlace) {
      const currentZoom = map.getZoom()
      if (currentZoom < 15) {
        map.flyTo(
          [selectedPlace.coordinates.lat, selectedPlace.coordinates.lng],
          15,
          { duration: 0.6 }
        )
      } else {
        map.panTo(
          [selectedPlace.coordinates.lat, selectedPlace.coordinates.lng],
          { animate: true, duration: 0.4 }
        )
      }
    }
  }, [selectedPlace, places, savedIds])

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

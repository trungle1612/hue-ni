export type Category =
  | 'tomb'
  | 'landmark'
  | 'cafe'
  | 'food'
  | 'homestay'
  | 'service'

export interface Place {
  id: string
  name: string
  category: Category
  tags: string[]
  coverImage: string
  gallery: string[]
  address: string
  coordinates: { lat: number; lng: number }
  rating: number
  priceRange: '₫' | '₫₫' | '₫₫₫'
  hours: { open: string; close: string }
  vibe: string
  description: string
  insiderTips: string[]
  collection?: string
}

export interface Collection {
  id: string
  title: string
  description: string
}

export interface PlacesData {
  places: Place[]
  collections: Collection[]
}

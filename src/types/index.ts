export type Category =
  | 'tomb'
  | 'landmark'
  | 'cafe'
  | 'food'
  | 'homestay'
  | 'service'

export interface Review {
  author: string
  text: string
  rating?: number
  photos?: string[]
}

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
  specialty?: boolean
  collection?: string
  phone?: string
  website?: string
  logo?: string
  reviews?: Review[]
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

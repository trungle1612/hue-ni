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

export interface FoodTags {
  dishType: string[]   // e.g. ['bun-bo', 'bun-thit-nuong']
  mealTime: string[]   // e.g. ['breakfast', 'lunch']
  vibe: string[]       // e.g. ['family_friendly', 'street_food']
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
  menu?: string[]
  foodTags?: FoodTags
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

export type EventCategory = 'royal' | 'music' | 'sports' | 'cultural'

export interface FestivalEvent {
  id: string
  title: string
  category: EventCategory
  isAnnual: boolean
  summary: string
  highlights: string[]
  timeString: string
  location: string
  organizer: string
  date: { start: string; end?: string }
  thumbnail: string
  linkedStoryId?: string
}

export type StoryType = 'royal_anecdote' | 'survival_guide'

export interface StoryAndGuide {
  id: string
  type: StoryType
  title: string
  excerpt: string
  content: string
}

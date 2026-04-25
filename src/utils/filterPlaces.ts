import type { Place } from '../types'

export function filterPlaces(
  places: Place[],
  category: string,
  subFilter: string | null
): Place[] {
  if (category === 'all') return places
  if (category === 'cafe') {
    return places.filter(
      p =>
        p.category === 'cafe' &&
        p.specialty === true &&
        (subFilter === null || p.tags.includes(subFilter))
    )
  }
  return places.filter(p => p.category === category)
}

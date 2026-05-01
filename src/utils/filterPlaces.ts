import type { Place, Category } from '../types'

const DISH_GROUPS: Record<string, string[]> = {
  'bun':           ['bun', 'bun-bo', 'bun-mam-nem', 'bun-thit-nuong', 'bun-nghe', 'bun-chay'],
  'cac-loai-banh': ['cac-loai-banh', 'banh-ep', 'banh-beo'],
  'banh-canh':     ['banh-canh', 'cha-cua', 'ca-loc', 'nam-pho'],
  'com-hen':       ['com-hen'],
  'che':           ['che'],
  'oc':            ['oc'],
}

export function filterPlaces(
  places: Place[],
  category: Category | 'all',
  subFilter: string | null,
  foodGroup?: string,
  foodDish?: string | null,
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

  if (category === 'food') {
    const activeKey = (foodDish ?? foodGroup) || 'all'
    if (activeKey === 'all') return places.filter(p => p.category === 'food')
    const allowed = DISH_GROUPS[activeKey] ?? [activeKey]
    return places.filter(p => {
      if (p.category !== 'food') return false
      return p.foodTags?.dishType.some(dt => allowed.includes(dt)) ?? false
    })
  }

  return places.filter(p => p.category === category)
}

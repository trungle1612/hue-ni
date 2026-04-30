import type { Place, Category } from '../types'

const FOOD_KEYWORDS: Record<string, string[]> = {
  'bun':            ['bún'],
  'bun-bo':         ['bún bò'],
  'bun-mam-nem':    ['bún mắm nêm', 'mắm nêm'],
  'bun-thit-nuong': ['bún thịt nướng'],
  'bun-nghe':       ['bún nghệ'],
  'bun-chay':       ['bún chay'],
  'banh-ep':        ['bánh ép'],
  'banh-beo':       ['bánh bèo', 'nậm lọc'],
  'banh-canh':      ['bánh canh'],
  'cha-cua':        ['chả cua'],
  'ca-loc':         ['cá lóc'],
  'nam-pho':        ['nam phổ'],
  'com-hen':        ['cơm hến'],
  'che':            ['chè'],
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
    const keywords = FOOD_KEYWORDS[activeKey] ?? []
    const nameLower = (name: string) => name.toLowerCase()
    return places.filter(
      p =>
        p.category === 'food' &&
        keywords.some(kw => nameLower(p.name).includes(kw.toLowerCase()))
    )
  }

  return places.filter(p => p.category === category)
}

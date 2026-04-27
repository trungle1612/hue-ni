import type { Category, Place, Collection } from '../types'

const cache = new Map<Category, Place[]>()

export async function loadCategory(category: Category): Promise<Place[]> {
  if (cache.has(category)) return cache.get(category)!

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mod: any
  switch (category) {
    case 'cafe':
      mod = await import('../data/categories/cafe.json')
      break
    case 'food':
      mod = await import('../data/categories/food.json')
      break
    case 'tomb':
      mod = await import('../data/categories/tomb.json')
      break
    case 'homestay':
      mod = await import('../data/categories/homestay.json')
      break
    case 'landmark':
      mod = await import('../data/categories/landmark.json')
      break
    case 'service':
      mod = await import('../data/categories/service.json')
      break
  }

  const places = (mod.default ?? mod).places as Place[]
  cache.set(category, places)
  return places
}

let collectionsCache: Collection[] | null = null

export async function loadCollections(): Promise<Collection[]> {
  if (collectionsCache) return collectionsCache
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod: any = await import('../data/collections.json')
  collectionsCache = (mod.default ?? mod).collections as Collection[]
  return collectionsCache
}

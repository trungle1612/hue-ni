# Specialty Café Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface only curated specialty cafés on the map by default and add a secondary sub-filter row (Hoài cổ, Cà phê muối, Sân vườn, Check-in) when the Café primary chip is active.

**Architecture:** Add a `specialty` boolean to the `Place` type + curate `places.json`; extract a pure `filterPlaces` utility (tested); add `activeSubFilter` state to `HomePage` and render a second chip row that animates in below the primary row.

**Tech Stack:** React 19, TypeScript, Vitest, plain CSS (BEM), static JSON data

---

## File Map

| Action | Path | What changes |
|---|---|---|
| Modify | `src/types/index.ts` | Add `specialty?: boolean` to `Place` |
| Modify | `src/data/constants.ts` | Add `CAFE_SUB_FILTERS` array |
| Create | `src/utils/filterPlaces.ts` | Pure filter function |
| Create | `src/utils/filterPlaces.test.ts` | Unit tests for filter function |
| Modify | `src/data/places.json` | Add `specialty` + sub-type tags to all 78 cafés |
| Modify | `src/pages/HomePage/index.tsx` | New state + use `filterPlaces` + render sub-row |
| Modify | `src/pages/HomePage/style.css` | `.home-map-filters__row`, sub-chip styles, animation |

---

## Task 1: Add `specialty` to Place type + pure filter utility (TDD)

**Files:**
- Modify: `src/types/index.ts`
- Create: `src/utils/filterPlaces.test.ts`
- Create: `src/utils/filterPlaces.ts`

- [ ] **Step 1: Add `specialty` field to Place type**

In `src/types/index.ts`, add the new optional field after `insiderTips`:

```ts
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
```

- [ ] **Step 2: Write failing tests**

Create `src/utils/filterPlaces.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { filterPlaces } from './filterPlaces'
import type { Place } from '../types'

const base: Omit<Place, 'id' | 'category' | 'specialty' | 'tags'> = {
  name: 'Test',
  coverImage: '',
  gallery: [],
  address: '',
  coordinates: { lat: 0, lng: 0 },
  rating: 4.5,
  priceRange: '₫₫',
  hours: { open: '08:00', close: '22:00' },
  vibe: '',
  description: '',
  insiderTips: [],
}

const cafe = (id: string, specialty: boolean | undefined, tags: string[] = []): Place => ({
  ...base,
  id,
  category: 'cafe',
  specialty,
  tags,
})

const tomb = (id: string): Place => ({
  ...base,
  id,
  category: 'tomb',
  tags: [],
})

describe('filterPlaces', () => {
  it('returns all places when category is all', () => {
    const places = [cafe('c1', true), tomb('t1')]
    expect(filterPlaces(places, 'all', null)).toHaveLength(2)
  })

  it('returns only specialty:true cafes when category is cafe', () => {
    const places = [
      cafe('c1', true),
      cafe('c2', false),
      cafe('c3', undefined),
    ]
    const result = filterPlaces(places, 'cafe', null)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c1')
  })

  it('filters specialty cafes by sub-type tag', () => {
    const places = [
      cafe('c1', true, ['hoai-co']),
      cafe('c2', true, ['san-vuon']),
    ]
    const result = filterPlaces(places, 'cafe', 'hoai-co')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c1')
  })

  it('returns all specialty cafes when subFilter is null', () => {
    const places = [
      cafe('c1', true, ['hoai-co']),
      cafe('c2', true, ['san-vuon']),
    ]
    expect(filterPlaces(places, 'cafe', null)).toHaveLength(2)
  })

  it('excludes non-specialty cafes even with matching tag', () => {
    const places = [
      cafe('c1', false, ['hoai-co']),
      cafe('c2', true, ['hoai-co']),
    ]
    const result = filterPlaces(places, 'cafe', 'hoai-co')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c2')
  })

  it('filters by non-cafe category, ignores specialty', () => {
    const places = [tomb('t1'), cafe('c1', false)]
    const result = filterPlaces(places, 'tomb', null)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('t1')
  })
})
```

- [ ] **Step 3: Run tests — expect FAIL**

```bash
npx vitest run src/utils/filterPlaces.test.ts
```

Expected: `Error: Failed to resolve import "./filterPlaces"`

- [ ] **Step 4: Implement filterPlaces**

Create `src/utils/filterPlaces.ts`:

```ts
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
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npx vitest run src/utils/filterPlaces.test.ts
```

Expected:
```
✓ src/utils/filterPlaces.test.ts (6 tests)
Test Files  1 passed (1)
```

- [ ] **Step 6: Commit**

```bash
git add src/types/index.ts src/utils/filterPlaces.ts src/utils/filterPlaces.test.ts
git commit -m "feat: add specialty field to Place type and filterPlaces utility"
```

---

## Task 2: Add CAFE_SUB_FILTERS constant

**Files:**
- Modify: `src/data/constants.ts`

- [ ] **Step 1: Add constant**

In `src/data/constants.ts`, append after the existing `FILTER_OPTIONS` export:

```ts
export const CAFE_SUB_FILTERS: { value: string | null; label: string }[] = [
  { value: null,          label: 'Tất cả' },
  { value: 'hoai-co',     label: '🏛️ Hoài cổ' },
  { value: 'ca-phe-muoi', label: '☕ Cà phê muối' },
  { value: 'san-vuon',    label: '🌿 Sân vườn' },
  { value: 'check-in',    label: '📸 Check-in' },
]
```

- [ ] **Step 2: Type-check**

```bash
npx tsc -b --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/data/constants.ts
git commit -m "feat: add CAFE_SUB_FILTERS constant"
```

---

## Task 3: Curate places.json

**Files:**
- Modify: `src/data/places.json`

This is the data-editing task. Use the two-step process below: script for bulk `specialty` assignment, then manual sub-type tagging.

### Step A — Bulk-assign `specialty`

- [ ] **Step 1: Run the curation script**

Create a temp file `scripts/set-specialty.mjs` (delete after use):

```js
import { readFileSync, writeFileSync } from 'fs'

const data = JSON.parse(readFileSync('src/data/places.json', 'utf8'))

for (const place of data.places) {
  if (place.category === 'cafe') {
    place.specialty = place.rating >= 4.0
  }
}

writeFileSync('src/data/places.json', JSON.stringify(data, null, 2), 'utf8')
console.log('Done. specialty=true cafes:', data.places.filter(p => p.specialty).length)
```

Run:
```bash
node scripts/set-specialty.mjs
```

Expected output: `Done. specialty=true cafes: ~75` (all with rating ≥ 4.0)

- [ ] **Step 2: Apply manual overrides**

Open `src/data/places.json` and manually set these overrides (high review count → specialty despite rating):

| Place name | Rating | Override |
|---|---|---|
| Cà Phê Muối cs1 | 3.8 | `specialty: true` — well-known Huế institution |
| Coffee and Tea | 2.9 | `specialty: false` — leave as-is |

Apply: find `"Cà Phê Muối cs1"` in places.json and change its `specialty` to `true`.

- [ ] **Step 3: Delete temp script**

```bash
rm scripts/set-specialty.mjs
```

### Step B — Add sub-type tags

- [ ] **Step 4: Add `ca-phe-muoi` tag to salted-coffee cafés**

In `places.json`, for each of the following cafés, add `"ca-phe-muoi"` to their `tags` array:

- `PhinHolic - Cà phê muối, Đặc sản Huế`
- `Cà phê Muối - Đặc sản Huế`
- `Tiệm Cà Phê 81- Cà Phê Muối Huế- Quán Cà Phê Đẹp Huế`
- `DeChill - Cà Phê Muối Huế - Quán Cà Phê Đẹp Ngắm Hoàng Hôn Huế`
- `Cà Phê Muối cs1`

- [ ] **Step 5: Add `hoai-co` tag to heritage-aesthetic cafés**

Add `"hoai-co"` to `tags` for:

- `Không Gian Hoài Cổ Coffee` (name says it all)
- `Nhà Hàng Vỹ Dạ Xưa` (old Vỹ Dạ ambiance)
- `Cafe Tùng` (historic Huế institution)
- `Xưởng 1976 Cafe` (vintage 1976 aesthetic)
- `Trầm Cafe - Cafe chuẩn vị cố đô` (cố đô = old capital)
- `Mê Cafe - Bến Xưa Vĩ Dạ` (Bến Xưa = old wharf)

- [ ] **Step 6: Add `san-vuon` tag to garden/open-air cafés**

Add `"san-vuon"` to `tags` for:

- `Tiệm Café Tụi Mình`
- `Mộc Viên Cafe` (mộc viên = wooden garden)
- `Ta Gallery (Ta Cafe & Bakery)`
- `CỦI Coffee`
- `KODO`
- `Tôn Nữ Viên Cafe`

- [ ] **Step 7: Add `check-in` tag to photogenic cafés**

Add `"check-in"` to `tags` for:

- `Secret Lounge Hue`
- `Húe Imperial Sky Bar & Cafe`
- `Bến Trăng Café & Bistro`
- `Cat cafe Mocha Aeon Huế Store`
- `1984 Coffee • Pub • Restaurant`
- `HÚE by Xéooo`

- [ ] **Step 8: Type-check**

```bash
npx tsc -b --noEmit
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add src/data/places.json
git commit -m "feat: curate specialty cafes and add sub-type tags in places.json"
```

---

## Task 4: Update HomePage filter logic

**Files:**
- Modify: `src/pages/HomePage/index.tsx`

- [ ] **Step 1: Add import and new state**

At the top of `src/pages/HomePage/index.tsx`, add the `filterPlaces` import (the `CATEGORY_LABELS` import already exists — leave it):

```ts
import { filterPlaces } from '../../utils/filterPlaces'
```

Inside the `HomePage` function, add the new state (after the existing `useState` calls):

```ts
const [activeSubFilter, setActiveSubFilter] = useState<string | null>(null)
```

- [ ] **Step 2: Replace visiblePlaces derivation**

Replace the existing `visiblePlaces` block:

```ts
// REMOVE this:
const visiblePlaces =
  selectedCategory === 'all'
    ? ALL_PLACES
    : ALL_PLACES.filter(p => p.category === selectedCategory)
```

With:

```ts
const visiblePlaces = filterPlaces(ALL_PLACES, selectedCategory, activeSubFilter)
```

- [ ] **Step 3: Reset activeSubFilter when switching primary category**

In the primary chip `onClick` handler, add `setActiveSubFilter(null)`:

```tsx
onClick={() => {
  setSelectedCategory(opt.value)
  setActiveSubFilter(null)
  dismissSheet()
}}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc -b --noEmit
```

Expected: no errors.

- [ ] **Step 5: Run all tests**

```bash
npm test
```

Expected: all 18 tests pass (12 existing + 6 new).

- [ ] **Step 6: Commit**

```bash
git add src/pages/HomePage/index.tsx
git commit -m "feat: wire activeSubFilter state and filterPlaces into HomePage"
```

---

## Task 5: Add sub-filter row JSX + CSS

**Files:**
- Modify: `src/pages/HomePage/index.tsx`
- Modify: `src/pages/HomePage/style.css`

### CSS first

- [ ] **Step 1: Update `.home-map-filters` to column layout**

In `src/pages/HomePage/style.css`, replace the `.home-map-filters` block:

```css
/* BEFORE */
.home-map-filters {
  position: absolute;
  top: var(--space-md);
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
  padding: 0 var(--space-md);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.home-map-filters::-webkit-scrollbar {
  display: none;
}
```

With:

```css
.home-map-filters {
  position: absolute;
  top: var(--space-md);
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.home-map-filters__row {
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
  padding: 0 var(--space-md);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.home-map-filters__row::-webkit-scrollbar {
  display: none;
}
```

- [ ] **Step 2: Add sub-chip styles and slide-in animation**

Append to `src/pages/HomePage/style.css`:

```css
/* ── Sub-filter row (café secondary chips) ── */

.home-map-subfilter-row {
  animation: subfilter-slide-in 0.22s cubic-bezier(0.32, 0, 0.2, 1) both;
}

@keyframes subfilter-slide-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.home-map-chip--sub {
  padding: 0.35rem 0.75rem;
  font-size: 0.72rem;
  background: rgba(255, 243, 224, 0.92);
  color: var(--color-secondary);
  outline: 1.5px solid rgba(201, 162, 39, 0.5);
  outline-offset: -1.5px;
}

.home-map-chip--sub-active {
  background: var(--color-secondary);
  outline-color: var(--color-secondary);
  color: #ffffff;
  box-shadow: 0 3px 12px rgba(115, 92, 0, 0.35);
}
```

### JSX

- [ ] **Step 3: Add CAFE_SUB_FILTERS import, then wrap primary chips in a row div and add secondary row**

First, update the constants import in `src/pages/HomePage/index.tsx` to add `CAFE_SUB_FILTERS`:

```ts
import { CATEGORY_LABELS, CAFE_SUB_FILTERS } from '../../data/constants'
```

Then replace the `home-map-filters` div contents:

```tsx
{/* Category filter — floats over map */}
<div className="home-map-filters" role="group" aria-label="Lọc địa điểm">
  {/* Primary row */}
  <div className="home-map-filters__row">
    {MAP_FILTER_OPTIONS.map(opt => (
      <button
        key={opt.value}
        className={`home-map-chip${selectedCategory === opt.value ? ' home-map-chip--active' : ''}`}
        onClick={() => {
          setSelectedCategory(opt.value)
          setActiveSubFilter(null)
          dismissSheet()
        }}
        aria-pressed={selectedCategory === opt.value}
      >
        <span className="home-map-chip__icon">{opt.icon}</span>
        {opt.label}
      </button>
    ))}
  </div>

  {/* Secondary row — only visible when café is selected */}
  {selectedCategory === 'cafe' && (
    <div className="home-map-filters__row home-map-subfilter-row">
      {CAFE_SUB_FILTERS.map(opt => (
        <button
          key={String(opt.value)}
          className={`home-map-chip home-map-chip--sub${activeSubFilter === opt.value ? ' home-map-chip--sub-active' : ''}`}
          onClick={() => setActiveSubFilter(opt.value)}
          aria-pressed={activeSubFilter === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )}
</div>
```

- [ ] **Step 4: Type-check**

```bash
npx tsc -b --noEmit
```

Expected: no errors.

- [ ] **Step 5: Run all tests**

```bash
npm test
```

Expected: all 18 tests pass.

- [ ] **Step 6: Start dev server and verify in browser**

```bash
npm run dev
```

Open `http://localhost:5173`. Verify:

1. Default map shows all places.
2. Tap "☕ Cà phê" — only specialty cafés appear on map; a gold sub-filter row slides in below.
3. Tap "🏛️ Hoài cổ" — map narrows to heritage-tagged cafés only.
4. Tap "Tất cả" sub-chip — all specialty cafés return.
5. Tap "🗺️ Tất cả" primary chip — sub-row disappears, all places return.
6. Tap "🏡 Homestay" — sub-row gone, homestay places shown.

- [ ] **Step 7: Commit**

```bash
git add src/pages/HomePage/index.tsx src/pages/HomePage/style.css
git commit -m "feat: add secondary cafe sub-filter chip row to HomePage"
```

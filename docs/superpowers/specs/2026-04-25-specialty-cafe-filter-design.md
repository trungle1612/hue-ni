# Specialty Café Filter — Design Spec
**Date:** 2026-04-25
**Issue:** https://github.com/trungle1612/hue-ni/issues/4

## Overview

Curate the café category to surface only distinctive, quality Huế cafés by default, and add a secondary sub-filter row so users can drill into specific vibes (salted coffee, heritage, garden, check-in spots).

## Decisions

| Question | Answer |
|---|---|
| How to handle low-quality cafés? | Add `specialty` boolean; `true` = shown by default, `false` = hidden |
| Physical deletion of cafés? | No — keep all in JSON, just mark `specialty: false` |
| Secondary filter UX? | Second row of sub-chips slides in below primary chips when Café is selected |
| Sub-filter mechanism? | Tag-based — 4 new tag values in the existing `tags[]` array |
| Default café view? | Only `specialty: true` cafés, before any sub-filter is applied |

---

## Section 1 — Data model

### 1a. `Place` type (`src/types/index.ts`)

Add one optional field:

```ts
specialty?: boolean
```

Only `cafe` category places use this field. Non-café categories do not need it and it is ignored in filtering for those categories.

### 1b. Four new tag values

Added to the existing free-text `tags: string[]` array on each café entry. No schema change required.

| Tag value | Meaning |
|---|---|
| `ca-phe-muoi` | Serves Huế-specialty salted coffee |
| `hoai-co` | Heritage / antique aesthetic space |
| `san-vuon` | Garden or open-air chill space |
| `check-in` | Visually distinctive / photogenic |

Each café can carry multiple sub-type tags. A rooftop garden that also serves café muối gets both `san-vuon` and `ca-phe-muoi`.

### 1c. Data curation criteria

Review all 78 café entries and set `specialty: true/false`. A place is `specialty: true` if it meets **either** condition:

- rating ≥ 4.0 AND has a distinctive character (not a generic chain)
- OR has a high review count (popular, culturally significant) — even if rating is slightly below 4.0

High review count overrides a marginal rating dip. Example: "Cà Phê Muối cs1" (3.8) qualifies as `specialty: true` because it is a well-known Huế institution with many reviews.

Known `specialty: false` candidates: places with low rating AND few reviews, or generic chains (e.g. "Coffee and Tea" at 2.9). Expected ~50–55 places marked `true`.

Also add the 4 sub-type tags to each `specialty: true` café as appropriate.

---

## Section 2 — Filter state & logic (`src/pages/HomePage/index.tsx`)

### New state

```ts
const [activeSubFilter, setActiveSubFilter] = useState<string | null>(null)
```

`null` = no sub-filter active (show all specialty cafés).

### Updated `visiblePlaces` derivation

```ts
const visiblePlaces =
  selectedCategory === 'all'
    ? ALL_PLACES
    : selectedCategory === 'cafe'
      ? ALL_PLACES.filter(p =>
          p.category === 'cafe' &&
          p.specialty === true &&
          (activeSubFilter === null || p.tags.includes(activeSubFilter))
        )
      : ALL_PLACES.filter(p => p.category === selectedCategory)
```

### Reset behaviour

When the user taps any primary chip that is not `cafe`, call `setActiveSubFilter(null)` alongside `setSelectedCategory(...)`. This ensures the sub-row state is always clean when returning to the café view later.

---

## Section 3 — UI: secondary sub-filter row

### Rendering condition

The sub-filter row is rendered only when `selectedCategory === 'cafe'`. It sits in the same `home-map-filters` container, below the existing primary chip row.

### Sub-filter chip options

| Label | `activeSubFilter` value |
|---|---|
| Tất cả | `null` |
| 🏛️ Hoài cổ | `'hoai-co'` |
| ☕ Cà phê muối | `'ca-phe-muoi'` |
| 🌿 Sân vườn | `'san-vuon'` |
| 📸 Check-in | `'check-in'` |

### Visual style

Sub-chips use the gold palette to distinguish from the primary red chips:
- Inactive: `background: #fff3e0`, `color: #735c00`, `border: 1.5px solid #c9a227`
- Active: `background: #735c00`, `color: #fff`, no border

The row slides in with a short CSS fade + translate-Y animation (consistent with the existing sheet animations).

### Z-index

No changes needed. The sub-row sits within the existing `home-map-filters` div which already has `z-index: 1000`. The map's locate button and bottom sheet float above via existing layering.

---

## Section 4 — Constants update (`src/data/constants.ts`)

Add sub-filter options constant:

```ts
export const CAFE_SUB_FILTERS: { value: string | null; label: string }[] = [
  { value: null,          label: 'Tất cả' },
  { value: 'hoai-co',     label: '🏛️ Hoài cổ' },
  { value: 'ca-phe-muoi', label: '☕ Cà phê muối' },
  { value: 'san-vuon',    label: '🌿 Sân vườn' },
  { value: 'check-in',    label: '📸 Check-in' },
]
```

---

## Out of scope

- Sub-filters for non-café categories (no demand, can be added later)
- Exposing `specialty: false` cafés via a toggle (not needed)
- Any changes to HeritagePage, MyTripPage, or DetailsPage
- New route or page for café discovery

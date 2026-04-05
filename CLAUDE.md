# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
Check designs/DESIGN.md to see the design principle.

## Commands

```bash
npm run dev       # Start dev server (localhost:5173) with HMR
npm run build     # Type-check (tsc -b) then bundle with Vite
npm run lint      # Run ESLint (flat config, tseslint.configs.recommended)
npm run preview   # Preview production build locally
npm test          # Run Vitest tests once
npm run test:watch  # Run Vitest in watch mode
```

To run a single test file: `npx vitest run src/hooks/useMyTrip.test.ts`

## Architecture

React 19 + TypeScript + Vite travel guide app for Huế, Vietnam. Client-only — no backend, no API calls.

**Entry:** `index.html` → `src/main.tsx` → `src/App.tsx`

### Routing (`src/App.tsx`)

React Router v7. Four routes:
- `/` — HomePage: full-screen Leaflet map with category filter chips and place bottom sheet
- `/heritage` — HeritagePage: filterable grid of all places
- `/my-trip` — MyTripPage: saved places from localStorage
- `/details/:id` — DetailsPage: renders **outside** `AppLayout` (no bottom nav)

`AppLayout` wraps the first three routes and provides the fixed `BottomNav` (`position: fixed`, `z-index: 100`). Page content must account for `--bottom-nav-height: 4rem` at the bottom. HomePage does this via `height: calc(100dvh - var(--bottom-nav-height))` to let the map fill the screen; other pages rely on `paddingBottom` in `AppLayout`'s `<main>`.

### Data (`src/data/places.json`)

All place data is static JSON imported directly — no fetching. Consumed as:
```ts
const ALL_PLACES = placesData.places as Place[]
const ALL_COLLECTIONS = placesData.collections as Collection[]
```

Types are in `src/types/index.ts`. Categories: `tomb | landmark | cafe | food | homestay | service`. Human-readable labels and filter chip definitions live in `src/data/constants.ts`.

### State

Only one piece of cross-route state: the "My Trip" saved-places list. Managed by `src/hooks/useMyTrip.ts` — a custom hook that reads/writes `localStorage` key `hue-ni-trip` (JSON array of place IDs). Each page that needs it calls `useMyTrip()` directly; no context or global store.

Onboarding (first-launch GPS modal) is gated by `localStorage` key `hue-ni-onboarded` via `src/utils/onboarding.ts`.

### Map (`src/components/MapView.tsx`)

Vanilla Leaflet (not react-leaflet) managed via `useRef`. Three `useEffect` hooks:
1. **Init once** — creates `L.map`, adds CartoDB Voyager tile layer, sets Huế bounds (`[[16.35, 107.50], [16.55, 107.70]]`, `minZoom: 12`, `maxBoundsViscosity: 0.85`)
2. **Rebuild markers** — fires when `places` prop changes; clears and re-adds all `L.marker` instances using `L.divIcon` with emoji HTML
3. **Update selection** — fires when `selectedPlace` changes; calls `marker.setIcon()` on each marker and pans the map

The map tile pane gets a CSS filter in `MapView.css` for the green-tinted imperial aesthetic.

### Styling

Global design tokens in `src/index.css` (Material 3-ish palette, two fonts). Each component and page has a co-located `.css` file using BEM naming. No CSS-in-JS, no Tailwind.

Key tokens: `--color-primary: #7d0010`, `--color-secondary: #735c00`, `--font-serif: 'Noto Serif'`, `--font-sans: 'Plus Jakarta Sans'`, `--bottom-nav-height: 4rem`.

### Tests

Vitest + `@testing-library/react` + jsdom. Only hook logic is tested (`src/hooks/useMyTrip.test.ts`, 12 cases). Component/page tests don't exist yet.

### TypeScript

Two tsconfig scopes: `tsconfig.app.json` (browser/React, strict, ES2023) and `tsconfig.node.json` (Vite config). No path aliases configured.

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

React 19 + TypeScript + Vite travel guide PWA for Huế, Vietnam. Client-only — no backend, no API calls. Deployed at `https://hue-ni.vercel.app`.

**Entry:** `index.html` → `src/main.tsx` → `src/App.tsx`

### Routing (`src/App.tsx`)

React Router v7. Four routes:
- `/` — HomePage: cream header + full-screen Leaflet map + floating filter chips + place bottom sheet
- `/heritage` — HeritagePage: filterable card list of all places
- `/my-trip` — MyTripPage: saved places from localStorage
- `/details/:id` — DetailsPage: renders **outside** `AppLayout` (no bottom nav)

`AppLayout` wraps the first three routes and provides the fixed `BottomNav` (`position: fixed`, `z-index: 100`). Page content must account for `--bottom-nav-height: 4rem`. HomePage does this via `height: calc(100dvh - var(--bottom-nav-height))`; other pages rely on `paddingBottom` in `AppLayout`'s `<main>`.

### Data (`src/data/places.json`)

All place data is static JSON imported directly — no fetching. Consumed as:
```ts
const ALL_PLACES = placesData.places as Place[]
```

Types in `src/types/index.ts`. Categories: `tomb | landmark | cafe | food | homestay | service`. Labels and filter options in `src/data/constants.ts`.

### State

Saved-places list lives in `src/hooks/useMyTrip.ts` — reads/writes `localStorage` key `hue-ni-trip` (JSON array of place IDs). The hook is instantiated **once** inside `MyTripProvider` (`src/contexts/MyTripContext.tsx`), which wraps the entire app in `App.tsx`. All consumers (`BottomNav`, `PlaceCard`, `HomePage`, `MyTripPage`, `DetailsPage`) call `useMyTripContext()` — never `useMyTrip()` directly — so bookmark state is shared and updates propagate everywhere (e.g. the BottomNav badge on `/my-trip`).

Onboarding GPS modal gated by `localStorage` key `hue-ni-onboarded` via `src/utils/onboarding.ts`.

### Map (`src/components/MapView.tsx`)

Vanilla Leaflet (not react-leaflet) managed with `useRef`. Returns a `div.map-view-wrapper` containing the map container and a floating locate button.

Four `useEffect` hooks:
1. **Init once** — creates `L.map`, CartoDB Voyager tiles, Huế bounds `[[16.35, 107.50], [16.55, 107.70]]`, `minZoom: 12`, `maxBoundsViscosity: 0.85`
2. **Rebuild markers** — fires when `places` prop changes; clears/re-adds `L.marker` instances using `L.divIcon` with emoji HTML
3. **Update selection** — fires when `selectedPlace` changes; calls `marker.setIcon()` and pans map
4. **Callback ref sync** — keeps `onSelectRef.current` fresh each render without triggering effects

The locate button (bottom-right) calls `navigator.geolocation.getCurrentPosition()`, places a pulsing blue `div.map-user-dot` marker via `locationMarkerRef`, and flies to the user's position. Three states: idle / loading (spinner) / error (shake animation).

Tile pane gets `filter: hue-rotate(112deg) saturate(0.6) brightness(0.8)` in `MapView.css` for the green-tinted imperial aesthetic. `isolation: isolate` on `.map-view` contains Leaflet's internal z-index stacking so it doesn't bleed above page UI. Filter chips and locate button use `z-index: 1000` to stay above map panes.

### PlaceCard (`src/components/PlaceCard.tsx`)

Two variants: `vertical` (Heritage list, full-width, 2-line name clamp) and `horizontal` (Home carousel, 200px, single-line truncated name, vibe hidden).

Both variants include a floating bookmark button (top-right of image) that calls `useMyTripContext()` with `e.stopPropagation()` to prevent card navigation. Saved state: filled red bookmark + spring-pop animation. Unsaved: outline bookmark on dark glassmorphic circle.

### Design System (enforced — see `designs/DESIGN.md`)

- **No-Line Rule**: no `1px solid` borders anywhere. Use tonal background shifts or `box-shadow: 0 -1px 0 rgba(...)` for separators.
- **Active CTAs**: silk-sheen gradient `linear-gradient(135deg, var(--color-primary), var(--color-primary-container))` — never flat color.
- **Glassmorphism**: floating elements use `background: rgba(253,246,236,0.92)` + `backdrop-filter: blur(...)`.
- **Shadows**: tinted with `rgba(43,22,19,...)` (on-surface color), never black.
- **Fonts**: `--font-serif: 'Noto Serif'` for headings/titles, `--font-sans: 'Plus Jakarta Sans'` for all UI labels. The React Compiler is active — do not use `useCallback` with dependency arrays (causes lint error `react-hooks/preserve-manual-memoization`); use plain functions instead.

Key tokens: `--color-primary: #7d0010`, `--color-secondary: #735c00`, `--color-tertiary: #5e2b34`, `--color-secondary-fixed: #ffe088`, `--bottom-nav-height: 4rem`.

### Styling

Global tokens in `src/index.css`. Each component has a co-located `.css` file using BEM naming. Pages use a folder-per-page structure with `index.tsx` + `style.css`:

```
src/pages/
  HomePage/       index.tsx + style.css
  HeritagePage/   index.tsx + style.css
  MyTripPage/     index.tsx + style.css
  DetailsPage/    index.tsx + style.css
```

`App.tsx` imports pages as `'./pages/HomePage'` — TypeScript resolves `index.tsx` automatically. No CSS-in-JS, no Tailwind.

### Tests

Vitest + `@testing-library/react` + jsdom. Only `src/hooks/useMyTrip.test.ts` has tests (12 cases). No component/page tests.

### TypeScript

Two tsconfig scopes: `tsconfig.app.json` (browser/React, strict, ES2023) and `tsconfig.node.json` (Vite config). No path aliases.

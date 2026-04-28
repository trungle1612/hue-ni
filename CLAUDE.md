# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
Check designs/DESIGN.md to see the design principle.
Always use frontend-design to implement UI.

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

React 19 + TypeScript + Vite travel guide PWA for Huế, Vietnam. Client-only — no backend, no API calls. Deployed at `https://hue-ni.vercel.app`. All UI strings are in Vietnamese — maintain this when adding user-facing text.

**Entry:** `index.html` → `src/main.tsx` → `src/App.tsx`

### Routing (`src/App.tsx`)

React Router v7. Four routes:
- `/` — HomePage: cream header + full-screen Leaflet map + floating filter chips + place bottom sheet
- `/heritage` — HeritagePage: filterable card list of all places
- `/my-trip` — MyTripPage: saved places from localStorage
- `/details/:id` — DetailsPage: renders **outside** `AppLayout` (no bottom nav)

`AppLayout` wraps the first three routes and provides the fixed `BottomNav` (`position: fixed`, `z-index: 100`). Page content must account for `--bottom-nav-height: 4rem`. HomePage does this via `height: calc(100dvh - var(--bottom-nav-height))`; other pages rely on `paddingBottom` in `AppLayout`'s `<main>`.

### Data (`src/data/categories/`)

Place data is split into per-category JSON files (`cafe.json`, `food.json`, `tomb.json`, `homestay.json`, `landmark.json`, `service.json`), each with shape `{ "places": Place[] }`. They are **lazy-loaded** via dynamic imports in `src/utils/loadCategory.ts`, which caches results in a `Map<Category, Place[]>`. Collections live in `src/data/collections.json`.

Types in `src/types/index.ts`. Categories: `tomb | landmark | cafe | food | homestay | service`. Labels and filter options in `src/data/constants.ts`.

`Place` fields: `id`, `name`, `category`, `tags`, `coverImage`, `gallery`, `address`, `coordinates` (`{lat, lng}`), `rating`, `priceRange` (`₫/₫₫/₫₫₫`), `hours` (`{open, close}`), `vibe`, `description`, `insiderTips[]`; optional: `specialty`, `collection`, `phone`, `website`, `logo`, `reviews` (`Review[]`), `menu` (array of image URLs — cafes/food only, populated from `coffee_menus.csv`). Collections: `Collection[]` (`{id, title, description}`).

`review-places.csv` is a Google Maps scrape used to populate the category JSON files — import it via the `/import-places-data` slash command.

`/import-review-places` to import reviews for the places

### State

Saved-places list lives in `src/hooks/useMyTrip.ts` — reads/writes `localStorage` key `hue-ni-trip` (JSON array of place IDs). The hook is instantiated **once** inside `MyTripProvider` (`src/contexts/MyTripContext.tsx`), which wraps the entire app in `App.tsx`. All consumers (`BottomNav`, `PlaceCard`, `HomePage`, `MyTripPage`, `DetailsPage`) call `useMyTripContext()` — never `useMyTrip()` directly — so bookmark state is shared and updates propagate everywhere (e.g. the BottomNav badge count on `/my-trip`, the gold dot on saved map pins, the bookmark button state in the bottom sheet).

`HomePage` also passes `savedIds` down to `MapView` as a prop (not via context) since MapView is a generic component that doesn't own global state.

Onboarding GPS modal gated by `localStorage` key `hue-ni-onboarded` via `src/utils/onboarding.ts`.

### Map (`src/components/MapView.tsx`)

Vanilla Leaflet (not react-leaflet) managed with `useRef`. Returns a `div.map-view-wrapper` containing the map container and a floating locate button.

Props: `places`, `selectedPlace`, `onSelectPlace`, `sheetOpen?: boolean` (lifts locate button above the bottom sheet when true), `savedIds?: string[]` (drives saved-pin visual state).

Four `useEffect` hooks:
1. **Init once** — creates `L.map`, CartoDB Voyager tiles, Huế bounds `[[16.35, 107.50], [16.55, 107.70]]`, `minZoom: 12`, `maxBoundsViscosity: 0.85`. Also registers `map.on('click', () => onSelectRef.current(null))` so tapping the map background deselects.
2. **Rebuild markers** — fires when `places` prop changes; clears/re-adds `L.marker` instances using `L.divIcon` with emoji HTML
3. **Update icons** — fires when `selectedPlace`, `places`, or `savedIds` changes; calls `marker.setIcon()` and pans map. Saved places show a gold dot badge (`map-pin--saved`) via CSS `::after` on `.map-pin__bubble`.
4. **Callback ref sync** — keeps `onSelectRef.current` fresh each render without triggering effects

The locate button (bottom-right) calls `navigator.geolocation.getCurrentPosition()`, places a pulsing blue `div.map-user-dot` marker via `locationMarkerRef`, and flies to the user's position. Three states: idle / loading (spinner) / error (shake animation).

Tile pane gets `filter: hue-rotate(112deg) saturate(0.6) brightness(0.8)` in `MapView.css` for the green-tinted imperial aesthetic. `isolation: isolate` on `.map-view` contains Leaflet's internal z-index stacking so it doesn't bleed above page UI. Filter chips and locate button use `z-index: 1000` to stay above map panes.

### PlaceCard (`src/components/PlaceCard.tsx`)

Two variants: `vertical` (Heritage list, full-width, 2-line name clamp) and `horizontal` (Home carousel, 200px, single-line truncated name, vibe hidden).

Both variants include a floating bookmark button (top-right of image) that calls `useMyTripContext()` with `e.stopPropagation()` to prevent card navigation. Saved state: filled red bookmark + spring-pop animation. Unsaved: outline bookmark on dark glassmorphic circle.

### Other Components

- **FilterCombobox** (`src/components/FilterCombobox.tsx`) — category dropdown on HomePage with full keyboard navigation (Arrow keys, Escape, Tab) and outside-click dismissal. Uses emoji icons per category.
- **OnboardingModal** — geolocation permission dialog, shown once (gated by `hue-ni-onboarded` localStorage key). Dismissible; handles unsupported geolocation gracefully.
- **ImageGallery** — lazy-loaded image carousel with safe empty-array handling.

### DetailsPage tabs (`src/pages/DetailsPage/index.tsx`)

Three tabs: `tips`, `reviews`, `menu` (defined in `TAB_ORDER`). The menu tab is only surfaced for `cafe` and `food` categories — `visibleTabs` filters it out for other categories, and `effectiveTab` falls back to `visibleTabs[0]` if the stored `activeTab` is no longer visible. The sliding indicator `--tab-index` CSS var is driven by `visibleTabs.findIndex(effectiveTab)`.

### Design System (enforced — see `designs/DESIGN.md`)

Note: `designs/DESIGN.md` describes an Apple-inspired aspirational aesthetic. The **actual implementation** uses a warm "Imperial Huế" palette defined in `src/index.css`:
- Primary: `#7d0010` (deep imperial red), secondary: `#735c00` (gold)
- Background/surface: cream `#fdf6ec`; on-surface text: `#2b1613`
- Fonts: Noto Serif (headings) + Plus Jakarta Sans (body)
- Spacing tokens: `--space-xs` (0.25rem) → `--space-2xl` (3rem)
- Radius tokens: `--radius-sm` (0.5rem) → `--radius-full` (999px)
- Shadows: `--shadow-card` (6% opacity) and `--shadow-floating` (12% opacity)

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

### Deployment

Vercel with SPA catch-all rewrite (`vercel.json`: `/(.*) → /index.html`). No server-side rendering.

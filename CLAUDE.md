# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server with HMR
npm run build     # Type-check (tsc -b) then bundle with Vite
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

## Architecture

This is a React 19 + TypeScript + Vite project (bootstrapped from the official Vite template).

- Entry: `index.html` → `src/main.tsx` → `src/App.tsx`
- Static assets in `public/` (e.g. `icons.svg`, `favicon.svg`) are served at root and referenced via `/` paths in JSX
- Image/SVG assets in `src/assets/` are imported as ES modules
- `@vitejs/plugin-react` uses Oxc for transforms (not SWC)

## App Architecture

- Routing: React Router v7 (`react-router-dom`)
- Static data: `src/data/places.json` (imported directly, no API)
- Images: place in `public/images/<place-id>-cover.jpg`, etc.
- My Trip state: `localStorage` key `hue-ni-trip` via `src/hooks/useMyTrip.ts`
- Tests: Vitest + @testing-library/react (hook logic only). Run: `npm test`

## TypeScript

Two tsconfig scopes: `tsconfig.app.json` (browser/React code) and `tsconfig.node.json` (Vite config). The root `tsconfig.json` references both.

## ESLint

Config is in `eslint.config.js` (flat config format). Currently uses `tseslint.configs.recommended` (not type-aware). To enable type-aware rules, update to `recommendedTypeChecked` and add `parserOptions.project` pointing to both tsconfig files — see README.md for the exact snippet.

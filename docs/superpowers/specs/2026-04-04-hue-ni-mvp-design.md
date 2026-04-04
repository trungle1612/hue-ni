# Hue-ni MVP Design Spec
**Date:** 2026-04-04  
**Scope:** Full frontend MVP with static JSON data (no backend)

---

## 1. Product Overview

A mobile-first travel web app for tourists visiting Huế. Users scan a QR code (at airports, train stations, hotels, cafes) to open the app instantly in their browser — no download required.

**Tech stack:** React 19 + TypeScript + Vite + React Router v6  
**Data:** Static `places.json` (no API calls in this period)  
**Language:** Vietnamese only  
**Personal storage:** `localStorage` (no login)

---

## 2. Navigation Structure

### Bottom Navigation (3 persistent tabs)
| Tab | Label (VI) | Route |
|-----|-----------|-------|
| Home | Trang chủ | `/` |
| Heritage | Di sản | `/heritage` |
| My Trip | Hành trình | `/my-trip` |

The **Details page** (`/details/:id` or `/heritage/:id`) is a full-screen route — it hides the bottom nav and is reached by tapping place cards, not via a tab.

### Routes
```
/ (App Shell — BottomNav + Outlet)
├── /                → HomePage
├── /heritage        → HeritagePage
├── /heritage/:id    → DetailsPage (no bottom nav)
├── /details/:id     → DetailsPage (alias, from Home cards)
└── /my-trip         → MyTripPage
```

---

## 3. Screens

### 3.1 Onboarding Modal
- Overlays the Home screen on first visit
- Dismissed state stored in `localStorage` — shows only once
- Content:
  - Welcome message in Vietnamese (dynamic by QR scan source — static fallback for MVP: "Chào mừng đến Huế")
  - GPS location permission request + "Bỏ qua" (Skip) button
- No language toggle for MVP (Vietnamese only)

### 3.2 Home Page (`/`)
- **Search bar** — filters places by name/tag client-side
- **Category filter chips** — horizontally scrollable: Tất cả · Lăng tẩm · Ẩm thực · Di tích · Dịch vụ · Cafe · Homestay
- **Near Me section** — horizontally swipeable `PlaceCard` list (sorted by `coordinates` proximity if GPS granted, otherwise random order)
- **Curated Collections** — static banners/groupings (e.g. "Buổi sáng tại Huế", "Ẩm thực vỉa hè") defined in `places.json`

### 3.3 Heritage Page (`/heritage`)
- **Category filter chips** — same component as Home
- **Vertical list** of `PlaceCard` components — all places, filterable by category
- Tapping a card navigates to `/heritage/:id`

### 3.4 Details Page (`/details/:id` or `/heritage/:id`)
- **Full-screen, no bottom nav**
- Back button (browser history)
- **Cover image** — large hero from `place.coverImage`
- **Gallery** — horizontally swipeable images from `place.gallery`
- **Info block:** name, vibe/tagline, address, operating hours, price range (`₫` / `₫₫` / `₫₫₫`), rating
- **Insider Tips** — list of bite-sized local tips from `place.insiderTips`
- **Sticky action bar (bottom):**
  - 🧭 Đường đi → deep-links to Google Maps
  - 📌 Lưu / Đã lưu → toggles via `useMyTrip` hook
  - 🔗 Chia sẻ → Web Share API

### 3.5 My Trip Page (`/my-trip`)
- **Empty state** — illustration + prompt to explore when no places saved
- **Saved places list** — pulled from `localStorage` via `useMyTrip`
- Each item has: place name, cover image, 🧭 Đường đi button, ❌ Xóa button
- **"Xóa tất cả" button** at the bottom

---

## 4. Data Layer

### `src/data/places.json` shape
```json
{
  "places": [
    {
      "id": "khai-dinh-tomb",
      "name": "Lăng Khải Định",
      "category": "tomb",
      "tags": ["lăng tẩm", "kiến trúc", "di sản"],
      "coverImage": "/images/khai-dinh-cover.jpg",
      "gallery": [
        "/images/khai-dinh-1.jpg",
        "/images/khai-dinh-2.jpg",
        "/images/khai-dinh-3.jpg"
      ],
      "address": "Khải Định, Hương Thủy, Thừa Thiên Huế",
      "coordinates": { "lat": 16.3943, "lng": 107.6513 },
      "rating": 4.8,
      "priceRange": "₫",
      "hours": { "open": "07:00", "close": "17:30" },
      "vibe": "Kiến trúc Art Deco kết hợp truyền thống — độc nhất vô nhị.",
      "description": "Mô tả chi tiết về địa điểm...",
      "insiderTips": [
        "Đến trước 8h sáng để tránh đám đông.",
        "Hỏi bảo vệ xem phòng tranh khảm trai — thường không mở cho khách."
      ],
      "collection": "echoes-of-dynasty"
    }
  ],
  "collections": [
    {
      "id": "echoes-of-dynasty",
      "title": "Vọng âm triều đại",
      "description": "Những công trình định nghĩa cố đô"
    }
  ]
}
```

### Categories
`tomb` | `landmark` | `cafe` | `food` | `homestay` | `service`

### Image assets
Static images placed in `public/images/` — served at `/images/*` paths.

---

## 5. Component Architecture

```
src/
├── data/
│   └── places.json
├── types/
│   └── index.ts          ← Place, Category, Collection types
├── hooks/
│   └── useMyTrip.ts      ← add/remove/clear/isSaved via localStorage
├── components/
│   ├── BottomNav.tsx
│   ├── PlaceCard.tsx     ← shared by Home + Heritage
│   ├── CategoryFilter.tsx
│   ├── OnboardingModal.tsx
│   └── ImageGallery.tsx  ← horizontal swipe gallery for Details
├── pages/
│   ├── HomePage.tsx
│   ├── HeritagePage.tsx
│   ├── DetailsPage.tsx
│   └── MyTripPage.tsx
└── App.tsx               ← Router setup + layout shell
```

### `useMyTrip` hook API
```ts
const { savedIds, addPlace, removePlace, clearAll, isSaved } = useMyTrip()
```
Persists an array of place IDs to `localStorage` key `hue-ni-trip`.

---

## 6. Design System

Follows **"The Imperial Chronicler"** design spec (`designs/DESIGN.md`):
- **Colors:** Imperial Red `#7d0010`, Royal Gold `#735c00` / `#ffe088`, Dark Wood `#5e2b34`
- **Typography:** Noto Serif (headings) + Plus Jakarta Sans (body/labels)
- **No 1px borders** — use tonal background shifts
- **Glassmorphism** for floating nav elements (`surface` at 70% opacity + `backdrop-filter: blur(20px)`)
- **Corner radius:** `xl` (1.5rem) — "Imperial Arch" signature
- **Shadows:** diffused, warm-tinted `rgba(43,22,19,0.06)`

---

## 7. CLAUDE.md Updates Required
- Add `react-router-dom` to dependencies
- Note that static images go in `public/images/`
- Note that static data lives in `src/data/places.json`

---

## 8. Out of Scope (this period)
- Backend / Ruby on Rails API
- Real map integration (Leaflet/MapBox)
- Bilingual support (VN/EN toggle)
- GPS-based distance sorting (coordinates stored but not used for sorting yet)
- Context-aware QR scan greeting (static welcome message only)

# DukaSearch ⚡
> Hyper-local market discovery mobile app for Kampala trade items (Owino, Nakasero, Ndeeba, Katwe, Kikuubo) powered by Flutter, Node.js/Express, Firebase Cloud Firestore, and Typesense.

---

## 🏛 System Architecture & Data Flow

```text
┌────────────────────────────────────────────────────────┐
│                   DukaSearch Mobile                     │
│               (Flutter + Riverpod)                     │
│                                                        │
│  [Sunken Search Bar]            [Vendor Add Product]   │
└────────────┬─────────────────────────────┬─────────────┘
             │ <5ms Read/Search            │ Write / Auth
             │ (Scoped Search-Only Key)    │ (Firebase Token)
             ▼                             ▼
┌───────────────────────────┐  ┌─────────────────────────┐
│     Typesense Cloud       │  │  Node.js + Express API  │
│  (Instant In-Memory Index)│  │ (Firebase Admin SDK)    │
└────────────▲──────────────┘  └───────────┬─────────────┘
             │                             │
             │ Real-Time Dual-Write Sync   │ Persist Document
             └─────────────────────────────┴─────────────┐
                                                         ▼
                                               ┌──────────────────┐
                                               │ Firebase Cloud   │
                                               │ Firestore DB     │
                                               │ (/duka_items)    │
                                               └──────────────────┘
```

---

## 🎨 Design System: "Violet Dusk Neumorphism"
- **Primary Background**: `#1E1B2E` (Deep Dusk Violet)
- **Top-Left Light Shadow**: `#2A2640` (Soft Lavender Tint)
- **Bottom-Right Dark Shadow**: `#12101C` (Midnight Shadow)
- **Accents**: `#9D4EDD` (Radiant Electric Purple) & `#00F5D4` (Cyan Glow)
- **Primary Text**: `#FFFFFF` (Pure High-Contrast White)
- **Secondary Text**: `#A09ABC` (Muted Violet Gray)

---

## 📂 Project Structure
- `/backend`: Node.js + Express API server syncing Firestore and Typesense
  - `src/app.js`: Express routes (`/health`, `POST /api/items`, `DELETE /api/items/:id`)
  - `src/config/typesense.js`: Typesense client & schema initialization
  - `src/config/firebase.js`: Firebase Admin SDK initialization
  - `src/controllers/itemController.js`: Firestore & Typesense sync logic
  - `scripts/seed.js`: 15 realistic Kampala market trade items seeder
- `/mobile`: Flutter client application
  - `lib/theme/neumorphic_theme.dart`: Color palette & typography
  - `lib/widgets/neumorphic_container.dart`: Reusable raised & sunken 3D container
  - `lib/services/typesense_search_service.dart`: Typesense search client (<5ms instant search)
  - `lib/screens/duka_search_home_screen.dart`: Complete Neumorphic UI with live search & facet chips
  - `lib/main.dart`: Flutter entry point
- `/src`: Live interactive companion simulator & architectural explorer (Vite + React + Tailwind)

---

## 🚀 Quick Start

### 1. Backend
```bash
cd backend
npm install
npm run seed  # Seeds 15 Kampala market items
npm run dev   # Starts API server on port 5000
```

### 2. Mobile (Flutter)
```bash
cd mobile
flutter pub get
flutter run
```

### 3. Interactive Web Simulator
```bash
npm install
npm run dev
```

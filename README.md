# DukaSearch

Hyper-local market discovery platform for Kampala trade items. DukaSearch indexes products from Owino, Nakasero, Ndeeba, Kikuubo, Katwe, and other Kampala trading centers, and serves sub-5-millisecond instant search through Typesense.

## Architecture

```
+-------------------------+        search-only key        +------------------+
| Flutter mobile client   | ---------------------------> | Typesense Cloud  |
| (Riverpod + Neumorphic) |                              | in-memory index  |
+-----------+-------------+                              +--------+---------+
            | write / auth (Firebase ID token)                    ^
            v                                                    |
+-------------------------+        dual write         +----------+---------+
| Node.js + Express API   | -----------------------> | Firebase Firestore |
| Firebase Admin SDK      |   Firestore + Typesense  | /duka_items        |
+-------------------------+                          +--------------------+
```

- Source of truth: Firebase Cloud Firestore (`/duka_items`).
- Data processing layer: Node.js + Express with Firebase Admin SDK and Typesense Node SDK.
- Client layer: Flutter talks directly to Typesense Cloud using a scoped search-only API key for instant search.
- Write and vendor operations go through the Express backend using Firebase Auth tokens.

## Repository layout

```
backend/   Node.js + Express API, Firestore and Typesense sync, seed script
mobile/    Flutter client with Violet Dusk Neumorphic UI
src/       Interactive web companion (Vite + React + Tailwind)
```

## Quick start

### Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your Firebase and Typesense credentials
npm run seed
npm run dev
```

The API listens on `http://localhost:5000`. Endpoints:

- `GET /health`
- `GET /api/items`
- `GET /api/items/:id`
- `POST /api/items` (requires Firebase ID token when `REQUIRE_AUTH=true`)
- `PUT /api/items/:id`
- `PATCH /api/items/:id`
- `DELETE /api/items/:id`

### Mobile (Flutter)

```bash
cd mobile
flutter pub get
flutter run
```

Optional runtime configuration:

```bash
flutter run \
  --dart-define=TYPESENSE_HOST=your-typesense-host \
  --dart-define=TYPESENSE_PORT=443 \
  --dart-define=TYPESENSE_PROTOCOL=https \
  --dart-define=TYPESENSE_SEARCH_KEY=your-search-only-key
```

### Web companion

```bash
npm install
npm run dev
```

## Design system: Violet Dusk Neumorphism

- Background: `#1E1B2E`
- Light shadow (top-left): `#2A2640`
- Dark shadow (bottom-right): `#12101C`
- Accent purple: `#9D4EDD`
- Accent cyan: `#00F5D4`
- Primary text: `#FFFFFF`
- Secondary text: `#A09ABC`

Neumorphic containers use dual box-shadows at `(-6, -6)` and `(6, 6)` with `BorderRadius.circular(20)`.

## Environment variables

See `backend/.env.example` for the full list. Key variables:

- `PORT`, `NODE_ENV`, `CORS_ORIGIN`
- `TYPESENSE_HOST`, `TYPESENSE_PORT`, `TYPESENSE_PROTOCOL`
- `TYPESENSE_ADMIN_API_KEY` (backend only, never ship to clients)
- `TYPESENSE_SEARCH_ONLY_API_KEY` (scoped search-only key for mobile clients)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_SERVICE_ACCOUNT_PATH`
- `REQUIRE_AUTH` (set to `true` in production)

## Commit protocol

Each file is committed independently so the history mirrors the build steps:

1. `chore(backend): initialize Node.js environment and dependencies`
2. `feat(backend): configure Typesense client and schema collection`
3. `feat(backend): add Firebase Admin initialization and auth middleware`
4. `feat(backend): implement Express API endpoints for Firestore and Typesense sync`
5. `chore(backend): add database seed script for local market items`
6. `chore(mobile): add Flutter dependencies for Typesense and UI components`
7. `style(mobile): implement Violet Dusk Neumorphic theme and container widget`
8. `feat(mobile): integrate Typesense search service with instant-search and faceted filtering`
9. `feat(mobile): build DukaSearch Neumorphic home screen with live search UI`
10. `chore(mobile): add app entrypoint and Riverpod search providers`
11. `docs: document DukaSearch setup, architecture, and environment variables`

## License

Apache-2.0

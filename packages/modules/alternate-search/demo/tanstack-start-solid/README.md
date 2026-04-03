# TanStack Start Solid demo

TanStack Solid Start API route demo using `toTanStackSolidHandler`.

## Files

- `app/lib/server/search.ts`: search setup + seed
- `app/routes/api.search.$index.ts`: API file route wiring

## Setup

1. Install:
   - `npm i alternate-search`
2. Copy files into your TanStack Solid Start app.
3. Run:
   - `npm run dev`

## Try

- `GET /api/search/products?q=shoes`
- `GET /api/search/products?_action=stats`
- `POST /api/search/products` with `{ "q": "trail" }`

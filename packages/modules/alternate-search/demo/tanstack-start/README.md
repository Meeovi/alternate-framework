# TanStack Start (React) demo

TanStack Start API route demo using `toTanStackHandler`.

## Files

- `app/lib/server/search.ts`: search instance + sample data
- `app/routes/api.search.$index.ts`: TanStack API file route

## Setup

1. Install:
   - `npm i alternate-search`
2. Copy files into your TanStack Start React app.
3. Run:
   - `npm run dev`

## Try

- `GET /api/search/products?q=shoes`
- `GET /api/search/products?_action=stats`
- `POST /api/search/products` with `{ "q": "trail" }`

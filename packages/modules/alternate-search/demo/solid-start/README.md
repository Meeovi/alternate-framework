# SolidStart demo

SolidStart API route demo using `toSolidStartHandler`.

## Files

- `src/lib/server/search.ts`: creates in-memory search and seeds data
- `src/routes/api/search/[index].ts`: endpoint handlers for GET/POST/DELETE/OPTIONS

## Setup

1. Install:
   - `npm i alternate-search`
2. Copy files into your SolidStart project.
3. Run:
   - `npm run dev`

## Try

- `GET /api/search/products?q=shoes`
- `GET /api/search/products?_action=stats`
- `POST /api/search/products` with `{ "q": "trail" }`

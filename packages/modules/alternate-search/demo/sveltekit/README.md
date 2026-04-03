# SvelteKit demo

SvelteKit endpoint demo using `toSvelteKitHandler`.

## Files

- `src/lib/server/search.ts`: search setup + seed
- `src/routes/api/search/[index]/+server.ts`: endpoint handlers

## Setup

1. Install:
   - `npm i alternate-search`
2. Copy files into your SvelteKit project.
3. Run:
   - `npm run dev`

## Try

- `GET /api/search/products?q=shoes`
- `GET /api/search/products?_action=stats`
- `POST /api/search/products` with `{ "q": "trail" }`

# Nuxt demo

Nuxt server route demo using `defineSearchEventHandler`.

## Files

- `lib/search.ts`: creates and seeds in-memory search
- `server/routes/search/[index].ts`: binds Nuxt route to alternate-search

## Setup

1. Install:
   - `npm i alternate-search`
2. Copy files into your Nuxt project.
3. Run:
   - `npm run dev`

## Try

- `GET /search/products?q=shoes`
- `GET /search/products?_action=stats`
- `POST /search/products` with `{ "q": "trail" }`

## Notes

This demo uses path `/search/:index`. You can move the route file if you want `/api/search/:index`.

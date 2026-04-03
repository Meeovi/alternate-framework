# Next.js App Router demo

Route handler demo using `toNextJsHandler`.

## Files

- `lib/search.ts`: in-memory `SearchInstance` and one-time seed helper
- `app/api/search/[index]/route.ts`: exports `GET`, `POST`, `DELETE`, `OPTIONS`

## Setup

1. Install:
   - `npm i alternate-search`
2. Copy files into your Next.js app, preserving paths.
3. Start app:
   - `npm run dev`

## Try

- `GET /api/search/products?q=shoes`
- `GET /api/search/products?_action=stats`
- `POST /api/search/products` with `{ "q": "sneakers" }`

## Notes

If your project path aliases differ, adjust the import in `route.ts`.

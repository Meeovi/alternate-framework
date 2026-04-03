# Node demo

Minimal Node.js HTTP server using `toNodeHandler`.

## Files

- `search.ts`: creates `SearchInstance` with `memoryAdapter`
- `server.ts`: mounts `toNodeHandler(search)` at `/api/search`
- `production.ts`: example wiring for PostHog, Segment, OpenTelemetry, JSONL or CSV logging, and Redis-backed caching with targeted invalidation hooks

## Run

1. Install dependencies in your app:
   - `npm i alternate-search`
2. Run:
   - `tsx demo/node/server.ts`

## Test endpoints

- `GET http://localhost:3000/api/search/products?q=shoes`
- `GET http://localhost:3000/api/search/products?_action=stats`
- `POST http://localhost:3000/api/search/products` with body `{ "q": "keyboard" }`

## Notes

If you mount at a different path, update `basePath` in `toNodeHandler`.

For production wiring examples, see `production.ts` in this directory.

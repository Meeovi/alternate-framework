# alternate-search framework demos

This directory contains end-to-end integration demos for every framework adapter available in [integrations](../integrations).

## Included demos

- [node](./node/README.md)
- [next-js](./next-js/README.md)
- [nuxt](./nuxt/README.md)
- [sveltekit](./sveltekit/README.md)
- [solid-start](./solid-start/README.md)
- [tanstack-start](./tanstack-start/README.md)
- [tanstack-start-solid](./tanstack-start-solid/README.md)

## Shared API contract

Each demo exposes the same REST surface:

- `GET /api/search/:index?q=...` search with query params
- `GET /api/search/:index?_action=stats` index stats
- `POST /api/search/:index` search with JSON body
- `POST /api/search/:index?_action=index` bulk index documents
- `DELETE /api/search/:index?id=<docId>` delete one document

Nuxt uses `/search/:index` by default in the examples.

## Demo documents

All demos seed the same sample index named `products` with a small in-memory catalog.

## Smoke test script

Use [smoke-test.sh](./smoke-test.sh) to verify all five route shapes quickly.

Default:

```bash
./demo/smoke-test.sh
```

NPM script shortcut (from module root):

```bash
npm run demo:smoke
```

Nuxt demo route prefix:

```bash
ROUTE_PREFIX=/search ./demo/smoke-test.sh
```

Nuxt npm script shortcut:

```bash
npm run demo:smoke:nuxt
```

Custom host/port:

```bash
BASE_URL=http://localhost:8787 ./demo/smoke-test.sh
```

The script checks:

- `GET /:index?q=...`
- `GET /:index?_action=stats`
- `POST /:index` (SearchQuery body)
- `POST /:index?_action=index` (bulk index)
- `DELETE /:index?id=<docId>`

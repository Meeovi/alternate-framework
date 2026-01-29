<!-- packages/search/README.md -->
# @meeovi/search

A modular, provider-agnostic search layer for the Alternate Framework. It provides a unified, typed search API with pluggable adapters (Meilisearch, OpenSearch, mock adapters), lightweight bridges for UI integrations (InstantSearch / Searchkit), a small CLI for indexing/warmup, and event hooks.

## Features

- Plug-and-play adapters (Meilisearch, OpenSearch, Mock)
- Fully typed integration with `@meeovi/core`
- Mock adapter for tests
- Small CLI for indexing and warmup
- Configuration validation and event hooks (`search:query`, `search:results`)

## Installation

Using npm:

```bash
npm install @meeovi/search
```

Using pnpm:

```bash
pnpm add @meeovi/search
```

## Quick Usage

Register the module with an Alternate app:

```ts
import { createAlternateApp } from '@meeovi/core'
import searchModule from '@meeovi/search'

const app = createAlternateApp({
  config: {
    search: {
      defaultProvider: 'meilisearch',
      providers: {
        meilisearch: {
          host: 'http://localhost:7700',
          index: 'products',
          apiKey: 'masterKey'
        }
      }
    }
  },
  modules: [searchModule]
})

await app.start()

// After app startup you can access the registered `search` adapter via the runtime
const searchAdapter = app.context.getAdapter('search')
if (searchAdapter) {
  const results = await searchAdapter.search({ term: 'shoes', page: 1, pageSize: 10 })
  console.log(results.items)
}
```

## Adapters

Meilisearch adapter:

```ts
import { createMeilisearchAdapter } from '@meeovi/search'

const adapter = createMeilisearchAdapter({
  host: 'http://localhost:7700',
  index: 'products',
  apiKey: 'masterKey'
})
```

OpenSearch adapter:

```ts
import { createOpenSearchAdapter } from '@meeovi/search'

const adapter = createOpenSearchAdapter({
  endpoint: 'https://my-opensearch.com',
  index: 'products',
  apiKey: 'secret'
})
```

Mock adapter (for testing):

```ts
import { createMockSearchAdapter } from '@meeovi/search'

const mock = createMockSearchAdapter([
  { id: '1', title: 'Red Shoes' },
  { id: '2', title: 'Blue Shirt' }
])

const results = await mock.search({ term: 'red', page: 1, pageSize: 10 })
```

## Configuration

Example `search` config in your app:

```json
{
  "search": {
    "defaultProvider": "opensearch",
    "providers": {
      "opensearch": {
        "endpoint": "https://my-opensearch.com",
        "index": "products"
      }
    }
  }
}
```

The module validates that `defaultProvider` and the referenced provider configuration exist, and that required fields for each adapter are present.

Note: this repository includes a top-level `.env.example` with recommended variables for Search and other providers; you can manage layer credentials from your main app's `.env` file. See `../.env.example`.

## UI Integrations (InstantSearch / Searchkit)

This layer includes bridges that let UI code use Algolia InstantSearch or Searchkit clients without coupling the UI to a particular backend provider. Use `createInstantSearchBridge` / `createSearchkitBridge` on the client, and `createSearchkitGraphQLHandler` on the server when exposing a GraphQL endpoint for Searchkit-server.

Example (client):

```ts
import { createInstantSearchBridge } from '@meeovi/search'
// `manager` is the `SearchManager` instance available on the app context
const bridge = createInstantSearchBridge(manager)

const instantsearchClient = {
  search(requests) {
    return bridge.searchFunction({ state: requests[0].params, setResults: () => {} })
  }
}
```

Example (server - Express):

```ts
import express from 'express'
import { createSearchkitGraphQLHandler } from '@meeovi/search'

const app = express()
app.use(express.json())
app.post('/graphql', createSearchkitGraphQLHandler(manager))
```

These bridges map InstantSearch/Searchkit request shapes into the layer's `SearchManager` and underlying adapters so UI code doesn't need to change when you swap search providers.

## Events

This module emits bus events that you can listen to:

```ts
bus.on('search:query', ({ term }) => {
  console.log('User searched for:', term)
})

bus.on('search:results', ({ term, total }) => {
  console.log(`Search for "${term}" returned ${total} results`)
})
```

## CLI

Included CLI commands:

- Warmup: `meeovi-search warmup`
- Index a JSON file: `meeovi-search index ./products.json`

Environment variables supported (example for Meilisearch):

- `SEARCH_PROVIDER=meilisearch`
- `MEILI_HOST=http://localhost:7700`
- `MEILI_INDEX=products`
- `MEILI_KEY=masterKey`

Searchkit / Search provider environment variables

- `SEARCHKIT_HOST` or `NUXT_PUBLIC_SEARCHKIT_HOST` — full host URL (e.g. `https://search.example.com`)
- Alternatively compose with:
  - `SEARCHKIT_PROTOCOL` / `NUXT_PUBLIC_SEARCHKIT_PROTOCOL` (defaults to `http`)
  - `SEARCHKIT_HOSTNAME` / `NUXT_PUBLIC_SEARCHKIT_HOSTNAME` (e.g. `search.example.com`)
  - `SEARCHKIT_PORT` / `NUXT_PUBLIC_SEARCHKIT_PORT` (e.g. `9200`)
- Optional API key: `SEARCHKIT_API_KEY` or `NUXT_PUBLIC_SEARCHKIT_API_KEY`

Notes:
- Use the `NUXT_PUBLIC_` prefix for values that must be available in client-side code (public build). Keep API keys server-only when possible.
- The plugin logs a runtime validation message on startup if search provider configuration is missing, with examples of env vars to set.

Layer env conventions

- All layers use the same environment lookup convention: the code checks `KEY` and falls back to `NUXT_PUBLIC_KEY` when appropriate. This lets you manage provider credentials and endpoints centrally from your main application's `.env` file.
- Example `.env` entries in your main app to configure the Search layer:

```
SEARCHKIT_HOST=https://search.example.com
SEARCHKIT_API_KEY=server-only-key
# or compose:
SEARCHKIT_PROTOCOL=https
SEARCHKIT_HOSTNAME=search.example.com
SEARCHKIT_PORT=9200
```

Because every layer follows this `KEY` / `NUXT_PUBLIC_KEY` pattern, you can place settings in the main app's `.env` and they will be available to the layer at runtime without editing layer files.

## Testing

Use the mock adapter in tests to avoid external dependencies:

```ts
import { createMockSearchAdapter } from '@meeovi/search'

const mock = createMockSearchAdapter([{ id: '1', title: 'Test Product' }])
const results = await mock.search({ term: 'test' })
```

## File structure

Typical layout:

```
@meeovi/search
├─ src/
│  ├─ index.ts
│  ├─ module.ts
│  ├─ adapter/
│  │  ├─ opensearch.ts
│  │  ├─ meilisearch.ts
│  │  ├─ mock.ts
│  │  └─ types.ts
│  ├─ config/schema.ts
│  ├─ events.ts
│  └─ utils/normalizers.ts
├─ cli.ts
├─ package.json
└─ README.md
```

## License

MIT

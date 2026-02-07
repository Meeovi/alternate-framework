<!-- packages/search/README.md -->
# @mframework/layer-search

A modular, provider-agnostic search layer for the M Framework. It provides a unified, typed search API with pluggable adapters (Meilisearch, OpenSearch, mock adapters), lightweight bridges for UI integrations (InstantSearch / Searchkit), a small CLI for indexing/warmup, and event hooks.

## Features

- Plug-and-play adapters (Meilisearch, OpenSearch, Mock)
- Fully typed integration with `@mframework/core`
- Mock adapter for tests
- Small CLI for indexing and warmup
- Configuration validation and event hooks (`search:query`, `search:results`)

## Installation

Using npm:

```bash
npm install @mframework/layer-search
```

Using pnpm:

```bash
pnpm add @mframework/layer-search
```

## Quick Usage

Register the module with an M Framework app:

```ts
import { createM FrameworkApp } from '@mframework/core'
import searchModule from '@mframework/layer-search'

const app = createM FrameworkApp({
  config: {
    search: {
      defaultProvider: 'opensearch',
      providers: {
        opensearch: {
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

Adapters are intentionally provider-agnostic and may be supplied by external packages or by your application.
The core `@mframework/layer-search` layer does not bundle provider implementations; instead provide an adapter instance at startup
or register one at runtime so the search manager can be created.

Example (external adapter package or custom implementation):

```ts
// import from an external adapter package or your own implementation
import { createMySearchAdapter } from 'my-search-adapter-package' /* @mframework/adapter-opensearch */

const adapter = createMySearchAdapter({ /* provider config */ })
```

Register the adapter either when creating the M Framework app or at runtime (both shown below).

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
import { createInstantSearchBridge } from '@mframework/layer-search'
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
import { createSearchkitGraphQLHandler } from '@mframework/layer-search'

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

**Registering external adapters**

There are two common ways to register a search adapter so the search layer can use it:

- Module-based (recommended at startup): create a small provider module that exposes the adapter via the module `adapters` property. The module registry will register the adapter before modules run.

```ts
import { createM FrameworkApp } from '@mframework/core'
import searchModule from '@mframework/layer-search'
import { createMySearchAdapter } from 'my-search-adapter-package' /* @mframework/adapter-opensearch */

const myProviderModule = {
  id: 'search-provider-my',
  adapters: {
    search: createMySearchAdapter({ /* config */ })
  }
}

const app = createM FrameworkApp({
  config: { /* ... */ },
  modules: [searchModule, myProviderModule]
})

await app.start()
```

- Runtime registration: register an adapter into the core module registry at runtime. This is useful for registering adapters from other modules or dynamic initialization.

```ts
import { createM FrameworkApp } from '@mframework/core'
import searchModule from '@mframework/layer-search'
import { createMySearchAdapter } from 'my-search-adapter-package' /* @mframework/adapter-opensearch */

const app = createM FrameworkApp({ modules: [searchModule] })

// register adapter before or after `app.start()`
app.context.modules.registerAdapter('search', createMySearchAdapter({ /* config */ }))

await app.start()
```

Notes:

- Many layers adopt a convention of emitting `adapter:registered` events; the search layer listens for adapter registrations and will initialize its `SearchManager` when a `search` adapter becomes available.
- If you publish adapters, prefer a small package such as `@your-org/adapter-mysearch` that exports a `createMySearchAdapter` factory so consumers can import and register it using one of the patterns above.


## CLI

Included CLI commands:

- Warmup: `meeovi-search warmup`
- Index a JSON file: `meeovi-search index ./products.json`

Environment variables supported (example for Meilisearch):

- `SEARCH_PROVIDER=opensearch`
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
import { createMockSearchAdapter } from '@mframework/layer-search'

const mock = createMockSearchAdapter([{ id: '1', title: 'Test Product' }])
const results = await mock.search({ term: 'test' })
```

## File structure

Typical layout:

```
@mframework/layer-search
├─ src/
│  ├─ index.ts
│  ├─ module.ts
│  ├─ adapter/
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

<!-- packages/search/README.md -->
# @meeovi/search

A modular, provider-agnostic search module for the Alternate Framework. It provides a unified, typed search API with pluggable adapters (Meilisearch, OpenSearch, mock adapters), a small CLI for indexing/warmup, and event hooks.

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

const search = app.context.getAdapter('search')
const results = await search.search({ term: 'shoes' })
console.log(results.items)
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

const results = await mock.search({ term: 'red' })
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

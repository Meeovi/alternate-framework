# adapter-opensearch

OpenSearch adapter package that provides two integration styles:

- `createOpenSearchAdapter(opts)` — a server-side, direct OpenSearch client adapter implementing the core `SearchAdapter` interface.
- `createStarterSearchAdapter(transport)` — a starter-style adapter that adapts a `TransportAdapter` (for registering via the starter-adapter pattern).

Usage (direct registration):

```ts
import { createOpenSearchAdapter } from 'adapter-opensearch'
import searchModule from '@mframework/layer-search'

const myProviderModule = {
  id: 'search-provider-opensearch',
  adapters: {
    search: createOpenSearchAdapter({ id: 'opensearch', index: 'products' })
  }
}

const app = createM FrameworkApp({ modules: [searchModule, myProviderModule] })
await app.start()
```

Usage (starter/transport registration):

```ts
import { createStarterSearchAdapter } from 'adapter-opensearch'
import { createStarterTransport } from '@mframework/starter-adapter'

const transport = createStarterTransport({ baseUrl: 'https://api.myapp.com' })
const adapter = createStarterSearchAdapter(transport)

// register into core module registry
app.context.modules.registerAdapter('search', adapter)
```

Notes:

- `createOpenSearchAdapter` uses the OpenSearch JS client and reads `ALTERNATE_SEARCH_*` env vars as defaults. You can override `index` via options.
- `createStarterSearchAdapter` lets you plug the adapter into environments that use a `TransportAdapter` (e.g., serverless functions or a separate API layer).

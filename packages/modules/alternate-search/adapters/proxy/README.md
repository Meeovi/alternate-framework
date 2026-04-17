# Proxy Adapter Factory

The proxy adapter factory keeps `alternate-search` as the single middleware boundary between frontend clients and backend search engines.

Use `multiBackendProxyAdapter()` to build a single server-side adapter from backend presets in `adapters/`:

```ts
import { createSearch, multiBackendProxyAdapter } from "@mframework/alternate-search";

const adapter = multiBackendProxyAdapter({
  backends: [
    {
      kind: "elasticsearch",
      id: "primary-es",
      config: {
        baseUrl: process.env.ALTERNATE_SEARCH_ELASTICSEARCH_URL!,
        username: process.env.ALTERNATE_SEARCH_ELASTICSEARCH_USER,
        password: process.env.ALTERNATE_SEARCH_ELASTICSEARCH_PASSWORD,
      },
      priority: 10,
      weight: 100,
      optional: false,
    },
    {
      kind: "meilisearch",
      id: "fast-fallback",
      config: {
        baseUrl: process.env.ALTERNATE_SEARCH_MEILISEARCH_URL!,
        apiKey: process.env.ALTERNATE_SEARCH_MEILISEARCH_KEY,
      },
      priority: 20,
      weight: 70,
      optional: true,
    },
  ],
  aggregationStrategy: "merge",
  parallel: true,
});

const search = createSearch({
  adapter,
  indexes: {
    products: { fields: ["id", "title", "description"] },
  },
});
```

Notes:
- Backend credentials remain server-side.
- Frontend only calls your proxy route (for example `/api/search/:index`).
- Backends can run in parallel through the multi-backend adapter.
- You can include custom adapters with `kind: "custom"`.

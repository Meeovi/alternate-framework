# layers/search

Federated search layer: fans a single query out to every enabled search
backend in parallel and merges the results into one response, ranked by
normalized relevance. Ships an InstantSearch-based UI (search bar, results
grid, filters) that talks to that merged endpoint over HTTP, so the frontend
never knows or cares which backend(s) actually served a given result.

## How it works

```
InstantSearch widgets (app/components/*)
        │  vue-instantsearch searchClient
        ▼
useSearchClient() (app/composables/useSearchClient.ts)
        │  POST /api/search, POST /api/search/facet-values
        ▼
server/api/search.ts, server/api/search/facet-values.post.ts
        │
        ▼
federatedSearch() / federatedSearchFacetValues() (server/search/federate.ts)
        │  every enabled provider queried in parallel, each with a timeout
        ▼
server/providers/{opensearch,postgres,mysql,...}.ts, plus plugin providers
(server/search/registry.ts)
        │  each translates the shared SearchProviderOptions into its own
        │  query language and normalizes its response back
        ▼
OpenSearch / Postgres (incl. Supabase) / MySQL
```

- **`server/providers/types.ts`** — the contract every backend implements
  (`SearchProvider`). A provider takes `SearchProviderOptions` (query, page,
  facets, InstantSearch-shaped filters, sort) and returns a
  `ProviderSearchResult` (normalized hits, total, facets, timing).
- **`server/search/federate.ts`** — queries the built-in providers and every
  provider a plugin registered (`server/search/registry.ts`) whose
  `isEnabled()` returns true. It tolerates individual providers failing, stops
  waiting for one after its timeout (`ALTERNATE_SEARCH_PROVIDER_TIMEOUT_MS`,
  default 5000 ms, or the provider's own `timeoutMs`) and reports it in
  `backends[]`, then
  normalizes each provider's relevance score onto a comparable 0–1 scale, and
  interleaves the results into one globally-sorted, paginated list. See the
  file header comment for the pagination/depth-cap tradeoff of federating
  independently-ranked backends.
- **`nuxt.config.ts`** — `runtimeConfig.searchProviders` is the single place
  backend connection config lives. **A provider is enabled purely by the
  presence of its connection config** — no explicit on/off flag to
  remember. Any combination of backends can be active at once (OpenSearch
  alone, OpenSearch + Postgres/Supabase, all three, etc.) with zero code
  changes, just env vars.

## Backends

### OpenSearch

The primary/default backend. Configured via `ALTERNATE_SEARCH_*` env vars
(`ALTERNATE_SEARCH_HOST`, `_PORT`, `_AUTH`, `_PROTOCOL`, `_CA_CERTS_PATH`).
Enabled unless `ALTERNATE_SEARCH_OPENSEARCH_ENABLED=false`.

### Postgres / Supabase

Supabase *is* Postgres, so one provider (`server/providers/postgres.ts`)
covers both — nothing Supabase-specific is needed. It builds a `tsvector`
inline from the configured search columns on every query (weighted by column
order), so no schema migration is required to get started; for large tables,
add a generated `tsvector` column with a GIN index over the same expression
for better performance — the query shape stays the same.

Connection string, in priority order:

1. `ALTERNATE_SEARCH_PG_URL` — set this to point search at a *different*
   Postgres/Supabase database than the app's primary one.
2. `NUXT_DATABASE_URL` — reused automatically so apps that already configure
   Postgres/Supabase for their ORM (Prisma, Drizzle, ...) don't need to
   duplicate the connection string just to turn search on.
3. `DATABASE_URL`.

The provider is enabled as soon as any of the three resolves to a non-empty
string. SSL is forced on automatically when the resolved connection string
contains `supabase` (override with `ALTERNATE_SEARCH_PG_SSL`).

| Env var                        | Default               | Notes |
|---------------------------------|------------------------|-------|
| `ALTERNATE_SEARCH_PG_URL`       | *(falls back, above)* | Postgres/Supabase connection string |
| `ALTERNATE_SEARCH_PG_SSL`       | auto (`require` for Supabase hosts) | Set to force/disable SSL |
| `ALTERNATE_SEARCH_PG_TABLE`     | `products`             | Table to search |
| `ALTERNATE_SEARCH_PG_ID_COLUMN` | `id`                   | Column used as the hit's stable id |
| `ALTERNATE_SEARCH_PG_COLUMNS`   | `title,description`    | Comma-separated columns to build the `tsvector` from — **must match your actual schema**, the default is a generic placeholder |

For example, `apps/ecosystem/meeovi-frontend` reuses `NUXT_DATABASE_URL` for
the connection and only needs to override the column list, since its
`products` table uses `name`/`content` rather than the generic
`title`/`description` default:

```bash
ALTERNATE_SEARCH_PG_TABLE=products
ALTERNATE_SEARCH_PG_ID_COLUMN=id
ALTERNATE_SEARCH_PG_COLUMNS=name,content
```

### MySQL

`server/providers/mysql.ts`, enabled by `ALTERNATE_SEARCH_MYSQL_URL`. Prefers
native `FULLTEXT` search (`MATCH ... AGAINST`) and falls back to a
`LIKE`-based scan automatically if the configured columns have no `FULLTEXT`
index (MySQL error 1191), remembered per-table so it doesn't retry-and-fail
on every request.

| Env var                            | Default            |
|--------------------------------------|---------------------|
| `ALTERNATE_SEARCH_MYSQL_URL`         | *(unset = disabled)* |
| `ALTERNATE_SEARCH_MYSQL_TABLE`       | `products`         |
| `ALTERNATE_SEARCH_MYSQL_ID_COLUMN`   | `id`                |
| `ALTERNATE_SEARCH_MYSQL_COLUMNS`     | `title,description` |

### Directus

`server/providers/directus.ts` queries Directus live with its built-in `search`
parameter, so newly published content is searchable immediately (no sync or
index). It is **off unless the app enables it**, because every app's Directus
has different collections. List them in the app's `nuxt.config.ts`:

```ts
runtimeConfig: {
  searchProviders: {
    directus: {
      enabled: true,
      collections: [
        // path: the in-app link for a hit ({slug} / {id} filled from the row)
        { collection: 'characters', type: 'character', titleField: 'name',
          descriptionField: 'description', imageField: 'image', path: '/characters/{slug}' },
        // statusField: null for collections without a `status` field
        { collection: 'categories', type: 'category', titleField: 'name', statusField: null,
          path: '/characters/category/{slug}' },
      ],
    },
  },
},
```

Without `collections` it searches Meeovi's `spaces` / `posts` / `shops`. Rows
whose status is draft/archived/hidden/deleted/... (any casing) are excluded.
Hits are ranked by title match (exact > prefix > contains > text-only). The URL
comes from `runtimeConfig.public.directus.url`; the token from the server-only
`runtimeConfig.directus.token` when set, otherwise Directus's public role is
used. `ALTERNATE_SEARCH_DIRECTUS_ENABLED=true` also enables it.

## Adding a new backend

Backend-specific providers ship with their plugin, not in this layer:
Algolia, Meilisearch and Typesense (`packages/plugins/Search/search-*`),
Magento (adapter-magento) and AT Protocol (meeovi-atproto). A new backend is
a plugin too:

1. **Implement `SearchProvider`**: `id`, `isEnabled()`, `search(options)`,
   optionally `searchFacetValues(field, facetQuery, options)` and
   `timeoutMs`. Keep a copy of `server/providers/types.ts` in the plugin
   (type-only); pass `options.signal` to your own requests so they're
   cancelled when the provider times out. `postgres.ts` and `mysql.ts` here
   are the most complete reference implementations.
2. **Set its config block** at `runtimeConfig.searchProviders.<name>` from the
   plugin's Nuxt module, enabled by the presence of its connection config.
3. **Register it** from a Nitro plugin, on the Map at
   `globalThis[Symbol.for('mframework.search.providers')]`. See
   `packages/plugins/Search/search-meilisearch` for the whole pattern.

`federate.ts`'s merge logic, `/api/search`, `/api/search/facet-values` and
every InstantSearch widget in `app/components/` work against the shared
contract, so none of them need to change.

## Frontend

- **`app/composables/useSearchClient.ts`** — implements the
  `vue-instantsearch` `searchClient` interface (`search()`,
  `searchForFacetValues()`) on top of `POST /api/search` /
  `POST /api/search/facet-values`, translating Algolia-shaped requests to/from
  this layer's federated response shape. Sort is encoded into a synthetic
  index name (`buildSortIndexName`) since InstantSearch's sort-by widget
  selects among index "replicas" rather than sending a sort param directly.
- **`app/composables/useInstantSearchWidgets.ts`**, **`app/pages/results.vue`**,
  **`app/components/{searchBar,filters/filters,SearchWrapper}.vue`** — the
  InstantSearch UI itself.

### Headless mode

An app with its own search UI can use just `/api/search` and the providers:

```ts
appConfig: { search: { ui: false } }
```

This drops the layer's `/search` + `/results` pages and its `search` layout from
the app's build. Those import `#social` / `#commerce` components, so apps that
don't extend those layers (e.g. elitenovels) need this to build.

## Troubleshooting

- **No results from a backend you expect to be enabled**: check
  `backends` in the `/api/search` response — every provider reports
  `{ provider, ok, tookMs, error }`, so a failed/misconfigured provider shows
  up there with its error message rather than failing the whole request.
- **Postgres/Supabase enabled but returns nothing**: the most common cause is
  `ALTERNATE_SEARCH_PG_COLUMNS` not matching the table's real columns — the
  provider builds its `tsvector` from exactly those columns, so a mismatch
  means the `WHERE` clause matches nothing (or, if a column doesn't exist,
  the query errors and the provider reports `ok: false`).
- **`No search backends are configured` warning**: none of
  `ALTERNATE_SEARCH_*` / `NUXT_DATABASE_URL` / `DATABASE_URL` resolved to an
  enabled provider — check `getEnabledProviders()` in `federate.ts` and the
  env vars above.

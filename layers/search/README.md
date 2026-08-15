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
        │  Promise.allSettled — every enabled provider queried in parallel
        ▼
server/providers/{opensearch,postgres,mysql}.ts
        │  each translates the shared SearchProviderOptions into its own
        │  query language and normalizes its response back
        ▼
OpenSearch / Postgres (incl. Supabase) / MySQL
```

- **`server/providers/types.ts`** — the contract every backend implements
  (`SearchProvider`). A provider takes `SearchProviderOptions` (query, page,
  facets, InstantSearch-shaped filters, sort) and returns a
  `ProviderSearchResult` (normalized hits, total, facets, timing).
- **`server/search/federate.ts`** — holds `ALL_PROVIDERS`, the single list of
  registered backends. It queries every provider whose `isEnabled()` returns
  true, tolerates individual providers failing (`Promise.allSettled`),
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

## Adding a new backend

The provider contract is intentionally small, so wiring in another backend
(Algolia, Typesense, Meilisearch, ...) is three steps and touches no existing
provider:

1. **Implement `SearchProvider`** in `server/providers/<name>.ts`:
   `id`, `isEnabled()`, `search(options)`, and optionally
   `searchFacetValues(field, facetQuery, options)` if the backend can support
   InstantSearch's searchable-facet-value lookups. Read `SearchProviderOptions`
   / `ProviderSearchResult` in `server/providers/types.ts` for the exact
   shape — `postgres.ts` and `mysql.ts` are the most complete reference
   implementations (identifier quoting, filter translation, sort handling,
   faceting).
2. **Add its config block** to `runtimeConfig.searchProviders` in
   `nuxt.config.ts`, enabled purely by the presence of its connection config
   (same pattern as the existing backends) — no separate `ENABLED` flag.
3. **Register it** by adding the provider to the `ALL_PROVIDERS` array at the
   top of `server/search/federate.ts`.

That's it — `federate.ts`'s merge logic, `/api/search`, `/api/search/facet-values`,
and every InstantSearch widget in `app/components/` all work against the
shared contract, so none of them need to change.

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

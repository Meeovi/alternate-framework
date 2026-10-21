# directus-extension-mageos-commerce

A Directus **endpoint extension** that puts a Mage-OS / Magento 2 catalog behind a small,
backend-agnostic API at `/commerce/*`. Directus acts as the gateway: it calls Mage-OS
(GraphQL for the catalog, REST for live stock), flattens the responses into one
normalized contract, and caches catalog reads (Redis, stale-while-revalidate).

The frontend only ever sees the normalized shapes in [`src/types.ts`](src/types.ts). To move
to another commerce backend, add an adapter that implements `ICommerceAdapter` and return
it from `createAdapter()` in `src/index.ts` — the `/commerce/*` API doesn't change.

## Files

```
directus-extension-mageos-commerce/
├── package.json              # "directus:extension": endpoint, host ^12
├── tsconfig.json
├── src/
│   ├── index.ts              # defineEndpoint: routes, caching headers, errors, createAdapter()
│   ├── types.ts              # NormalizedProduct, NormalizedCategory, ProductQueryOptions
│   ├── config.ts             # env → settings (MAGEOS_*, reuse of Directus REDIS_*)
│   ├── errors.ts             # CommerceError + fetch-failure mapping
│   ├── query.ts              # query-string parsing/validation, cache keys
│   ├── adapters/
│   │   ├── base.adapter.ts   # ICommerceAdapter
│   │   ├── mage-os.adapter.ts# Mage-OS implementation + normalizeProduct/normalizeCategory
│   │   ├── mage-os.queries.ts# GraphQL documents
│   │   └── oauth1.ts         # OAuth 1.0a (HMAC-SHA256) signing for REST
│   └── cache/
│       └── swr-cache.ts      # SWR cache over Redis (memory fallback) or memory
└── test/                     # vitest: normalizers, adapter transport/errors, cache, query
```

## API

All responses are JSON. Errors use Directus's shape:
`{ "errors": [{ "message": "…", "extensions": { "code": "UPSTREAM_TIMEOUT" } }] }`.

| Route | |
|---|---|
| `GET /commerce/products` | Paginated listing → `{ data: NormalizedProduct[], meta: { page, pageSize, total, totalPages } }` |
| `GET /commerce/products/:slug` | One product (by `url_key`) → `{ data: NormalizedProduct }`, 404 if unknown |
| `GET /commerce/categories` | The category tree below the store's root → `{ data: NormalizedCategory[] }` |
| `POST /commerce/realtime/stock` | Body `{ "skus": ["SKU-1", …] }` (max 50) → `{ data: { "SKU-1": 7, "UNKNOWN": null }, meta: { checkedAt } }` |

`GET /commerce/products` query parameters:

| Param | |
|---|---|
| `page` | 1-based, default 1 |
| `limit` (or `pageSize`) | default 20, max 100 |
| `search` | full-text search |
| `category` | category id (`NormalizedCategory.id`) |
| `category_path` | category path instead of id, e.g. `apparel/women/tops-women` |
| `sku` | comma-separated SKUs |
| `price_min`, `price_max` | price range |
| `sort` | `relevance` · `position` (order within the category; needs a category) · `name` · `-name` · `price` · `-price`. Default: relevance when searching, position in a category, else name |

### Normalized product

```ts
interface NormalizedProduct {
  id: string          // Magento uid
  sku: string
  name: string
  slug: string        // url_key
  price: { regular: number; final: number; currency: string }   // minimum price (configurables: cheapest variant)
  inStock: boolean
  images: string[]    // enabled gallery images by position; Magento placeholder images are dropped
  categories: { id: string; name: string; slug: string }[]
  attributes: Record<string, any>
  updatedAt: string   // ISO 8601
}
```

`attributes` always has `type` (`simple`, `configurable`, `virtual`, …). Listings add
`options` for configurable products (`[{ code, label, values: [{ id, label, swatch? }] }]`).
The single-product route also adds the store's own attributes (from `custom_attributesV2`,
minus Magento's system attributes), `variants`
(`[{ id, sku, inStock, price, options: { color: 58 } }]`), `description`,
`shortDescription`, `metaTitle`, `metaDescription` and `onlyLeftInStock` when Magento shows it.

## Caching and failure handling

- **Catalog reads** (products, product, categories) go through a stale-while-revalidate cache:
  fresh for `MAGEOS_CACHE_TTL` seconds; then served stale for `MAGEOS_CACHE_SWR` seconds while
  one background request refreshes it; after that, fetched again. Concurrent requests for the
  same key share one Mage-OS call. Unknown slugs are cached too, so they can't be used to
  hammer Mage-OS.
- **When Mage-OS fails** (timeout, unreachable, maintenance mode, 5xx), a cached copy up to
  `MAGEOS_CACHE_STALE_IF_ERROR` seconds old is served with `X-Commerce-Cache: STALE-IF-ERROR`
  and a short `Cache-Control: public, s-maxage=30`, so a CDN retries soon. With no copy, the
  answer is 503/504 with a specific code and `Cache-Control: no-store`. Network failures and
  502/503/504 are retried once before that.
- **Headers**: catalog responses send
  `Cache-Control: public, s-maxage=<TTL>, stale-while-revalidate=<SWR>` (by default
  `s-maxage=300, stale-while-revalidate=60`), plus `X-Commerce-Cache` (`HIT`, `MISS`, `STALE`,
  `STALE-IF-ERROR`) and `Age`.
- **Live stock** never uses the catalog cache and sends `Cache-Control: no-store`. Answers are
  reused in memory for `MAGEOS_STOCK_CACHE_SECONDS` (5 s) so a burst of identical checks
  makes one Mage-OS call; set it to `0` to always ask Mage-OS.
- **Redis**: by default the extension uses Directus's own Redis settings (`REDIS` or
  `REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`/…), with keys under `MAGEOS_CACHE_NAMESPACE`. If
  Redis is down, each Directus process caches in memory instead and logs one warning; requests
  never fail because of the cache.

| Error code | Status | When |
|---|---|---|
| `INVALID_QUERY` | 400 | bad parameter or body |
| `FORBIDDEN` | 403 | stock check without a session while `MAGEOS_STOCK_REQUIRE_AUTH=true` |
| `NOT_FOUND` | 404 | unknown product slug |
| `UPSTREAM_AUTH` | 502 | Mage-OS rejected the token, or the integration lacks a permission (the message names it) |
| `UPSTREAM_ERROR` | 502 | GraphQL error or unexpected response |
| `UPSTREAM_OFFLINE` | 503 | Mage-OS unreachable (connection refused, DNS, …) |
| `UPSTREAM_UNAVAILABLE` | 503 | Mage-OS answered 503 (maintenance mode) or another 5xx |
| `NOT_CONFIGURED` | 503 | `MAGEOS_URL` (or, for stock, `MAGEOS_TOKEN`) isn't set |
| `UPSTREAM_TIMEOUT` | 504 | no answer within `MAGEOS_TIMEOUT_MS` |

## Configuration

Set these in Directus's environment (its `.env`, or the container's environment).

| Variable | Default | |
|---|---|---|
| `MAGEOS_URL` | — (required) | Store base URL, e.g. `https://commerce.example.com` |
| `MAGEOS_TOKEN` | — | Integration **Access Token**; needed for `/commerce/realtime/stock` only |
| `MAGEOS_TOKEN_SECRET` | — | Integration **Access Token Secret** |
| `MAGEOS_CONSUMER_KEY` | — | Integration **Consumer Key** |
| `MAGEOS_CONSUMER_SECRET` | — | Integration **Consumer Secret** — with the three above, REST calls are OAuth 1.0a-signed |
| `MAGEOS_STORE_CODE` | default store | Store view code, sent as the `Store` header |
| `MAGEOS_TIMEOUT_MS` | `8000` | Per-request timeout |
| `MAGEOS_CATEGORY_DEPTH` | `6` | Levels of the category tree fetched (max 10) |
| `MAGEOS_CACHE_STORE` | `redis` | `redis` or `memory` |
| `MAGEOS_CACHE_REDIS_URL` | Directus's `REDIS_*` | Separate Redis for this cache, e.g. `redis://:pass@host:6379/2` |
| `MAGEOS_CACHE_NAMESPACE` | `mageos-commerce` | Redis key prefix |
| `MAGEOS_CACHE_TTL` | `300` | Seconds fresh (also the CDN `s-maxage`); `0` disables the cache |
| `MAGEOS_CACHE_SWR` | `60` | Seconds served stale while refreshing |
| `MAGEOS_CACHE_STALE_IF_ERROR` | `86400` | Seconds a stale copy may cover a Mage-OS outage |
| `MAGEOS_STOCK_CACHE_SECONDS` | `5` | Live-stock reuse window; `0` = none |
| `MAGEOS_STOCK_REQUIRE_AUTH` | `false` | `true` = stock checks need a Directus session |

### Mage-OS side

- The catalog uses the public storefront GraphQL API (`/graphql`); no token is sent there.
  `custom_attributesV2` needs Mage-OS 1.0+ / Magento 2.4.7+.
- Live stock uses REST `GET /rest/V1/stockItems/:sku` (the default stock, which MSI keeps in
  sync), authenticated as a Magento Integration:
  1. **System › Extensions › Integrations**: create or edit the integration, and on **API**
     tick **Catalog › Inventory** (`Magento_Catalog::catalog_inventory`). Save and
     (re)activate it.
  2. From its **Integration Details**, copy the Consumer Key, Consumer Secret, Access Token and
     Access Token Secret into `MAGEOS_CONSUMER_KEY`, `MAGEOS_CONSUMER_SECRET`, `MAGEOS_TOKEN`
     and `MAGEOS_TOKEN_SECRET`. Requests are then signed with OAuth 1.0a (HMAC-SHA256), which
     works with Magento's default settings.
  - Alternatively set only `MAGEOS_TOKEN`, which is sent as a Bearer token. That works only if
    the store allows it (**Stores › Configuration › Services › OAuth › Consumer Settings ›
    Allow OAuth Access Tokens to be used as standalone Bearer tokens**,
    `oauth/consumer/enable_integration_as_bearer`, off by default since Magento 2.4.4). When
    it's off, Magento doesn't reject the token: it treats the call as a guest, and the answer
    is a 401 naming a permission, which looks like a missing ACL resource but isn't.
- If a gift-card extension adds product types without GraphQL support, any `products` query
  that returns one fails. Install a GraphQL type for it (this repo's
  `adapter-magento/magento-module/Meeovi/GiftCards` does that for Ecomteck gift cards).

## Build and install

Requires Node 20.19+.

```bash
cd packages/plugins/CMS-Content/directus-extension-mageos-commerce
npm install
npm test            # unit tests
npm run typecheck
npm run build       # → dist/index.js (dependencies bundled, nothing to install in Directus)
```

Directus loads extensions from `EXTENSIONS_PATH` (default `./extensions`). Copy the built
package there, in its own folder, with its `package.json` (Directus reads
`directus:extension` from it) and `dist/`:

```bash
EXT=/directus/extensions/directus-extension-mageos-commerce
mkdir -p "$EXT"
cp -r package.json dist "$EXT"/
```

For Docker, copy into the volume or bind mount behind `/directus/extensions`, for example:

```bash
docker cp package.json <container>:/directus/extensions/directus-extension-mageos-commerce/package.json
docker cp dist        <container>:/directus/extensions/directus-extension-mageos-commerce/dist
```

Then add the `MAGEOS_*` variables to Directus's environment and restart Directus (extensions
and env are read at start-up, unless `EXTENSIONS_AUTO_RELOAD=true`). Check it's loaded:

```bash
curl -s https://<directus>/commerce/categories | head -c 300
curl -sI 'https://<directus>/commerce/products?limit=1' | grep -i -E 'x-commerce-cache|cache-control'
```

During development, `npm run dev` rebuilds on change; with `EXTENSIONS_AUTO_RELOAD=true`
Directus picks up the new build without a restart.

## Using it from Nuxt (Directus SDK)

```ts
import { createDirectus, rest, customEndpoint } from '@directus/sdk'
import type { NormalizedProduct } from 'directus-extension-mageos-commerce/src/types'

const directus = createDirectus(useRuntimeConfig().public.directusUrl).with(rest())

const { data, meta } = await directus.request(customEndpoint<{ data: NormalizedProduct[], meta: { total: number } }>({
  path: '/commerce/products',
  params: { category_path: 'apparel/women', sort: 'price', limit: 24 },
}))

const stock = await directus.request(customEndpoint<{ data: Record<string, number | null> }>({
  path: '/commerce/realtime/stock',
  method: 'POST',
  body: JSON.stringify({ skus: data.map((p) => p.sku) }),
}))
```

All routes are public (like Mage-OS's storefront catalog) unless `MAGEOS_STOCK_REQUIRE_AUTH`
is on, so they work with the SDK's default, unauthenticated client.

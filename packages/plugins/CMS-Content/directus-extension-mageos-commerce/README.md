# directus-extension-mageos-commerce

A Directus **endpoint extension** that puts a Mage-OS / Magento 2 store behind one
backend-agnostic API at `/commerce/*`, callable with the **Directus SDK**. It covers the
working functionality of `adapter-magento`: the storefront catalog, search, reviews, store
settings, customers, paid orders, gift cards, Webkul marketplace sellers, catalogue sync and
store administration — normalized into the same shapes the app's commerce contract
(`alternate-sdk`'s `BackendOrder`, `BackendAdminOrder`, `BackendGiftCard`, …) already uses.

Catalog reads are cached (Redis, stale-while-revalidate). Everything that touches a customer,
an order, a seller or the store's admin data is only for **trusted Directus callers** (see
[Access](#access)).

To move to another commerce backend, add an adapter that implements `ICommerceAdapter`
([`src/adapters/base.adapter.ts`](src/adapters/base.adapter.ts)) and return it from
`createAdapter()` in `src/index.ts` — the API doesn't change. Beyond the catalog, capabilities
are optional: a backend without one answers those routes with `501 NOT_SUPPORTED`.

## Files

```
directus-extension-mageos-commerce/
├── package.json                  # "directus:extension": endpoint (host ^12); exports ./sdk, ./types
├── sdk/index.ts                  # typed Directus SDK commands: commerce.products(), …
├── src/
│   ├── index.ts                  # defineEndpoint: adapter, cache, route modules
│   ├── http.ts                   # errors, cache headers, trusted-caller check, body validation
│   ├── routes/
│   │   ├── catalog.ts            # public storefront routes
│   │   ├── account.ts            # customers, orders, gift cards (trusted)
│   │   ├── sellers.ts            # marketplace sellers + catalogue sync (trusted)
│   │   └── admin.ts              # store administration (trusted)
│   ├── types.ts                  # the API's types (normalized catalog + commerce contract)
│   ├── config.ts                 # env → settings
│   ├── errors.ts                 # CommerceError codes → HTTP statuses
│   ├── query.ts                  # query-string parsing/validation, cache keys
│   ├── adapters/
│   │   ├── base.adapter.ts       # ICommerceAdapter (+ optional capabilities)
│   │   ├── mage-os.adapter.ts    # Mage-OS: catalog, transport (GraphQL/REST), normalizers
│   │   ├── mage-os.services.ts   # Mage-OS: everything beyond the catalog
│   │   ├── mage-os.mappers.ts    # REST rows → commerce contract (ported from adapter-magento)
│   │   ├── mage-os.queries.ts    # GraphQL documents
│   │   └── oauth1.ts             # OAuth 1.0a (HMAC-SHA256) request signing
│   └── cache/swr-cache.ts        # SWR cache over Redis (memory fallback) or memory
└── test/                         # vitest
```

## Using it with the Directus SDK

`sdk/index.ts` has one typed command per route, built on the SDK's `customEndpoint`:

```ts
import { createDirectus, rest, staticToken } from '@directus/sdk'
import { commerce } from 'directus-extension-mageos-commerce/sdk'

// Public storefront: any client, no token.
const directus = createDirectus(useRuntimeConfig().public.directusUrl).with(rest())

const page = await directus.request(commerce.products({ category_slug: 'books', sort: 'price', limit: 24 }))
page.items          // NormalizedProduct[]
page.total          // and page, pageSize, totalPages

const results = await directus.request(commerce.search({ q: 'jacket', facets: true }))
const stock = await directus.request(commerce.stock(page.items.map((p) => p.sku)))

// Trusted routes: server-side only, with the app server's Directus token.
const server = createDirectus(process.env.DIRECTUS_URL!).with(staticToken(process.env.DIRECTUS_TOKEN!)).with(rest())
const orders = await server.request(commerce.customerOrders(magentoCustomerId))
await server.request(commerce.placePaidOrder({ reference: captureId, customerId, items, amountPaid, currency: 'USD' }))
```

Listings and search put their paging inside `data` (`{ items, page, pageSize, total,
totalPages }`) because the SDK returns only a response's `data`. Errors reject with the SDK's
error (`error.errors[0].extensions.code`, `error.response.status`).

The package isn't an npm workspace of this repo; import it by path
(`packages/plugins/CMS-Content/directus-extension-mageos-commerce/sdk`) or add it to the
workspaces. `@directus/sdk` is a peer dependency.

## API

All responses are JSON `{ "data": … }`. Errors use Directus's shape:
`{ "errors": [{ "message": "…", "extensions": { "code": "UPSTREAM_TIMEOUT" } }] }`.

### Public (no authentication)

| Route | SDK | Returns |
|---|---|---|
| `GET /commerce/products` | `products(params)` | `Paginated<NormalizedProduct>` |
| `GET /commerce/products/:slug` | `product(slug)` | `NormalizedProduct` (404 if unknown) |
| `GET /commerce/products/:slug/reviews?limit=` | `productReviews(slug)` | `ProductReview[]` |
| `POST /commerce/products/:slug/reviews` | `createReview(slug, review)` | `ProductReview` — `{ nickname, summary, text, ratings: [{ id, valueId }] }` |
| `GET /commerce/reviews/ratings` | `reviewRatings()` | rating ids/value ids for writing reviews |
| `GET /commerce/categories` | `categories()` | the category tree (`NormalizedCategory[]`) |
| `GET /commerce/categories/:idOrPath` | `category(idOrPath)` | one category with its subtree |
| `GET /commerce/search?q=` | `search(params)` | `Paginated<NormalizedProduct> & { facets }` |
| `GET /commerce/search/suggest?q=` | `suggest(q)` | product-name suggestions |
| `GET /commerce/store` | `store()` | store name, currencies, locale, review settings |
| `GET /commerce/gift-cards/products` | `giftCardProducts()` | gift card products |
| `GET /commerce/sellers?sku=A,B` | `sellers(skus)` | `{ [sku]: { customerId, name, shopUrl } }` (store-owned SKUs absent) |
| `POST /commerce/realtime/stock` | `stock(skus)` | `{ [sku]: qty \| null }` — live, `{ "skus": [...] }`, max 50 |

`GET /commerce/products` parameters: `page`, `limit` (≤ 100), `search`, `category` (id),
`category_path`, `category_slug` (an unknown slug gives an empty page), `sku` (comma list),
`price_min`, `price_max`, `sort` (`relevance` · `position` · `name` · `-name` · `price` ·
`-price`; `position` needs a category). `GET /commerce/search`: `q` (required), `page`,
`limit`, `category`, `sort`, `facets=true`.

### Trusted: customers, orders, gift cards

| Route | SDK | |
|---|---|---|
| `POST /commerce/customers` | `createCustomer(input)` | `{ firstname, lastname, email, wantsToSell? }` → the backend customer (`id` from the customer token; optional seller registration) |
| `GET /commerce/customers/:id/orders?page=&limit=` | `customerOrders(id)` | `BackendOrder[]`, newest first |
| `GET /commerce/customers/:id/orders/:orderId` | `customerOrder(id, orderId)` | `BackendOrder`; 404 when not theirs |
| `GET /commerce/customers/:id/purchased-skus` | `purchasedSkus(id)` | SKUs invoiced and not refunded |
| `GET /commerce/customers/:id/gift-cards` | `customerGiftCards(id)` | `BackendGiftCard[]` on their orders |
| `GET /commerce/gift-cards/received?email=` | `receivedGiftCards(email)` | `BackendGiftCard[]` sent to that email |
| `POST /commerce/orders` | `placePaidOrder(order)` | records an order paid outside the store (`PaidOrder`); idempotent on `reference` (`201` new, `200` repeat) |

### Trusted: marketplace sellers and catalogue sync

| Route | SDK | |
|---|---|---|
| `POST /commerce/sellers/register` | `registerSeller(input)` | `{ customerId, customerToken, shopUrl? }` — self-scoped, with the customer's own token |
| `POST /commerce/sellers/:id/products` | `createSellerProduct(id, token, product)` | self-scoped like register |
| `GET` / `PATCH /commerce/sellers/:id/shop` | `sellerShop(id)`, `updateSellerShop(id, updates)` | shop profile |
| `GET /commerce/sellers/:id/products` · `/orders` · `/transactions` · `/low-stock` | `sellerProducts(id)`, … | seller dashboard data |
| `POST /commerce/sync/products` · `/sync/stock` · `/sync/images` | `syncProduct`, `syncStock`, `syncImage` | keep a seller's catalogue in sync (e.g. dropshipping) |
| `GET /commerce/sync/orders?filters=&limit=` | `syncOrders(filters)` | core orders; `filters` = JSON `[{ field, value, condition? }]` |
| `POST /commerce/sync/orders/:orderId/ship` | `shipOrder(orderId, shipment)` | ship items with tracking → `{ shipmentId }` |

### Trusted: store administration

| Route | SDK | |
|---|---|---|
| `GET /commerce/admin/:collection` | `adminList(c)` | flat rows; `customers` · `orders` · `creditmemos` |
| `GET /commerce/admin/:collection/schema` | `adminSchema(c)` | column definitions (`BackendField[]`) |
| `POST /commerce/admin/customers` | `adminCreateCustomer(data)` | `email`, `firstname`, `lastname`, `group_id` |
| `PATCH` / `DELETE /commerce/admin/customers/:id` | `adminUpdateCustomer`, `adminDeleteCustomer` | edits merge onto the current record |
| `GET /commerce/admin/orders/:orderId` | `adminOrder(id)` | `BackendAdminOrder`, with what's still refundable per line |
| `GET /commerce/admin/orders/by-reference/:ref` | `adminOrderByReference(ref)` | the order with that payment reference |
| `POST /commerce/admin/orders/:orderId/refund` | `refundOrder({ orderId, items?, comment? })` | an offline credit memo (the app refunds the payment itself); no `items` = everything left |

## Access

- **Public routes** need no token, like the store's own storefront. Mage-OS still applies its
  own rules (guest reviews, review moderation). Directus's rate limiter (`RATE_LIMITER_*`)
  bounds abuse of the public `POST`s.
- **Trusted routes** need a Directus **admin**, or a Directus user or role listed in
  `MAGEOS_TRUSTED_USERS` / `MAGEOS_TRUSTED_ROLES`. Otherwise they answer `403 FORBIDDEN`. The
  intended caller is the app's server, with its static token (e.g. the "Meeovi app server"
  user): it has already authenticated its own user and passes their backend customer id. Never
  call these from the browser. Their responses are `Cache-Control: private, no-store`.
- Writes are never retried (a repeated refund would refund twice). `placePaidOrder` is safe to
  repeat because Mage-OS dedupes it on `reference`.

## Caching and failure handling

- **Public reads** (products, product, reviews, ratings, categories, search, suggest, store,
  gift-card products, sellers) go through a stale-while-revalidate cache: fresh for
  `MAGEOS_CACHE_TTL` seconds; then served stale for `MAGEOS_CACHE_SWR` seconds while one
  background request refreshes it. Concurrent requests for the same key share one Mage-OS
  call, and unknown slugs are cached too. Headers:
  `Cache-Control: public, s-maxage=<TTL>, stale-while-revalidate=<SWR>` (default
  `s-maxage=300, stale-while-revalidate=60`), `X-Commerce-Cache` (`HIT`, `MISS`, `STALE`,
  `STALE-IF-ERROR`), `Age`.
- **When Mage-OS fails** (timeout, unreachable, maintenance mode, 5xx), a cached copy up to
  `MAGEOS_CACHE_STALE_IF_ERROR` seconds old is served (`STALE-IF-ERROR`,
  `Cache-Control: public, s-maxage=30`). With no copy, the answer is a 503/504 with a specific
  code. Reads are retried once on a network failure or 502/503/504.
- **Live stock** skips the catalog cache (`no-store`); answers are reused in memory for
  `MAGEOS_STOCK_CACHE_SECONDS` (5 s) so a burst of identical checks makes one Mage-OS call.
- **Redis**: Directus's own Redis settings by default, keys under `MAGEOS_CACHE_NAMESPACE`. If
  Redis is down, each Directus process caches in memory and logs one warning.

| Error code | Status | When |
|---|---|---|
| `INVALID_QUERY` | 400 | bad parameter or body |
| `FORBIDDEN` | 403 | a trusted route without a trusted caller (or stock while `MAGEOS_STOCK_REQUIRE_AUTH`) |
| `NOT_FOUND` | 404 | unknown product, category, order, customer, … |
| `REJECTED` | 422 | Mage-OS refused a write (duplicate email, nothing to refund, SKU not the seller's, …) — its message is passed on |
| `NOT_SUPPORTED` | 501 | the backend lacks that capability |
| `UPSTREAM_AUTH` | 502 | Mage-OS refused the integration — the message names the missing ACL resource |
| `UPSTREAM_ERROR` | 502 | GraphQL error, unexpected response, or a Mage-OS module that isn't installed (named) |
| `UPSTREAM_OFFLINE` | 503 | Mage-OS unreachable (connection refused, DNS, …) |
| `UPSTREAM_UNAVAILABLE` | 503 | Mage-OS answered 503 (maintenance mode) or another 5xx |
| `NOT_CONFIGURED` | 503 | `MAGEOS_URL` (or, for REST routes, the integration credentials) isn't set |
| `UPSTREAM_TIMEOUT` | 504 | no answer within `MAGEOS_TIMEOUT_MS` |

## Configuration

Set these in Directus's environment (its `.env`, or the container's environment).

| Variable | Default | |
|---|---|---|
| `MAGEOS_URL` | — (required) | Store base URL, e.g. `https://commerce.example.com` |
| `MAGEOS_TOKEN` | — | Integration **Access Token** — needed by every REST route (stock, sellers, gift cards, orders, customers' orders, sync, admin) |
| `MAGEOS_TOKEN_SECRET` | — | Integration **Access Token Secret** |
| `MAGEOS_CONSUMER_KEY` | — | Integration **Consumer Key** |
| `MAGEOS_CONSUMER_SECRET` | — | Integration **Consumer Secret** — with the three above, REST calls are OAuth 1.0a-signed |
| `MAGEOS_TRUSTED_USERS` | — | Directus user ids allowed on trusted routes (comma-separated); admins always are |
| `MAGEOS_TRUSTED_ROLES` | — | Directus role ids allowed on trusted routes |
| `MAGEOS_STORE_CODE` | default store | Store view code (`Store` header, `/rest/<code>/V1`) |
| `MAGEOS_TIMEOUT_MS` | `8000` | Per-request timeout |
| `MAGEOS_CATEGORY_DEPTH` | `6` | Levels of the category tree fetched (max 10) |
| `MAGEOS_CACHE_STORE` | `redis` | `redis` or `memory` |
| `MAGEOS_CACHE_REDIS_URL` | Directus's `REDIS_*` | Separate Redis for this cache |
| `MAGEOS_CACHE_NAMESPACE` | `mageos-commerce` | Redis key prefix |
| `MAGEOS_CACHE_TTL` | `300` | Seconds fresh (also the CDN `s-maxage`); `0` disables the cache |
| `MAGEOS_CACHE_SWR` | `60` | Seconds served stale while refreshing |
| `MAGEOS_CACHE_STALE_IF_ERROR` | `86400` | Seconds a stale copy may cover a Mage-OS outage |
| `MAGEOS_STOCK_CACHE_SECONDS` | `5` | Live-stock reuse window; `0` = none |
| `MAGEOS_STOCK_REQUIRE_AUTH` | `false` | `true` = stock checks need a Directus session |

### Mage-OS side

The catalog, search, reviews and customer creation use the public storefront GraphQL API (no
token). Everything else is REST, as a Magento **Integration**:

1. **System › Extensions › Integrations**: create or edit the integration and, on **API**, tick
   the resources for the routes you use (below). Save and (re)activate it.
2. Copy its Consumer Key, Consumer Secret, Access Token and Access Token Secret into the four
   `MAGEOS_*` credentials. Requests are then OAuth 1.0a-signed, which works with Magento's
   default settings. (With only `MAGEOS_TOKEN`, it's sent as a Bearer token, which works only
   when **Stores › Configuration › Services › OAuth › Consumer Settings › Allow OAuth Access
   Tokens to be used as standalone Bearer tokens** is on; when it's off, Magento treats the call
   as a guest and answers 401 naming a resource, which looks like a missing ACL but isn't.)

| Routes | Mage-OS module | Integration ACL resources |
|---|---|---|
| live stock | core | Catalog › Inventory (`Magento_Catalog::catalog_inventory`) |
| sellers by SKU, seller dashboard/register/products, catalogue sync, paid orders, customer orders, purchased SKUs | `Meeovi_MarketplaceApi` (+ Webkul Marketplace) | the module's resources, incl. `Meeovi_MarketplaceApi::external_orders` |
| gift cards | `Meeovi_GiftCards` (+ Ecomteck GiftCard) | `Meeovi_GiftCards::read` |
| admin customers | core | `Magento_Customer::customer`, `::manage`, `::delete` |
| admin orders, order lookup, refunds, sync orders/ship | core | `Magento_Sales::actions_view`, `Magento_Sales::sales_creditmemo`, `Magento_Sales::creditmemo`, `Magento_Sales::ship` |

A missing resource answers `502 UPSTREAM_AUTH` naming it; a missing module answers `502
UPSTREAM_ERROR` naming the route. `custom_attributesV2` (product attributes) needs Mage-OS
1.0+ / Magento 2.4.7+. If a gift-card extension adds product types without GraphQL support,
any `products` query that returns one fails — `Meeovi_GiftCards` adds that GraphQL type for
Ecomteck gift cards.

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

For Docker, copy into the volume or bind mount behind `/directus/extensions`. Then add the
`MAGEOS_*` variables to Directus's environment and restart Directus (extensions and env are read
at start-up, unless `EXTENSIONS_AUTO_RELOAD=true`). Check it's loaded:

```bash
curl -s https://<directus>/commerce/store
curl -sI 'https://<directus>/commerce/products?limit=1' | grep -i -E 'x-commerce-cache|cache-control'
```

During development, `npm run dev` rebuilds on change; with `EXTENSIONS_AUTO_RELOAD=true`
Directus picks up the new build without a restart.

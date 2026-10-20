# @mframework/adapter-magento

Official Magento 2 adapter for the M Framework. This Nuxt module exposes a `$magentoAdapter` runtime client that any Nuxt 4 frontend can use to query Magento data through GraphQL, with built-in normalizers and alternate-sdk registry integration.

## Features

- **Nuxt 4 module** — drop into any Nuxt 4 app via `modules: ['adapter-magento/module']`
- **GraphQL client** — pre-configured `graphql-request` client pointed at your Magento endpoint
- **Entity reader** — `readEntity` API that resolves GraphQL Mesh-prefixed or raw Magento root fields automatically
- **50+ normalizers** — maps Magento payloads to normalized Directus-compatible shapes for products, categories, customers, orders, carts, and more
- **alternate-sdk integration** — registers search, notification and commerce-backend capabilities into shared registries for backend-agnostic composables (auth is better-auth in layers/auth, not an SDK adapter)
- **Environment-based config** — endpoint, store code, and token pulled from `runtimeConfig.public.magento`

## Installation

```bash
npm install @mframework/adapter-magento
```

## Nuxt Configuration

Add the module to your Nuxt config and provide your Magento credentials:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    'adapter-magento/module'
  ],

  magento: {
    endpoint: process.env.MAGENTO_GRAPHQL_URL, // https://your-magento.com/graphql
    storeCode: process.env.MAGENTO_STORE_CODE, // optional, e.g. "default"
    token: process.env.MAGENTO_TOKEN           // optional bearer token if required
  }
})
```

### Environment Variables

```env
# .env
MAGENTO_GRAPHQL_URL=https://demo.meeovicms.com/graphql
MAGENTO_STORE_CODE=default
MAGENTO_TOKEN=your-bearer-token
```

### Site search

With an endpoint set, the module adds Magento product search to the search
layer's federated `/api/search` as the `magento` provider
(`src/runtime/server/search-provider.ts`), registered through the layer's
provider registry. `ALTERNATE_SEARCH_MAGENTO_ENABLED=false`, or
`runtimeConfig.searchProviders.magento.enabled`, turns it off.

## Usage

For querying, filtering, sorting, paging and CRUD, see [HOWTO.md](HOWTO.md).

### Accessing the Adapter

The module exposes the adapter as `$magentoAdapter` on the Nuxt app context and as `useMagentoAdapter()` via the plugin provide:

```vue
<script setup>
const nuxtApp = useNuxtApp()
const magento = nuxtApp.$magentoAdapter
</script>
```

### Reading Magento Entities

```ts
const { items, total } = await magento.commerce.getProductsPage({
  filter: { category_uid: { eq: 'MTI=' } },
  sort: { price: 'ASC' },
  pageSize: 12,
  currentPage: 1,
})

// Any other root query on the storefront schema
const categories = await magento.store.queryField('categories', { filters: { parent_id: { eq: '2' } } }, {
  fields: [{ items: ['uid', 'name', 'url_key'] }, 'total_count'],
})
```

`store.readEntity` guesses singular root fields (`Product`, `Mage_Product`)
that Magento's schema doesn't have, so it always throws. Use `queryField`.
See [HOWTO.md](HOWTO.md) for filters, sorting and writes.

### Using Normalizers

Every normalizer follows the `createNormalizer<Source, Target>` pattern and is registered in the `magentoNormalizers` map. Use them to transform raw Magento payloads into normalized shapes:

```ts
import { normalizeMagentoProduct, magentoNormalizers } from '@mframework/adapter-magento'

const rawProduct = rawMagentoResponse.items[0]
const normalized = normalizeMagentoProduct(rawProduct)
// normalized is now in the Directus-compatible shape

// Or resolve by key at runtime
const normalizer = magentoNormalizers['products']
const normalized = normalizer(rawProduct)
```

### alternate-sdk Registries

The runtime plugin automatically registers the adapter into shared registries so composables can resolve it backend-agnostically:

```ts
// Automatically registered by the plugin
SearchAdapterRegistry.register('magento', adapterInstance.content.search)
NotifyAdapterRegistry.register('magento', adapterInstance.content.notifications)
```

This means any composable using `SearchAdapterRegistry` or `NotifyAdapterRegistry` can switch to Magento by changing the provider key without changing component code.

## Store admin (/workspace)

With the Magento Integration configured (`MAGENTO_CONSUMER_KEY` and the
other three OAuth values), the commerce backend this adapter registers also
serves the app's `/workspace` admin:

- **Tables** (meeovi-tables): `customers` (list, create, edit, delete),
  `orders` and `creditmemos` (read-only), newest first. Customers created
  there join `MAGENTO_WEBSITE_ID` (default 1).
- **Refunds**: `adminOrder`, `orderByReference` (the Stripe payment id the
  app placed the order with, stored as `ext_order_id`) and `refundOrder`.
  That's an offline credit memo through `POST /V1/order/{id}/refund`; the
  money itself is refunded through Stripe by the app.

The Integration needs these API resources (Mage-OS admin → System →
Integrations → the app's integration → API):

| Resource | For |
| --- | --- |
| `Magento_Customer::customer` | Listing customers |
| `Magento_Customer::manage` | Editing customers |
| `Magento_Customer::delete` | Deleting customers |
| `Magento_Sales::actions_view` | Listing and reading orders |
| `Magento_Sales::sales_creditmemo` | Listing credit memos |
| `Magento_Sales::creditmemo` | Creating credit memos (refunds) |

Without them, Magento answers 401 ("The consumer isn't authorized") and the
tables show that error.

`dist/` (not in git) is what apps load, so rebuild it after changing `src/`.
`nuxt-module-build` wipes `dist` and regenerates only the module and runtime
files, so `npm run prepare` alone leaves it incomplete. To rebuild what
changed instead:

```sh
npm run build:index                       # dist/index.js (+ graphql, types)
npx esbuild src/runtime/commerce-backend.ts --format=esm --platform=neutral \
  --target=es2022 --outfile=dist/runtime/commerce-backend.js   # likewise per runtime file;
                                                               # keep relative imports ending in .js
```

## Normalizer Coverage

The module ships with normalizers for the following Magento entities:

- Products, Categories, Customers, Customer Addresses, Customer Groups
- Orders, Order Items, Invoices, Shipments, Credit Memos, Transactions
- Cart, Cart Items, Coupons, Gift Wrappings, Gift Registries
- Product Reviews, Wishlists, Product Links, Tier Prices
- Payment Tokens, Returns / RMA, Sales Rules, Shared Catalogs
- Dynamic Blocks, Polls, Carriers, Glossary Terms
- Purchase Orders, Company Accounts, Invitations, Approval Rules, Affiliates
- Channels, Admin Action Logs, Catalog Events
- Inventory, Inventory Sources

## Architecture

```
packages/plugins/CMS-Content/adapter-magento/
├── src/
│   ├── index.ts               # MagentoAdapter class
│   ├── module.ts              # Nuxt module definition
│   ├── runtime/
│   │   └── plugin.ts          # Nuxt runtime plugin
│   ├── api/                   # GraphQL queries/mutations
│   ├── normalizers/           # Entity normalizers + registry
│   │   ├── automapper.ts
│   │   ├── normalizers.ts
│   │   └── *.ts
│   └── graphql/               # Generated types + codegen config
├── dist/                      # Built module output
├── mesh.config.ts             # GraphQL Mesh composition config
├── codegen.ts                 # GraphQL codegen config
└── package.json
```

## Requirements

- Nuxt 4+
- Node.js 18+
- A running Magento 2 instance with GraphQL enabled

## License

MIT

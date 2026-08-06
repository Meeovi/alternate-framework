# @mframework/adapter-magento

Official Magento 2 adapter for the M Framework. This Nuxt module exposes a `$magentoAdapter` runtime client that any Nuxt 4 frontend can use to query Magento data through GraphQL, with built-in normalizers and alternate-sdk registry integration.

## Features

- **Nuxt 4 module** — drop into any Nuxt 4 app via `modules: ['adapter-magento/module']`
- **GraphQL client** — pre-configured `graphql-request` client pointed at your Magento endpoint
- **Entity reader** — `readEntity` API that resolves GraphQL Mesh-prefixed or raw Magento root fields automatically
- **50+ normalizers** — maps Magento payloads to normalized Directus-compatible shapes for products, categories, customers, orders, carts, and more
- **alternate-sdk integration** — registers search, auth, and notification capabilities into shared registries for backend-agnostic composables
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

## Usage

### Accessing the Adapter

The module exposes the adapter as `$magentoAdapter` on the Nuxt app context and as `useMagentoAdapter()` via the plugin provide:

```vue
<script setup>
const nuxtApp = useNuxtApp()
const magento = nuxtApp.$magentoAdapter
</script>
```

### Reading Magento Entities

Use `readEntity` to query any Magento GraphQL entity. The adapter automatically tries multiple root field formats (`Mage_Product`, `Product`, `product`) so it works with both raw Magento and GraphQL Mesh-prefixed schemas.

```ts
// Fetch products
const products = await magento.store.readEntity('Product', {
  filter: { name: { like: '%shirt%' } },
  pageSize: 10,
  currentPage: 1
}, {
  fields: [
    'sku',
    'name',
    'price',
    'stock_status',
    'thumbnail { url label }',
    'url_key'
  ]
})

// products is the raw GraphQL response for the Product root field
// items are already available at products.items when paginated
```

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
AuthAdapterRegistry.register('magento', adapterInstance.content.auth)
NotifyAdapterRegistry.register('magento', adapterInstance.content.notifications)
```

This means any composable using `SearchAdapterRegistry`, `AuthAdapterRegistry`, or `NotifyAdapterRegistry` can switch to Magento by changing the provider key without changing component code.

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
packages/adapters/adapter-magento/
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

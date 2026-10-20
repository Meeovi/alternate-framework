# How to query, filter and change data with adapter-magento

This guide covers reading products and categories, filtering, sorting and
paging them, and creating, updating and deleting store data. The read
examples were checked against the Mage-OS test store (commerce.meeovicms.com).

- [Which entry point to use](#which-entry-point-to-use)
- [Querying products](#querying-products)
- [Filtering](#filtering)
- [Sorting and paging](#sorting-and-paging)
- [Any other storefront query](#any-other-storefront-query)
- [Create, update, delete (CRUD)](#create-update-delete-crud)
- [Errors and gotchas](#errors-and-gotchas)

## Which entry point to use

The module registers the adapter in two forms:

| Form | Where | Use it for |
| --- | --- | --- |
| `MagentoAdapter` (`$magentoAdapter`) | Vue code: `useNuxtApp().$magentoAdapter`. Server code: `new MagentoAdapter(endpoint)` | Anything Magento-specific: filters, sorting, custom fields, admin writes |
| Commerce backend (`CommerceBackendRegistry.get('magento')`) | Vue and Nitro code (`alternate-sdk`) | Code that must work with any backend (Directus, Magento, …) |

```ts
// In a component or composable
const magento = useNuxtApp().$magentoAdapter

// In code that shouldn't care which store is active
import { CommerceBackendRegistry } from 'alternate-sdk'
const backend = CommerceBackendRegistry.get('magento')
```

Storefront reads (products, categories, reviews) are public GraphQL and need
no credentials. Admin writes use the Magento Integration (OAuth 1.0a) and run
**on the server only**. See [Create, update, delete](#create-update-delete-crud).

## Querying products

### A list

```ts
const products = await magento.commerce.getProducts({ pageSize: 12 })
// → [{ sku, name, price_range: { minimum_price: { final_price: { value, currency } } } }, …]
```

### A list with paging info

`getProductsPage` takes the same arguments and also returns the number of
matches:

```ts
const { items, total, page, pageSize } = await magento.commerce.getProductsPage({
  pageSize: 12,
  currentPage: 2,
})
const pages = Math.ceil(total / pageSize)
```

### One product

```ts
await magento.commerce.getProductBySku('meeovi-habit-tracker')
await magento.commerce.getProductBySlug('habit-tracker')   // the product's url_key
```

Magento's storefront can't look a product up by numeric id.
`getProductById(id)` treats the id as a SKU.

### Choosing fields

By default you get `sku`, `name` and the final price. Pass `fields` to choose
others, in the same format `store.queryField` uses: strings for scalar fields,
`{ field: [...] }` objects for nested ones.

```ts
await magento.commerce.getProducts({
  fields: [
    'sku', 'name', 'url_key', 'type_id', 'stock_status',
    { small_image: ['url', 'label'] },
    { price_range: [{ minimum_price: [{ final_price: ['value', 'currency'] }, { discount: ['percent_off'] }] }] },
    { categories: ['uid', 'name'] },
  ],
})
```

`price` doesn't exist as a plain field on products: use `price_range`.

### Search

```ts
await magento.commerce.getProductsPage({ search: 'tracker', pageSize: 10 })

// The same, plus layered-navigation facets (what the site search uses):
const { items, total, aggregations } = await magento.content.search('tracker', {
  pageSize: 10,
  aggregations: true,
})
```

### Products in a category

```ts
await magento.commerce.getProducts({ filter: { category_uid: { eq: 'MTI=' } } })

// Store-neutral: resolves a Directus department/category to the store's category
await backend.getProductsByCategory({ slug: 'apps', externalId: 'MTI=' })
```

## Filtering

`filter` takes Magento's `ProductAttributeFilterInput`. Each attribute uses
one of three operator shapes:

| Shape | Operators | Example |
| --- | --- | --- |
| Exact (`FilterEqualTypeInput`) | `eq`, `in` | `{ sku: { in: ['a', 'b'] } }` |
| Text (`FilterMatchTypeInput`) | `match` | `{ name: { match: 'tracker' } }` |
| Range (`FilterRangeTypeInput`) | `from`, `to` | `{ price: { from: '5', to: '50' } }` |

Several attributes in one `filter` must all match (AND):

```ts
await magento.commerce.getProductsPage({
  filter: {
    category_uid: { eq: 'MTI=' },
    price: { from: '0', to: '20' },
    is_seller_product: { eq: '1' },
  },
  pageSize: 24,
})
```

### Which attributes you can filter on

Magento only accepts attributes that are marked filterable. On
commerce.meeovicms.com these are:

- **Identity and placement:** `sku`, `url_key`, `category_id`, `category_uid`, `category_url_path`
- **Text:** `name`, `description`, `short_description`
- **Price:** `price`
- **Catalog attributes:** `is_seller_product`, `new`, `sale`, `format`, `color`, `size`, `gender`, `material`, `pattern`, `climate`, `activity`, `eco_collection` and the other layered-navigation attributes

To list them for any store:

```ts
const schema = await magento.store.queryField('__type', { name: 'ProductAttributeFilterInput' }, {
  fields: [{ inputFields: ['name', { type: ['name'] }] }],
})
```

**Making your own attribute filterable:** in the Magento admin, go to
Stores → Attributes → Product, open the attribute, and under Storefront
Properties set "Use in Search Results Layered Navigation" to Yes. Then
reindex.

### Filtering by product type

`type_id` (simple, virtual, configurable, downloadable, bundle, grouped)
**can't be filtered on**. It's a built-in field, not an attribute, and
Magento doesn't expose it as a filter. You have two options:

1. **Something that stands for the type (recommended):** put those products
   in a category and filter by `category_uid`, or give them a filterable
   attribute, as `is_seller_product` does.
2. **Filter after the query:** request `type_id` and filter the page
   yourself. Pages then come back uneven, and `total` counts every type.

   ```ts
   const { items } = await magento.commerce.getProductsPage({ fields: ['sku', 'name', 'type_id'], pageSize: 50 })
   const downloads = items.filter((p) => p.type_id === 'downloadable')
   ```

`__typename` (`VirtualProduct`, `SimpleProduct`, …) gives the same
information, if you prefer it.

## Sorting and paging

```ts
await magento.commerce.getProductsPage({
  search: '',
  sort: { price: 'ASC' },     // 'asc' / 'desc' work too
  pageSize: 12,               // the limit (default 20)
  currentPage: 1,             // 1-based
})
```

- **Sortable fields:** `name`, `position`, `price` and `relevance`. Magento
  can't sort on any other field.
- **Several keys** apply in order: `{ price: 'DESC', name: 'ASC' }`.
- **`relevance`** only means something together with `search`.
- **`position`** is the order set in the category's admin page. Use it with a
  `category_uid` filter.
- **Errors:** a direction other than ASC/DESC, or a field name that isn't a
  plain identifier, throws before anything is sent.
- **Page size:** keep it modest (a few dozen). Large pages make Magento
  slow, and a `currentPage` beyond the last page is an error.

`content.search(query, { sort, pageSize, currentPage, filter })` takes the
same `sort` format.

## Any other storefront query

`store.queryField(field, args, { fields })` runs any root query on Magento's
GraphQL schema:

```ts
// Categories
const tree = await magento.store.queryField('categories', {
  filters: { parent_id: { eq: '2' } },      // categories uses "filters", products uses "filter"
  pageSize: 50,
}, { fields: [{ items: ['uid', 'name', 'url_key', 'product_count', { children: ['uid', 'name'] }] }, 'total_count'] })

// Store configuration
await magento.store.queryField('storeConfig', {}, { fields: ['store_name', 'base_currency_code'] })
```

`queryField` sends arguments as GraphQL literals, which has two consequences:

- **Enum values** (such as `ASC`) must be written as `'ENUM:ASC'`. Otherwise
  they're sent as quoted strings and Magento rejects them.
  `getProducts`/`getProductsPage` add the prefix for you.
- **Other values stay quoted**, including user input that looks like an enum.
  A filter value can't change the query.

`store.mutateEntity(mutation, args, { fields })` runs a GraphQL mutation the
same way.

Don't use `store.readEntity`. It guesses singular root fields
(`Product`, `Mage_Product`) that Magento's schema doesn't have, so it always
throws.

## Create, update, delete (CRUD)

Magento's public storefront is read-only. Every write goes through the REST
API with the **Magento Integration**, set by four env vars on the server:
`MAGENTO_CONSUMER_KEY`, `MAGENTO_CONSUMER_SECRET`, `MAGENTO_ACCESS_TOKEN` and
`MAGENTO_ACCESS_TOKEN_SECRET`. Never call these from the browser. Put them in
a server route that checks the caller first (`requireAdmin(event)`, or the
seller's own session).

```ts
// server/api/… — credentials straight from the env (never runtime config)
import { MagentoAdapter } from '@mframework/adapter-magento'

const magento = new MagentoAdapter(useRuntimeConfig().public.magento.endpoint)
const credentials = {
  consumerKey: process.env.MAGENTO_CONSUMER_KEY!,
  consumerSecret: process.env.MAGENTO_CONSUMER_SECRET!,
  accessToken: process.env.MAGENTO_ACCESS_TOKEN!,
  accessTokenSecret: process.env.MAGENTO_ACCESS_TOKEN_SECRET!,
}
```

The Integration can only do what its API resources allow. Set them in the
Magento admin under System → Integrations → the integration → API. Each
section below lists what it needs.

### Products (marketplace sellers)

Products belong to a Webkul seller, so every write names the seller's
Magento customer id. These calls need `Meeovi_MarketplaceApi` resources.

```ts
// Create, or update by SKU (an upsert)
const { product_id, sku } = await magento.catalogSync.upsertProduct(credentials, {
  customerId: 113,                 // the seller
  sku: 'habit-tracker-pro',
  name: 'Habit Tracker Pro',
  price: 9.99,
  description: '<p>…</p>',
  qty: 100,
  categoryIds: [12],
  enabled: true,
})

// Stock, price, on/off
await magento.catalogSync.updateStock(credentials, { customerId: 113, sku: 'habit-tracker-pro', qty: 40, price: 7.99 })

// "Delete": take it off sale. There's no hard delete, so orders keep their products.
await magento.catalogSync.updateStock(credentials, { customerId: 113, sku: 'habit-tracker-pro', qty: 0, enabled: false })

// Images (base64)
await magento.catalogSync.addImage(credentials, {
  customerId: 113, sku: 'habit-tracker-pro', base64Content, mimeType: 'image/png', fileName: 'cover.png', isMain: true,
})

// Read a seller's products
await magento.seller.getSellerProducts(113, credentials)
```

A seller can also create their own product with their customer token,
without the Integration: `magento.seller.createProduct(customerId, customerToken, { sku, name, price, … })`.

### Customers

These calls need `Magento_Customer::customer` (read), `::manage` (create and
edit) and `::delete`.

```ts
const { items, total_count } = await magento.admin.customers(credentials, 100)   // newest first
const customer = await magento.admin.customer(credentials, 113)

await magento.admin.createCustomer(credentials, { email, firstname, lastname, website_id: 1, group_id: 1 })

// Magento's PUT replaces the whole customer: read it, change it, send all of it back.
await magento.admin.saveCustomer(credentials, 113, { ...customer, lastname: 'New' })

await magento.admin.deleteCustomer(credentials, 113)
```

The commerce backend wraps these as table operations. This is what
meeovi-tables uses in `/workspace`. It only accepts the admin fields (email,
names, group), and it handles the read-then-replace for you:

```ts
const backend = CommerceBackendRegistry.get('magento')     // on the server, with the Integration
await backend.schema('customers')                           // column definitions
await backend.request({ method: 'GET', collection: 'customers' })
await backend.create('customers', { email, firstname, lastname })
await backend.update('customers', 113, { lastname: 'New' })
await backend.remove('customers', 113)
```

In the app, removing a customer linked to a Meeovi account is refused by
layers/commerce's store-admin guard.

### Orders and refunds

These calls need `Magento_Sales::actions_view` (read),
`::sales_creditmemo` (list credit memos) and `::creditmemo` (refund).

```ts
// REST searchCriteria filters: AND across entries; condition defaults to 'eq'
const { items } = await magento.admin.orders(credentials, [
  { field: 'status', value: 'complete' },
  { field: 'created_at', value: '2026-10-01', condition: 'gteq' },
], 50)
const order = await magento.admin.order(credentials, 3)

// Offline credit memo for some lines (the money itself is refunded through Stripe by the app)
await magento.admin.refundOrder(credentials, 3, { items: [{ order_item_id: 7, qty: 1 }], comment: 'Customer request' })

// Ship
await magento.catalogSync.shipOrder(credentials, 3, {
  items: [{ order_item_id: 7, qty: 1 }],
  tracks: [{ track_number: '1Z…', title: 'UPS', carrier_code: 'ups' }],
})
```

Conditions are Magento's: `eq`, `neq`, `like` (with `%`), `in` (a
comma-separated value), `gt`, `gteq`, `lt`, `lteq`, `null` and `notnull`.

Through the commerce backend:
- `backend.adminOrder(id)` returns what's left to refund on each line.
- `backend.orderByReference('pi_…')` finds an order by its Stripe payment.
- `backend.refundOrder({ orderId, items?, comment? })` refunds everything
  left when you leave out `items`.

Orders placed with the app's Stripe checkout are created by
`magento.marketplaceOrders.placeOrder(...)`. That call is idempotent on the
Stripe payment id.

### Gift cards

Gift cards come from the Ecomteck_GiftCard extension. They need the
`Meeovi_GiftCards` Magento module (see its
[README](magento-module/Meeovi/GiftCards/README.md)) and the
`Meeovi_GiftCards::read` resource on the Integration. All three calls are
read-only.

```ts
await magento.giftCards.productSkus(credentials)          // ['gc-25', …]
await magento.giftCards.received(credentials, email)      // cards sent to that email
await magento.giftCards.purchased(credentials, 113)       // cards on that customer's orders

// Through the commerce backend (normalized products, BackendGiftCard rows):
await backend.giftCardProducts()
await backend.receivedGiftCards(email)
await backend.purchasedGiftCards('113')
```

Pass only the signed-in user's own verified email and customer id. In the
app, `/api/commerce/wishes/mine` does this for you.

## Errors and gotchas

- **401 "The consumer isn't authorized"**: the Integration lacks an API
  resource. Add it under System → Integrations → API.
- **Empty `items` with no error**: the filter matched nothing. Common causes:
  - a product that isn't visible in search;
  - a product that isn't on the store view (`storeCode`);
  - a product that is disabled or out of stock (depending on the store's
    configuration).
- **`Field "x" is not defined by type "ProductAttributeFilterInput"`**: the
  attribute isn't filterable. See [Filtering](#which-attributes-you-can-filter-on).
- **Use a different `MagentoAdapter` per store view**:
  `new MagentoAdapter(endpoint, 'store_code')`.
- **After changing `src/`, rebuild `dist/`**, because apps load `dist/`. See
  "Store admin" in the [README](README.md).

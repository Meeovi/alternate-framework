bash

# @mframework/adapter-magento

A fully‑typed, secure, Shopify‑style Magento integration for Nuxt 3.

## Features

- 🔥 REST & GraphQL providers  
- 🔒 Secure customer authentication (integrated with `alternate-auth`)  
- 🛒 Cart composables  
- 👤 Customer composables  
- 🧩 Typed product/category/cart models  
- 🧠 Normalizers for consistent data shapes  
- 🧰 REST search criteria helpers  
- 🧬 GraphQL query builders  
- 🧱 Server‑side token handling (HttpOnly cookies)  
- 🛡️ Middleware protection for customer/cart routes  

Designed for production marketplaces, storefronts, and headless Magento builds.

---

## 🚀 Installation

```bash
pnpm add @mframework/adapter-magento
```

Or inside a monorepo:

```text
packages/
  magento/
apps/
  frontend/
```

## 🧩 Usage

Add to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: [
    '@mframework/adapter-magento',
    '@mframework/alternate-auth'
  ],
  magento: {
    url: process.env.MAGENTO_URL,
    token: process.env.MAGENTO_ADMIN_TOKEN,
    provider: 'rest' // or 'graphql'
  }
})
```

## 🛒 Products

### REST

```ts
const { list, get } = useMagentoProducts()

const products = await list({
  filters: [{ field: 'sku', value: 'TSHIRT-RED' }]
})

const product = await get('TSHIRT-RED')
```

### GraphQL

```ts
const { list } = useMagentoGraphQLProducts()
const products = await list({ search: 'shirt' })
```

## 🧠 Search Criteria Helpers (REST)

```ts
import { buildSearchCriteria } from '#magento/server'

const criteria = buildSearchCriteria({
  filters: [{ field: 'color', value: 'Red' }],
  page: 1,
  pageSize: 20
})

const products = await list(criteria)
```

## 🧬 GraphQL Query Builders

```ts
import { PRODUCTS_QUERY, buildProductsVariables } from '#magento/server'

const result = await query(PRODUCTS_QUERY, buildProductsVariables({
  search: 'hoodie'
}))
```

## 🛍️ Cart

```ts
const cart = useMagentoCart()

await cart.create()
await cart.addItem('TSHIRT-RED', 2)

const current = await cart.get()
```

## 🔒 Customer Authentication (Integrated with alternate-auth)

```ts
const customerAuth = useMagentoCustomerAuth()

await customerAuth.signIn('john@example.com', 'password123')
console.log(customerAuth.customer.value)
await customerAuth.signOut()
```

Magento customer tokens are stored in HttpOnly cookies and never exposed to the client.

## 🛡️ Security

- Customer token stored in HttpOnly cookie
- Admin token never exposed to client
- Customer/cart routes protected by middleware
- Magento client switches context (admin → customer) automatically
- All sensitive operations run server‑side

## 📁 Folder Structure

```text
runtime/
  plugin.ts
  composables/
  server/
    api/
    utils/
    normalizers/
```

## 🧪 Playground

A full Nuxt playground is included in `/playground` for local testing.

Run:

```bash
pnpm --filter playground dev
```

## 📝 License

MIT © Meeovi
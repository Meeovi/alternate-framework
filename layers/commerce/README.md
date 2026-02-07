# @mframework/commerce

A backend‑agnostic commerce domain module for the Meeovi ecosystem.  
This package provides a unified interface for products, categories, carts, and other commerce operations — regardless of the underlying backend (Directus, Medusa, Shopify, custom APIs, etc.).

## ✨ Features

- Pluggable provider architecture  
- Unified composables (`useProducts`, `useCart`, `useCategories`)  
- Backend‑agnostic types  
- Runtime configuration  
- Zero Nuxt dependency  
- Works in any JS/TS environment  

## 📦 Installation

```sh
npm install @mframework/commerce

⚙️ Configuration
Configure the active providers at runtime:


import { setCommerceConfig } from '@mframework/commerce'

setCommerceConfig({
  productProvider: 'directus',
  cartProvider: 'directus',
  categoryProvider: 'directus'
})

🧩 Usage

import { useProducts } from '@mframework/commerce'

const { listProducts, getProduct } = useProducts()

const products = await listProducts()
const product = await getProduct('123')
🔌 Providers
A provider implements one or more domain interfaces:


export interface ProductProvider {
  getProduct(id: string): Promise<Product>
  listProducts(params?: any): Promise<Product[]>
}
Register a provider:


import { registerProductProvider } from '@mframework/commerce'

registerProductProvider('directus', {
  getProduct: async (id) => { ... },
  listProducts: async () => { ... }
})

### Registering domain providers from an adapter

Adapter packages can register domain-specific implementations at runtime. Import the runtime helpers from the layer package and call them from your adapter plugin entry:

```ts
import {
  registerProductProvider,
  registerEventProviderRuntime,
  registerGiftCardProviderRuntime,
  registerSubscriptionProviderRuntime
} from '@mframework/commerce'

registerProductProvider('my-adapter', {
  getProduct: async (id) => { /* ... */ },
  listProducts: async (params) => { /* ... */ }
})

registerEventProviderRuntime('my-adapter', {
  getEvent: async (id) => { /* ... */ },
  listEvents: async () => { /* ... */ }
})

registerGiftCardProviderRuntime('my-adapter', {
  getGiftCard: async (id) => { /* ... */ },
  listGiftCards: async () => { /* ... */ },
  redeemGiftCard: async (code) => ({ success: true })
})

registerSubscriptionProviderRuntime('my-adapter', {
  getSubscription: async (id) => { /* ... */ },
  listSubscriptions: async () => { /* ... */ },
  subscribe: async (payload) => ({ success: true })
})
```

🧱 Folder Structure
Code
src/
  products/
  cart/
  categories/
  config.
  registry.
  useCommerce.
# @meeovi/commerce

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
npm install @meeovi/commerce

⚙️ Configuration
Configure the active providers at runtime:


import { setCommerceConfig } from '@meeovi/commerce'

setCommerceConfig({
  productProvider: 'directus',
  cartProvider: 'directus',
  categoryProvider: 'directus'
})

🧩 Usage

import { useProducts } from '@meeovi/commerce'

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


import { registerProductProvider } from '@meeovi/commerce'

registerProductProvider('directus', {
  getProduct: async (id) => { ... },
  listProducts: async () => { ... }
})

🧱 Folder Structure
Code
src/
  products/
  cart/
  categories/
  config.
  registry.
  useCommerce.
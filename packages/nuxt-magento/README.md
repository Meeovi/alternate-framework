# nuxt-magento

A Nuxt module that integrates [Magento 2 GraphQL](https://developer.adobe.com/commerce/webapi/graphql/) into your Nuxt application.  
It provides a preconfigured GraphQL client via Nuxt’s injection system and composables for common e‑commerce flows (products, cart, checkout, customer auth).

---

## 🚀 Features
- Injects a Magento GraphQL client into your Nuxt app (`$magento`).
- Configurable endpoint and token via `nuxt.config.ts`.
- Provides composables for:
  - Product search (`useProductSearch`)
  - Cart management (`useCart`)
  - Customer authentication (`useCustomerAuth`)
  - Checkout (`useCheckout`)
- Secure by default: runtime config, no secrets hardcoded.

---

## Usage

# Product Search
<script setup lang="ts">
const { searchProducts } = useProductSearch()
const products = ref([])

onMounted(async () => {
  products.value = await searchProducts('shoes')
})
</script>

<template>
  <ul>
    <li v-for="p in products" :key="p.id">
      {{ p.name }} - {{ p.price_range.minimum_price.regular_price.value }}
      {{ p.price_range.minimum_price.regular_price.currency }}
    </li>
  </ul>
</template>

# Cart Management
<script setup lang="ts">
const { createCart, addToCart } = useCart()
const cartId = ref('')
const cart = ref(null)

onMounted(async () => {
  cartId.value = await createCart()
  cart.value = await addToCart(cartId.value, 'SKU123', 2)
})
</script>

<template>
  <div>
    <h3>Cart Items</h3>
    <ul>
      <li v-for="item in cart.items" :key="item.product.sku">
        {{ item.product.name }} (x{{ item.quantity }})
      </li>
    </ul>
  </div>
</template>

# Customer Authentication
<script setup lang="ts">
const { login, register } = useCustomerAuth()
const token = ref('')

const doLogin = async () => {
  token.value = await login('user@example.com', 'password123')
}

const doRegister = async () => {
  const customer = await register('new@example.com', 'password123', 'Jane', 'Doe')
  console.log(customer)
}
</script>

<template>
  <button @click="doLogin">Login</button>
  <button @click="doRegister">Register</button>
</template>

# Checkout
<script setup lang="ts">
const { setShipping, placeOrder } = useCheckout()
const order = ref(null)

const checkout = async () => {
  const cartId = 'abc123'
  await setShipping(cartId, {
    firstname: 'Jane',
    lastname: 'Doe',
    street: ['123 Main St'],
    city: 'London',
    postcode: 'SW1A 1AA',
    country_code: 'GB'
  })

  order.value = await placeOrder(cartId, {
    code: 'checkmo' // example payment method
  })
}
</script>

<template>
  <button @click="checkout">Place Order</button>
  <p v-if="order">Order #{{ order.order_number }} placed successfully!</p>
</template>

---

## 📦 Installation

Add the module to your project:

```bash
pnpm add nuxt-magento
# or
npm install nuxt-magento
```

Then, add it to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-magento'],
  magento: {
    endpoint: 'https://store.example.com/graphql',
    token: process.env.MAGENTO_TOKEN // optional integration token
  }
  },
});
```
---

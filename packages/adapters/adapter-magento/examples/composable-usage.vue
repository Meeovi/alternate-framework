// Example Composable Usage in Vue Components
// This shows how to use the Magento adapter through the commerce layer
// Copy this pattern to your actual Vue components in a Nuxt app

// NOTE: This is an EXAMPLE file for reference only
// It will show TypeScript errors because it's outside a Nuxt context

<script setup lang="ts">
// Import commerce composables
// These are provided by the commerce layer and work with any adapter
// In your actual app, these imports work automatically via Nuxt auto-imports
const { 
  useProducts, 
  useCategories, 
  useCart 
} = await import('#imports')

// Use products
const { listProducts, getProduct, loading, error } = useProducts()

// Fetch all products
const products = await listProducts({ limit: 20, page: 1 })

// Get a specific product by slug or SKU
const product = await getProduct('product-slug')

// Use categories
const { getCategoryTree, getCategory } = useCategories()

const categoryTree = await getCategoryTree()
const category = await getCategory('category-id')

// Use cart
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeCartItem, 
  clearCart 
} = useCart()

// Get current cart
const cartId = useCookie('cart_id')
const cart = await getCart(cartId.value)

// Add item to cart
const updatedCart = await addToCart(cartId.value, 'product-sku', 2)

// Update cart item quantity
await updateCartItem(cartId.value, 'item-uid', 3)

// Remove item from cart
await removeCartItem(cartId.value, 'item-uid')

// Clear cart
await clearCart(cartId.value)
</script>

<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div v-for="product in products" :key="product.id">
        <h3>{{ product.name }}</h3>
        <p>{{ product.price.amount }} {{ product.price.currency }}</p>
      </div>
    </div>
  </div>
</template>

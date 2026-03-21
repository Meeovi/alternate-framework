# Commerce Layer Integration Guide

This guide shows how to integrate the Magento adapter with `layers/commerce` for a seamless plug-and-play experience.

## Architecture Overview

```
Your App
├── layers/commerce/           # Commerce domain layer
│   ├── app/
│   │   └── composables/      # useProducts, useCart, etc.
│   ├── server/
│   │   └── plugins/
│   │       └── magento.server.ts  # Register Magento providers
│   └── types/                # Commerce interfaces
└── packages/adapters/
    └── adapter-magento/      # Magento GraphQL implementation
        └── src/
            ├── adapter/      # Core adapter logic
            ├── runtime.ts    # Provider registration helpers
            └── mappers/      # Magento → Commerce type mapping
```

## Integration Steps

### 1. Create the Server Plugin

Create `layers/commerce/server/plugins/magento.server.ts`:

```typescript
import { defineNitroPlugin } from 'nitropack/runtime'

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig()
  
  // Check if Magento is configured
  if (!config.public?.magento?.endpoint) {
    console.log('ℹ Magento adapter not configured')
    return
  }

  try {
    // Import Magento adapter
    const { registerMagentoProvidersRuntime } = require('@mframework/adapter-magento')
    
    // Import commerce layer registrars
    const {
      registerProductProvider,
      registerCategoryProvider,
      registerCartProvider,
    } = require('#imports')

    // Register Magento as a provider
    registerMagentoProvidersRuntime(
      'magento', // Provider name
      {
        // Magento configuration
        endpoint: config.public.magento.endpoint,
        accessToken: config.magento?.accessToken,
        timeoutMs: config.magento?.timeoutMs || 5000,
        
        // Optional: Custom cart ID management
        getCartId: async () => {
          // Return stored cart ID
          // This is called server-side, so implement accordingly
          return null
        },
        setCartId: async (cartId: string) => {
          // Store cart ID
          // This is called server-side
        },
      },
      {
        // Pass registrar functions from commerce layer
        registerProductProvider,
        registerCategoryProvider,
        registerCartProvider,
      }
    )

    console.log('✓ Magento adapter registered successfully')
  } catch (error) {
    console.error('Failed to register Magento adapter:', error)
  }
})
```

### 2. Configure Runtime Config

Update your app's `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  // Extend the commerce layer
  extends: ['./layers/commerce'],
  
  runtimeConfig: {
    // Server-only configuration
    magento: {
      accessToken: process.env.MAGENTO_ACCESS_TOKEN || '',
      timeoutMs: 5000,
    },
    
    // Public configuration (available on client)
    public: {
      magento: {
        endpoint: process.env.MAGENTO_GRAPHQL_ENDPOINT,
      },
      
      // Configure which provider to use for each domain
      commerce: {
        productProvider: 'magento',
        categoryProvider: 'magento',
        cartProvider: 'magento',
      },
    },
  },
})
```

### 3. Set Environment Variables

Create `.env`:

```env
MAGENTO_GRAPHQL_ENDPOINT=https://your-magento-store.com/graphql
MAGENTO_ACCESS_TOKEN=your-optional-token
```

## Using Commerce Composables

Once integrated, use the commerce layer composables in your components:

### Product Listing

```vue
<script setup lang="ts">
// Commerce composables work with any backend (Magento, Shopify, etc.)
const { listProducts, loading, error } = useProducts()

const products = ref([])

onMounted(async () => {
  const result = await listProducts({
    search: '',
    categoryId: null,
    limit: 20,
    page: 1,
  })
  
  products.value = result.items
})
</script>

<template>
  <div>
    <div v-if="loading">Loading products...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else>
      <ProductCard 
        v-for="product in products" 
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>
```

### Product Detail Page

```vue
<script setup lang="ts">
const route = useRoute()
const { getProduct } = useProducts()
const { addToCart } = useCart()

const product = ref(null)
const cartId = useCookie('magento_cart_id')

onMounted(async () => {
  product.value = await getProduct(route.params.slug)
})

async function handleAddToCart() {
  try {
    const updatedCart = await addToCart(
      cartId.value,
      product.value.sku,
      1
    )
    
    // Update cart ID if it was created
    if (updatedCart?.id) {
      cartId.value = updatedCart.id
    }
    
    // Show success message
    useToast().success('Added to cart!')
  } catch (error) {
    useToast().error('Failed to add to cart')
  }
}
</script>

<template>
  <div v-if="product">
    <h1>{{ product.name }}</h1>
    <div v-html="product.description" />
    <p>{{ product.price.amount }} {{ product.price.currency }}</p>
    <button @click="handleAddToCart">Add to Cart</button>
  </div>
</template>
```

### Shopping Cart

```vue
<script setup lang="ts">
const { getCart, updateCartItem, removeCartItem } = useCart()
const cartId = useCookie('magento_cart_id')

const cart = ref(null)

async function loadCart() {
  if (cartId.value) {
    cart.value = await getCart(cartId.value)
  }
}

async function updateQuantity(itemId: string, quantity: number) {
  if (quantity === 0) {
    await removeCartItem(cartId.value, itemId)
  } else {
    await updateCartItem(cartId.value, itemId, quantity)
  }
  await loadCart()
}

onMounted(loadCart)
</script>

<template>
  <div v-if="cart">
    <h2>Shopping Cart</h2>
    <div v-for="item in cart.items" :key="item.id">
      <p>{{ item.productId }}</p>
      <input 
        type="number" 
        :value="item.quantity"
        @change="updateQuantity(item.id, $event.target.value)"
      />
      <p>{{ item.price.amount }} {{ item.price.currency }}</p>
    </div>
    <p>Total: {{ cart.total.amount }} {{ cart.total.currency }}</p>
  </div>
</template>
```

### Category Navigation

```vue
<script setup lang="ts">
const { getCategoryTree } = useCategories()

const categories = ref([])

onMounted(async () => {
  categories.value = await getCategoryTree()
})
</script>

<template>
  <nav>
    <ul>
      <li v-for="category in categories" :key="category.id">
        <NuxtLink :to="`/category/${category.slug}`">
          {{ category.name }}
        </NuxtLink>
        <ul v-if="category.children?.length">
          <li v-for="child in category.children" :key="child.id">
            <NuxtLink :to="`/category/${child.slug}`">
              {{ child.name }}
            </NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>
```

## Advanced: Multiple Providers

You can register multiple backends and switch between them:

```typescript
// In server plugin
registerMagentoProvidersRuntime('magento', magentoConfig, registrars)
registerShopifyProvidersRuntime('shopify', shopifyConfig, registrars)

// In nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      commerce: {
        // Use Magento for products, Shopify for cart
        productProvider: 'magento',
        cartProvider: 'shopify',
      },
    },
  },
})
```

## Benefits of This Architecture

1. **Backend Agnostic** - Switch from Magento to Shopify without changing component code
2. **Type Safe** - Full TypeScript support across all layers
3. **Modular** - Easy to add new providers or extend existing ones
4. **Testable** - Mock providers for testing without hitting real APIs
5. **Maintainable** - Clear separation between domain logic and backend implementation

## Troubleshooting

### "Provider not registered" error

Ensure:
1. The server plugin is in the correct location
2. Environment variables are set
3. The adapter package is installed
4. The commerce layer has the registrar functions exported

### Types not matching

Run codegen in the adapter:
```bash
cd packages/adapters/adapter-magento
npm run codegen
npm run build
```

### Cart ID persistence issues

Implement proper cart ID storage:

```typescript
// In server plugin
getCartId: async () => {
  // Use appropriate storage based on your setup
  const event = useEvent()
  return getCookie(event, 'magento_cart_id') || null
},
setCartId: async (cartId: string) => {
  const event = useEvent()
  setCookie(event, 'magento_cart_id', cartId, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
},
```

## Next Steps

- Implement caching strategies for product data
- Add search functionality
- Implement customer authentication flow
- Set up checkout process
- Add order management

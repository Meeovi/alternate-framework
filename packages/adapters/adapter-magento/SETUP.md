# Magento Adapter Setup Guide

## Prerequisites

1. Magento 2.3+ instance with GraphQL enabled
2. Node.js 18+ or a custom fetch implementation
3. Commerce layer installed in your project

## Installation Steps

### 1. Install the adapter

```bash
cd packages/adapters/adapter-magento
npm install
```

### 2. Generate GraphQL Types

The adapter needs to generate TypeScript types from Magento GraphQL schema:

```bash
npm run codegen
```

This will:
- Read the Magento GraphQL schema from `schema.graphql`
- Parse query documents from `src/client/queries.graphql`
- Generate TypeScript types and SDK in `src/client/sdk.ts`

### 3. Build the adapter

```bash
npm run build
```

### 4. Configure your application

#### Option A: Using with layers/commerce (Recommended)

1. Copy the example plugin to your commerce layer:

```bash
cp examples/nuxt-plugin.server.ts ../../layers/commerce/server/plugins/magento.server.ts
```

2. Update your app's `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  extends: ['./layers/commerce'],
  
  runtimeConfig: {
    magento: {
      accessToken: process.env.MAGENTO_ACCESS_TOKEN || '',
    },
    public: {
      magento: {
        endpoint: process.env.MAGENTO_GRAPHQL_ENDPOINT,
      },
      commerce: {
        productProvider: 'magento',
        categoryProvider: 'magento',
        cartProvider: 'magento',
      },
    },
  },
})
```

3. Create `.env` file in your app root:

```env
MAGENTO_GRAPHQL_ENDPOINT=https://your-magento-store.com/graphql
MAGENTO_ACCESS_TOKEN=your-token-if-needed
```

#### Option B: Direct usage (without commerce layer)

```typescript
import { createMagentoCommerceAdapter } from '@mframework/adapter-magento'

const adapter = createMagentoCommerceAdapter({
  endpoint: 'https://your-store.com/graphql',
  accessToken: 'optional-token',
  timeoutMs: 5000,
})

// Use adapter methods
const product = await adapter.getProductBySlug('product-slug')
const products = await adapter.getProducts({ limit: 20 })
```

## Usage Examples

### Fetching Products

```typescript
// In a Vue component or composable
const { listProducts } = useProducts()

const result = await listProducts({
  search: 'laptop',
  categoryId: 'electronics-uid',
  limit: 20,
  page: 1,
})

console.log(result.items)    // Array of products
console.log(result.total)    // Total count
console.log(result.page)     // Current page
console.log(result.totalPages) // Total pages
```

### Managing Cart

```typescript
const { getCart, addToCart, updateCartItem } = useCart()

// Get or create cart ID
const cartId = useCookie('magento_cart_id')

// Get cart
const cart = await getCart(cartId.value)

// Add item
const updatedCart = await addToCart(cartId.value, 'PRODUCT-SKU', 2)

// Update item quantity
await updateCartItem(cartId.value, 'item-uid', 3)
```

### Category Navigation

```typescript
const { getCategoryTree, getCategory } = useCategories()

// Get full category tree
const tree = await getCategoryTree()

// Get specific category
const category = await getCategory('category-uid')
```

## Development

### Watch mode for GraphQL changes

```bash
npm run dev
```

This watches for changes to GraphQL queries and regenerates types automatically.

### Type checking

```bash
npm run typecheck
```

## Customization

### Adding Custom Queries

1. Add your query to `src/client/queries.graphql`:

```graphql
query GetProductReviews($sku: String!) {
  products(filter: { sku: { eq: $sku } }) {
    items {
      reviews {
        items {
          summary
          text
          average_rating
        }
      }
    }
  }
}
```

2. Regenerate types:

```bash
npm run codegen
```

3. Use in your adapter:

```typescript
const reviews = await client.GetProductReviews({ sku: 'PRODUCT-SKU' })
```

### Extending Mappers

Customize how Magento data maps to commerce types in `src/mappers/`:

```typescript
// src/mappers/product.ts
export function mapMagentoProduct(product: ProductInterface): CommerceProduct {
  return {
    id: product.uid,
    name: product.name,
    // Add custom fields
    customField: product.custom_attribute?.value,
  }
}
```

## Troubleshooting

### Schema Updates

If Magento schema changes:

1. Update `schema.graphql` with the new schema
2. Run `npm run codegen`
3. Rebuild: `npm run build`

### CORS Issues

Ensure your Magento instance allows your domain:

1. In Magento admin: Stores → Configuration → General → Web
2. Add your domain to allowed origins
3. Or configure via `.htaccess` or Nginx

### Performance

For production:
- Enable GraphQL query caching in Magento
- Implement response caching in your app
- Use CDN for product images
- Consider implementing pagination for large catalogs

## Next Steps

- Review `examples/` directory for more usage patterns
- Check the main README for API documentation
- Explore the commerce layer documentation
- Set up error monitoring and logging

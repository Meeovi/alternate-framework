# Adapter Swappability Migration Guide

**How to refactor existing adapters to follow the adapter-starter pattern**

---

## Overview

This guide explains how to refactor non-compliant adapters to support provider-neutral swappability.

**Goal:** Same app code works with any swappable adapter without changes.

**Example:**
```typescript
// Before: adapter-specific code
import { directus, readItem } from '@mframework/adapter-directus'
const item = await readItem('products', 123)

// After: provider-neutral code (works with ANY adapter)
import { useContent } from '@mframework/gateway'
const { readItem } = useContent()
const item = await readItem('products', 123)
```

---

## Refactoring Checklist

For each adapter, follow these steps:

- [ ] **Analyze:** Understand current structure and dependencies
- [ ] **Plan:** Identify layers (auth, commerce, search, content, etc.)
- [ ] **Implement:** Create TransportAdapter, layer adapters, installer
- [ ] **Test:** Verify functionality with tests
- [ ] **Migrate:** Update consumer code to use new exports
- [ ] **Validate:** Smoke tests in actual applications

---

## Detailed Refactoring Examples

### Example 1: Refactoring adapter-directus

#### Current State

**Exports:**
- `DirectusVueProvider`, `useDirectus()` (Vue bindings)
- `DirectusReactProvider`, `useDirectus()` (React bindings)
- Raw SDK: `readItem`, `createItem`, `updateItem`, `deleteItem` from @directus/sdk

**Problems:**
- SDK imports leak into app code
- Framework-specific bindings tie it to Vue/React
- No abstraction layer; hard to swap

#### Target State

Implement `ContentAdapter` interface with TransportAdapter abstraction.

#### Migration Steps

**Step 1: Create src/transport.ts**

```typescript
// packages/adapters/adapter-directus/src/transport.ts

import type { TransportAdapter, RequestOptions, APIResponse } from 'alternate-gateway'
import { createDirectus, rest } from '@directus/sdk'

export interface DirectusTransportConfig {
  url: string
  token?: string
  email?: string
  password?: string
}

export const createDirectusTransport = (config: DirectusTransportConfig): TransportAdapter => {
  const client = createDirectus(config.url).with(rest())

  return {
    async request<T>(method: string, path: string | URL, options: RequestOptions = {}): Promise<APIResponse<T>> {
      try {
        // Build URL
        const fullPath = typeof path === 'string' 
          ? `${config.url}${path}` 
          : path.toString()
        
        const url = new URL(fullPath)
        
        // Add query parameters
        if (options.query) {
          Object.entries(options.query).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              url.searchParams.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
            }
          })
        }

        // Use Directus SDK client
        const response = await fetch(url.toString(), {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(config.token ? { 'Authorization': `Bearer ${config.token}` } : {}),
            ...(options.headers || {})
          },
          body: options.body ? JSON.stringify(options.body) : undefined
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          return {
            status: response.status,
            data: null as any as T,
            error: data?.errors?.[0]?.message || 'Unknown error'
          }
        }

        return { status: response.status, data }
      } catch (error: any) {
        return {
          status: 500,
          data: null as any as T,
          error: error.message || 'Transport error'
        }
      }
    }
  }
}
```

**Step 2: Create src/content.ts (new layer adapter)**

```typescript
// packages/adapters/adapter-directus/src/content.ts

import type { TransportAdapter } from 'alternate-gateway'

// Define ContentAdapter interface (if not already exists)
export interface ContentAdapter {
  readItems(collection: string, options?: any): Promise<any>
  readItem(collection: string, id: string | number, options?: any): Promise<any>
  createItem(collection: string, data: any): Promise<any>
  updateItem(collection: string, id: string | number, data: any): Promise<any>
  deleteItem(collection: string, id: string | number): Promise<any>
  readFieldsByCollection(collection: string): Promise<any>
  uploadFiles(files: FormData): Promise<any>
  getAssetUrl(fileId: string, options?: any): string
}

export const createDirectusContentAdapter = (transport: TransportAdapter): ContentAdapter => ({
  async readItems(collection: string, options: any = {}) {
    const res = await transport.request('/items/' + collection, 'GET', { query: options })
    if (res.error) throw new Error(res.error)
    return res.data?.data || []
  },

  async readItem(collection: string, id: string | number, options: any = {}) {
    const res = await transport.request(`/items/${collection}/${id}`, 'GET', { query: options })
    if (res.error) throw new Error(res.error)
    return res.data?.data
  },

  async createItem(collection: string, data: any) {
    const res = await transport.request(`/items/${collection}`, 'POST', { body: data })
    if (res.error) throw new Error(res.error)
    return res.data?.data
  },

  async updateItem(collection: string, id: string | number, data: any) {
    const res = await transport.request(`/items/${collection}/${id}`, 'PATCH', { body: data })
    if (res.error) throw new Error(res.error)
    return res.data?.data
  },

  async deleteItem(collection: string, id: string | number) {
    const res = await transport.request(`/items/${collection}/${id}`, 'DELETE')
    if (res.error) throw new Error(res.error)
    return true
  },

  async readFieldsByCollection(collection: string) {
    const res = await transport.request(`/fields/${collection}`, 'GET')
    if (res.error) throw new Error(res.error)
    return res.data?.data || []
  },

  async uploadFiles(files: FormData) {
    const res = await transport.request('/files', 'POST', { body: files })
    if (res.error) throw new Error(res.error)
    return res.data?.data
  },

  getAssetUrl(fileId: string, options: any = {}): string {
    const baseUrl = new URL(this.config.url).origin
    return `${baseUrl}/assets/${fileId}`
  }
})
```

**Step 3: Update src/index.ts**

```typescript
// packages/adapters/adapter-directus/src/index.ts

import { createDirectusTransport, type DirectusTransportConfig } from './transport'
import { createDirectusContentAdapter } from './content'
import { 
  createAdapterInstaller,
  defineAdapterLayerFactories,
} from './patterns'

export type DirectusAdapterOptions = DirectusTransportConfig

// Define layer factories
const directusLayerFactories = defineAdapterLayerFactories({
  content: createDirectusContentAdapter,
})

// Create installer
export const installDirectusAdapter = createAdapterInstaller(
  createDirectusTransport,
  directusLayerFactories,
)

// Optional: Class-based wrapper for convenience
export class DirectusAdapter {
  constructor(private config: DirectusAdapterOptions) {}

  async getContent() {
    const transport = createDirectusTransport(this.config)
    return createDirectusContentAdapter(transport)
  }
}

// Re-export old SDK methods for backward compatibility (DEPRECATED)
export { createDirectus, rest, readItem, createItem, updateItem, deleteItem } from '@directus/sdk'
```

**Step 4: Remove Vue/React bindings from main exports**

Delete or move to separate files:
- `src/vue/DirectusProvider` → Optional separate export
- `src/react/DirectusReactProvider` → Optional separate export

**Step 5: Update package.json**

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./vue": {
      "import": "./dist/vue.js",
      "types": "./dist/vue.d.ts"
    }
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

#### Migration in App Code

**Before:**
```typescript
// app code using adapter-directus directly
import { useDirectus, readItem } from '@mframework/adapter-directus'

const { directus } = useDirectus()
const item = await readItem('products', 123)
```

**After:**
```typescript
// nuxt.config.ts
import { installDirectusAdapter } from '@mframework/adapter-directus'

installDirectusAdapter({
  url: process.env.DIRECTUS_URL,
  token: process.env.DIRECTUS_TOKEN
})

// app code (provider-neutral)
import { useContent } from '@mframework/gateway'

export const useProducts = async () => {
  const { readItem } = useContent()
  const item = await readItem('products', 123)
  return item
}
```

**Benefit:** Now you can swap `adapter-postgres`, `adapter-mongodb`, `adapter-fauna` etc. without changing app code.

---

### Example 2: Refactoring adapter-magento

#### Current State

**Structure:**
- Nuxt module with hardcoded `/api/magento/*` routes
- Server handlers for customer login/logout
- Magento SDK dependency

**Problems:**
- Routes hardcoded; can't swap with different commerce backend
- Configuration tied to Nuxt runtime config
- No standard adapter interface

#### Target State

Implement `CommerceAdapter` interface with generic transport.

#### Migration Steps

**Step 1: Create src/transport.ts**

```typescript
import type { TransportAdapter, RequestOptions, APIResponse } from 'alternate-gateway'

export interface MagentoTransportConfig {
  baseUrl: string
  token: string
}

export const createMagentoTransport = (config: MagentoTransportConfig): TransportAdapter => {
  return {
    async request<T>(method: string, path: string | URL, options: RequestOptions = {}): Promise<APIResponse<T>> {
      const fullUrl = new URL(path, config.baseUrl)

      if (options.query) {
        Object.entries(options.query).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            fullUrl.searchParams.set(key, String(value))
          }
        })
      }

      try {
        const response = await fetch(fullUrl.toString(), {
          method,
          headers: {
            'Authorization': `Bearer ${config.token}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
          },
          body: options.body ? JSON.stringify(options.body) : undefined
        })

        const data = await response.json()

        if (!response.ok) {
          return {
            status: response.status,
            data: null as any as T,
            error: data?.message || 'Magento error'
          }
        }

        return { status: response.status, data }
      } catch (error: any) {
        return {
          status: 500,
          data: null as any as T,
          error: error.message
        }
      }
    }
  }
}
```

**Step 2: Create src/commerce.ts**

```typescript
import type { CommerceAdapter, TransportAdapter } from 'alternate-gateway/adapters'

export const createMagentoCommerceAdapter = (transport: TransportAdapter): CommerceAdapter => ({
  async getCart() {
    const res = await transport.request('/rest/V1/carts/mine', 'GET')
    if (res.error) return { error: res.error }
    return { data: res.data }
  },

  async addToCart(productId: string, quantity: number) {
    const res = await transport.request('/rest/V1/carts/mine/items', 'POST', {
      body: {
        cartItem: { sku: productId, qty: quantity }
      }
    })
    if (res.error) return { error: res.error }
    return { data: res.data }
  },

  async removeFromCart(itemId: string) {
    const res = await transport.request(`/rest/V1/carts/mine/items/${itemId}`, 'DELETE')
    if (res.error) return { error: res.error }
    return { data: true }
  },

  async checkout(paymentMethod: string) {
    const res = await transport.request('/rest/V1/carts/mine/payment-information', 'POST', {
      body: { paymentMethod: { method: paymentMethod } }
    })
    if (res.error) return { error: res.error }
    return { data: res.data }
  }
})
```

**Step 3: Create src/index.ts**

```typescript
import { createMagentoTransport } from './transport'
import { createMagentoCommerceAdapter } from './commerce'
import { createAdapterInstaller, defineAdapterLayerFactories } from './patterns'

export interface MagentoAdapterOptions {
  baseUrl: string
  token: string
}

const magentoLayerFactories = defineAdapterLayerFactories({
  commerce: createMagentoCommerceAdapter,
})

export const installMagentoAdapter = createAdapterInstaller(
  createMagentoTransport,
  magentoLayerFactories,
)

export class MagentoAdapter {
  constructor(private options: MagentoAdapterOptions) {}

  async getCommerce() {
    const transport = createMagentoTransport(this.options)
    return createMagentoCommerceAdapter(transport)
  }
}
```

**Step 4: Update app code**

**Before:**
```typescript
// pages/checkout.vue
import { useMagento } from '@mframework/adapter-magento'

export default defineComponent({
  setup() {
    const { addToCart } = useMagento()
    // ... hardcoded Magento API calls
  }
})
```

**After:**
```typescript
// nuxt.config.ts
import { installMagentoAdapter } from '@mframework/adapter-magento'

installMagentoAdapter({
  baseUrl: process.env.MAGENTO_URL,
  token: process.env.MAGENTO_TOKEN
})

// pages/checkout.vue
import { useCommerce } from '@mframework/gateway'

export default defineComponent({
  setup() {
    const { addToCart } = useCommerce()
    // Now works with ANY commerce adapter (Shopify, WooCommerce, etc.)
  }
})
```

---

### Example 3: Refactoring adapter-opensearch

#### Current State

**Issue:** Dual export patterns cause confusion

- `createOpenSearchAdapter()` → Direct class
- `createGatewayAdapterBindings()` → Registry pattern

#### Migration

**Step 1: Implement full installer pattern**

```typescript
// src/transport.ts
export const createOpenSearchTransport = (config: OpenSearchConfig): TransportAdapter => {
  const client = new Client({ node: config.node })
  // ... implementation
}

// src/search.ts
export const createOpenSearchSearchAdapter = (transport: TransportAdapter): SearchAdapter => {
  // ... implementation
}

// src/index.ts
export const installOpenSearchAdapter = createAdapterInstaller(
  createOpenSearchTransport,
  defineAdapterLayerFactories({ search: createOpenSearchSearchAdapter })
)
```

**Step 2: Deprecate dual patterns**

Remove or mark as deprecated:
- Direct class exports
- `createGatewayAdapterBindings()`

---

## Testing Refactored Adapters

### Before & After Tests

```typescript
// tests/swappability.test.ts

import { installDirectusAdapter } from '@mframework/adapter-directus'
import { installPostgresAdapter } from '@mframework/adapter-postgres'
import { useContent } from '@mframework/gateway'

describe('Adapter Swappability', () => {
  it('should work identically with different adapters', async () => {
    // Test with Directus
    installDirectusAdapter({ url: 'http://directus', token: 'token' })
    let { readItem } = useContent()
    const directusItem = await readItem('products', 1)

    // Test with Postgres (same code!)
    installPostgresAdapter({ url: 'http://postgres', token: 'token' })
    { readItem } = useContent()
    const postgresItem = await readItem('products', 1)

    // Both should work identically
    expect(directusItem).toHaveProperty('id')
    expect(postgresItem).toHaveProperty('id')
    expect(typeof directusItem).toBe(typeof postgresItem)
  })
})
```

---

## Validation Checklist for Refactored Adapters

- [ ] All layer methods implemented and tested
- [ ] TransportAdapter handles all HTTP methods correctly
- [ ] Error handling uses consistent Result<T> pattern
- [ ] Configuration passed at install time (not environment-specific)
- [ ] Adapter registered via setAuthAdapter/setCommerceAdapter/etc.
- [ ] App code can use generic useAuth/useCommerce/useContent composables
- [ ] Old SDK imports deprecated but still available for backward compatibility
- [ ] Package.json exports updated
- [ ] Build produces correct dist/ output
- [ ] All existing tests pass
- [ ] New integration tests verify swappability
- [ ] README updated with new installation pattern
- [ ] Example apps show provider-neutral usage

---

## Deployment Strategy

### Phase 1: Backward Compatibility

Keep old exports working; add new exports:

```typescript
// Keep for backward compatibility (DEPRECATED)
export { createDirectus, readItem } from '@directus/sdk'

// New exports (recommended)
export { installDirectusAdapter } from './src/index'
```

### Phase 2: Migration Window

Announce deprecation; provide migration guide.

### Phase 3: Major Version

Remove old exports; release as major version bump.

---

## Troubleshooting

**Problem:** Old code still using direct SDK imports

**Solution:** 
```typescript
// Provide compatibility shim in index.ts
export * from '@directus/sdk' // deprecated
// Or provide wrapper functions
```

**Problem:** App code tightly coupled to adapter

**Solution:** 
Refactor to use composition functions (useContent, useCommerce, useAuth) instead of adapter-specific hooks.

**Problem:** Tests failing after refactoring

**Solution:**
- Mock TransportAdapter in unit tests
- Use integration tests with real backend in CI
- Test swappability by changing adapter at config time

---

## Timeline Estimate

| Adapter | Effort | Time |
|---------|--------|------|
| adapter-opensearch | Small | 4-8 hours |
| adapter-rocketchat | Medium | 8-12 hours |
| adapter-directus | Large | 16-24 hours |
| adapter-magento | Large | 16-24 hours |
| adapter-federation | Architectural | 24-32 hours |
| adapter-prisma | Special case | Decision needed |

**Total:** 70-100 hours for full standardization

---

## Resources

- [adapter-starter](../packages/adapters/adapter-starter/) — Template
- [ADAPTER_PATTERN_AUDIT.md](../ADAPTER_PATTERN_AUDIT.md) — Current state analysis
- [ADAPTER_DEVELOPMENT_GUIDE.md](../ADAPTER_DEVELOPMENT_GUIDE.md) — Creation guide


# Adapter Development Guide

**For creating new adapters following the `adapter-starter` pattern**

---

## Quick Start: Creating a New Adapter

### 1. Copy adapter-starter as template

```bash
cd packages/adapters
cp -r adapter-starter adapter-{name}
cd adapter-{name}
```

### 2. Update package.json

```json
{
  "name": "@mframework/adapter-{name}",
  "version": "0.0.1",
  "description": "{Description} adapter for M Framework",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "type": "module",
  "dependencies": {
    "typescript": "^5.9.3",
    // Add your backend SDK/client here
  }
}
```

### 3. Create src/ directory structure

```
src/
├── index.ts           (main exports)
├── patterns.ts        (copy from adapter-starter/src/patterns.ts if reusing)
├── transport.ts       (HTTP abstraction layer)
├── auth.ts            (if implementing AuthAdapter)
├── commerce.ts        (if implementing CommerceAdapter)
├── search.ts          (if implementing SearchAdapter)
└── utils.ts           (helpers: normalizers, error handlers)
```

### 4. Key Implementation Steps

#### Step 1: Create TransportAdapter

**File:** `src/transport.ts`

```typescript
import type { TransportAdapter, RequestOptions, APIResponse } from 'alternate-gateway'

export const create{Name}Transport = (config: { baseUrl: string; apiKey?: string }): TransportAdapter => {
  return {
    async request<T>(method: string, path: string | URL, options: RequestOptions = {}): Promise<APIResponse<T>> {
      try {
        const url = new URL(path, config.baseUrl)

        // Handle query parameters
        if (options.query) {
          Object.entries(options.query).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              url.searchParams.set(key, String(value))
            }
          })
        }

        // Make HTTP request
        const response = await fetch(url.toString(), {
          method,
          headers: {
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {}),
            ...(options.headers || {})
          },
          body: options.body ? JSON.stringify(options.body) : undefined
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          return {
            status: response.status,
            data: null as any as T,
            error: data?.message || 'Unknown error'
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

#### Step 2: Implement Layer Adapters

**File:** `src/auth.ts` (example)

```typescript
import type { AuthAdapter, TransportAdapter } from 'alternate-gateway/adapters'
import type { LoginInput, RegisterInput, Session, User, Result } from 'alternate-gateway/types'

const unwrap = (response: any): Result<any> => {
  if (response.error) {
    return { error: response.error }
  }
  return { data: response.data }
}

export const create{Name}AuthAdapter = (transport: TransportAdapter): AuthAdapter => ({
  async login(input: LoginInput): Promise<Result<Session>> {
    const res = await transport.request<Session>('POST', '/auth/login', {
      body: input
    })
    return unwrap(res)
  },

  async register(input: RegisterInput): Promise<Result<Session>> {
    const res = await transport.request<Session>('POST', '/auth/register', {
      body: input
    })
    return unwrap(res)
  },

  async logout(): Promise<Result<true>> {
    const res = await transport.request('POST', '/auth/logout')
    return unwrap({ ...res, data: true })
  },

  async getSession(): Promise<Result<Session | null>> {
    const res = await transport.request<Session>('GET', '/auth/session')
    return unwrap(res)
  },

  async refresh(): Promise<Result<Session>> {
    const res = await transport.request<Session>('POST', '/auth/refresh')
    return unwrap(res)
  },

  async getUser(): Promise<Result<User>> {
    const res = await transport.request<User>('GET', '/auth/user')
    return unwrap(res)
  }
})
```

**File:** `src/commerce.ts` (example)

```typescript
import type { CommerceAdapter, TransportAdapter } from 'alternate-gateway/adapters'
import type { Result } from 'alternate-gateway/types'

export const create{Name}CommerceAdapter = (transport: TransportAdapter): CommerceAdapter => ({
  async getCart(): Promise<Result<any>> {
    const res = await transport.request<any>('GET', '/cart')
    if (res.error) return { error: res.error }
    return { data: res.data }
  },

  async addToCart(productId: string, quantity: number): Promise<Result<any>> {
    const res = await transport.request<any>('POST', '/cart/items', {
      body: { productId, quantity }
    })
    if (res.error) return { error: res.error }
    return { data: res.data }
  },

  async checkout(items: any[]): Promise<Result<any>> {
    const res = await transport.request<any>('POST', '/checkout', {
      body: { items }
    })
    if (res.error) return { error: res.error }
    return { data: res.data }
  }
})
```

#### Step 3: Create Main Adapter Class & Installer

**File:** `src/index.ts`

```typescript
import { createStarterTransport } from './src/transport'
import { create{Name}AuthAdapter } from './src/auth'
import { create{Name}CommerceAdapter } from './src/commerce'
import {
  createAdapterInstaller,
  defineAdapterLayerFactories,
} from './src/patterns'

export interface {Name}AdapterOptions {
  baseUrl: string
  apiKey?: string
}

// Define which layers this adapter implements
const {name}LayerFactories = defineAdapterLayerFactories({
  auth: create{Name}AuthAdapter,
  commerce: create{Name}CommerceAdapter,
})

// Create installer function
export const install{Name}Adapter = createAdapterInstaller(
  create{Name}Transport,
  {name}LayerFactories,
)

// Optional: Main adapter class for direct instantiation
export class {Name}Adapter {
  private readonly options: {Name}AdapterOptions

  constructor(options: {Name}AdapterOptions) {
    this.options = options
  }

  async getAuth() {
    const transport = create{Name}Transport(this.options)
    return create{Name}AuthAdapter(transport)
  }

  async getCommerce() {
    const transport = create{Name}Transport(this.options)
    return create{Name}CommerceAdapter(transport)
  }
}

export type { {Name}AdapterOptions }
```

#### Step 4: Copy patterns.ts (or create adapter-specific version)

If your adapter uses same layer types as adapter-starter, copy:
```bash
cp adapter-starter/src/patterns.ts src/patterns.ts
```

If you need custom layers, implement similar logic in your own patterns.ts.

#### Step 5: Add types.ts (Optional but Recommended)

**File:** `types.ts`

```typescript
import type { AuthAdapter, CommerceAdapter, SearchAdapter } from 'alternate-gateway/adapters'

export interface {Name}GatewayAdapterContract {
  auth: AuthAdapter
  commerce: CommerceAdapter
}

export type {Name}QueryInput = {
  query: string
  page?: number
  pageSize?: number
}

export type {Name}Result = {
  items: any[]
  total: number
  page: number
  pageSize: number
}
```

---

## Integration in Nuxt Apps

### 1. Installation

```typescript
// nuxt.config.ts
import { install{Name}Adapter } from '@mframework/adapter-{name}'

install{Name}Adapter({
  baseUrl: process.env.{NAME}_URL,
  apiKey: process.env.{NAME}_API_KEY
})
```

### 2. Usage in Components

```typescript
// composables/useMyData.ts
import { useAuth, useContent } from '@mframework/gateway'

export const useMyData = async () => {
  const auth = useAuth()
  const content = useContent()
  
  const session = await auth.getSession()
  const items = await content.readItems('products')
  
  return { session, items }
}
```

---

## Testing Adapters

### Unit Tests

```typescript
// tests/auth.test.ts
import { describe, it, expect, vi } from 'vitest'
import { create{Name}AuthAdapter } from '../src/auth'
import type { TransportAdapter } from 'alternate-gateway'

const mockTransport: TransportAdapter = {
  request: vi.fn()
}

describe('Auth Adapter', () => {
  it('should login successfully', async () => {
    mockTransport.request.mockResolvedValue({
      status: 200,
      data: { token: 'abc123', user: { id: '1', email: 'test@example.com' } }
    })

    const adapter = create{Name}AuthAdapter(mockTransport)
    const result = await adapter.login({ email: 'test@example.com', password: '...' })

    expect(result.data).toBeDefined()
    expect(result.data?.token).toBe('abc123')
  })
})
```

### Integration Tests

```typescript
// tests/integration.test.ts
import { install{Name}Adapter } from '../src/index'
import { useAuth } from '@mframework/gateway'

describe('Integration Tests', () => {
  it('should register and login', async () => {
    install{Name}Adapter({
      baseUrl: 'http://localhost:3000',
      apiKey: 'test-key'
    })

    const auth = useAuth()
    const registered = await auth.register({
      email: 'newuser@example.com',
      password: 'password123'
    })
    
    expect(registered.data?.user?.id).toBeDefined()
  })
})
```

---

## Adapter Checklist

Before publishing/using your adapter:

- [ ] TransportAdapter correctly handles HTTP methods (GET, POST, PUT, DELETE, PATCH)
- [ ] Layer adapters implement all required interface methods
- [ ] Error handling uses consistent Result<T> pattern
- [ ] Configuration accepts options object at install time
- [ ] Types exported and documented
- [ ] README.md explains how to use the adapter
- [ ] Example in README shows installation + usage
- [ ] Build script generates dist/ output
- [ ] package.json exports are correct
- [ ] Tested with actual backend service (or mock)
- [ ] Works in Nuxt app without code changes to app logic

---

## Common Patterns

### Handling Nested Objects in Query Parameters

```typescript
const stringifyQueryValue = (value: unknown) => {
  if (value === null || value === undefined) return null
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

// In transport request:
if (options.query) {
  Object.entries(options.query).forEach(([key, value]) => {
    const serialized = stringifyQueryValue(value)
    if (serialized !== null) {
      url.searchParams.set(key, serialized)
    }
  })
}
```

### Normalizing API Responses

```typescript
// utils.ts
export const normalize{Name}Result = (raw: any) => {
  return {
    items: raw.items || [],
    total: raw.total || 0,
    page: raw.page || 1,
    pageSize: raw.pageSize || 10
  }
}

// In adapter:
const result = await transport.request<any>('GET', '/search', { query })
return normalize{Name}Result(result.data)
```

### Error Handling

```typescript
// utils.ts
export const handle{Name}Error = (error: any) => {
  if (error instanceof TypeError) {
    return 'Network error: unable to reach adapter service'
  }
  if (error.status === 401) {
    return 'Unauthorized: check your API key'
  }
  return error.message || 'Unknown error'
}

// In adapter:
try {
  // ... operations
} catch (error) {
  throw new Error(handle{Name}Error(error))
}
```

---

## Deployment

### Build

```bash
npm run build
# Outputs to dist/
```

### Publish to npm

```bash
npm publish
```

### Version Management

```bash
# Update version in package.json
npm version patch    # 0.0.1 → 0.0.2
npm version minor    # 0.0.1 → 0.1.0
npm version major    # 0.0.1 → 1.0.0
npm publish
```

---

## FAQ

**Q: When should I use class-based vs factory pattern?**  
A: Use factory pattern (createXxxAdapter) as primary export for consistency. Optionally provide a class-based wrapper for convenience.

**Q: Can my adapter implement multiple layers?**  
A: Yes. Define all implementations in separate files (auth.ts, commerce.ts, search.ts) and include in defineAdapterLayerFactories.

**Q: What if my backend doesn't match all layer methods?**  
A: Implement only what exists, return error results for unsupported operations.

**Q: How do I handle authentication tokens?**  
A: Pass as options at install time (baseUrl, apiKey) and include in all transport requests.

**Q: Should I support both REST and GraphQL?**  
A: Create separate adapters or allow provider selection in options.

**Q: How do I test without a real backend?**  
A: Create mock TransportAdapter in tests; return pre-configured responses.


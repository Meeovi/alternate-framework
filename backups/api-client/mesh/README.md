# Mesh Adapter Registry Module

Enables backend-agnostic architecture by allowing adapters to register their GraphQL endpoints with the mesh gateway at runtime.

## Overview

The mesh adapter registry provides a unified interface for all backend adapters (Magento, Directus, WordPress, etc.) to expose their capabilities to the mesh gateway. This enables:

- **Backend Agnostic Layers** - Layers don't hardcode backend URLs
- **Dynamic Mesh Composition** - Mesh is built from registered adapters at startup
- **Frontend Security** - Frontend only sees mesh gateway, not backend URLs
- **GraphQL-First Design** - REST is fallback only, managed by transport layer

## Architecture

```
┌─────────────────────────────────────────┐
│  Layer Initialization (at server boot)  │
└────────────────┬────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │ Adapter Registration       │
    │ (Nitro plugins run)        │
    │ registerAdapterEndpoint()  │
    └────────────┬───────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │ Mesh Configuration         │
    │ buildComposeConfig()       │
    │ Gets all registered        │
    │ adapters and creates       │
    │ GraphQL subgraphs          │
    └────────────┬───────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │ Mesh Gateway Ready         │
    │ Unified GraphQL endpoint   │
    └────────────────────────────┘
```

## Core Concepts

### AdapterEndpointConfig

Configuration that each adapter provides to register itself:

```typescript
interface AdapterEndpointConfig {
  name: string                           // 'commerce', 'lists', 'social'
  endpoint: string | () => Promise<string>  // GraphQL endpoint
  restEndpoint?: string                  // REST fallback
  headers?: Record<string, string>       // Custom headers
  authorization?: string | (context) => string  // Auth header
  enabled?: boolean | () => Promise<boolean>    // Enable/disable
  restPrefix?: string                   // REST API prefix
  graphqlFirst?: boolean                 // Prefer GraphQL (default: true)
}
```

### AdapterMetadata

Optional metadata about the adapter:

```typescript
interface AdapterMetadata {
  name: string                  // 'commerce'
  backendType: string           // 'magento', 'directus', 'wordpress'
  version: string               // Backend version
  modules: string[]             // Supported modules
  supportsGraphQL: boolean      // GraphQL capability
  supportsREST: boolean         // REST capability
}
```

## Usage

### 1. Register an Adapter (in layer plugin)

```typescript
// layers/commerce/server/plugins/register-commerce-adapter.server.ts

import { registerAdapterEndpoint } from '@mframework/api-client/mesh'

export default defineNitroPlugin(() => {
  registerAdapterEndpoint(
    {
      name: 'commerce',
      endpoint: process.env.MAGENTO_GRAPHQL_ENDPOINT,
      restEndpoint: process.env.MAGENTO_REST_ENDPOINT,
      restPrefix: '/rest/V1',
      authorization: (context) => context.headers['authorization'],
      graphqlFirst: true,
      enabled: !!process.env.MAGENTO_GRAPHQL_ENDPOINT
    },
    {
      name: 'commerce',
      backendType: 'magento',
      version: '2.4.6',
      modules: ['products', 'cart', 'orders'],
      supportsGraphQL: true,
      supportsREST: true
    }
  )
})
```

### 2. Build Mesh Configuration

```typescript
// themes/framework/meeovi-app/mesh.config.ts

import {
  buildGatewayConfig,
  buildComposeConfig
} from '@mframework/api-client/mesh'

export const gatewayConfig = buildGatewayConfig()

export async function composeConfig(context?: any) {
  return buildComposeConfig(context)
}
```

### 3. Use in Server

```typescript
// layers/commerce/server/api/products.ts

import { useMApiTransport } from '@mframework/api-client/nuxt'

export default async (req, res) => {
  const transport = useMApiTransport()
  
  // Uses registered adapter endpoint
  const products = await transport.graphql(GET_PRODUCTS_QUERY)
  
  return { products }
}
```

## API Reference

### registerAdapterEndpoint()

Register an adapter with the mesh gateway.

```typescript
registerAdapterEndpoint(config: AdapterEndpointConfig, metadata?: AdapterMetadata): void
```

**Parameters:**
- `config` - Adapter endpoint configuration
- `metadata` - Optional metadata about the adapter

**Example:**
```typescript
registerAdapterEndpoint({
  name: 'lists',
  endpoint: 'http://directus:8055/graphql',
  restEndpoint: 'http://directus:8055',
  authorization: (ctx) => `Bearer ${process.env.DIRECTUS_TOKEN}`,
})
```

### getAllAdapterEndpoints()

Get all registered adapters.

```typescript
getAllAdapterEndpoints(): AdapterEndpointConfig[]
```

**Returns:** Array of all registered adapter configs

**Example:**
```typescript
const adapters = getAllAdapterEndpoints()
console.log('Registered:', adapters.map(a => a.name))
// Output: ['commerce', 'lists', 'social']
```

### getAdapterEndpoint()

Get a specific adapter by name.

```typescript
getAdapterEndpoint(name: string): AdapterEndpointConfig | undefined
```

**Parameters:**
- `name` - Adapter name (e.g., 'commerce')

**Returns:** Adapter config or undefined

### getAllAdapterMetadata()

Get metadata for all adapters.

```typescript
getAllAdapterMetadata(): AdapterMetadata[]
```

### getAdapterMetadata()

Get metadata for a specific adapter.

```typescript
getAdapterMetadata(name: string): AdapterMetadata | undefined
```

### resolveAdapterEndpoint()

Resolve adapter endpoint (handles functions).

```typescript
resolveAdapterEndpoint(config: AdapterEndpointConfig): Promise<string>
```

### isAdapterEnabled()

Check if adapter is enabled.

```typescript
isAdapterEnabled(config: AdapterEndpointConfig): Promise<boolean>
```

### clearAdapterRegistry()

Clear all registered adapters (testing use only).

```typescript
clearAdapterRegistry(): void
```

## Mesh Configuration Builder

### buildGatewayConfig()

Build the gateway configuration (webhooks, cache, etc.).

```typescript
buildGatewayConfig(): GatewayConfig
```

### buildComposeConfig()

Dynamically build mesh compose configuration from registered adapters.

```typescript
buildComposeConfig(context?: any): Promise<ComposeConfig>
```

**What it does:**
1. Gets all registered adapters
2. Resolves their endpoints
3. Filters enabled adapters
4. Creates subgraph entries
5. Handles authorization forwarding
6. Returns composed mesh config

**Parameters:**
- `context` - Optional request context (for auth forwarding)

**Example:**
```typescript
export async function composeConfig(context?: any) {
  return buildComposeConfig(context)
}
```

### buildFallbackComposeConfig()

Static fallback configuration (used if no adapters registered).

```typescript
buildFallbackComposeConfig(): ComposeConfig
```

## Dynamic Endpoints

Endpoints can be functions for lazy resolution:

```typescript
registerAdapterEndpoint({
  name: 'commerce',
  endpoint: async () => {
    // Resolve endpoint at mesh startup time
    return process.env.MAGENTO_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql'
  },
  enabled: async () => {
    // Can check database, external service, etc.
    return process.env.COMMERCE_ENABLED === 'true'
  }
})
```

## Authorization Handling

Each adapter can define its own authorization:

```typescript
registerAdapterEndpoint({
  name: 'commerce',
  authorization: (context) => {
    // Use client auth
    return context.headers['authorization']
  }
})

registerAdapterEndpoint({
  name: 'admin',
  authorization: (context) => {
    // Use service token from env
    return `Bearer ${process.env.ADMIN_API_KEY}`
  }
})

registerAdapterEndpoint({
  name: 'lists',
  authorization: () => {
    // No auth needed
    return undefined
  }
})
```

## REST Fallback Configuration

Adapters can specify REST endpoint details for fallback:

```typescript
registerAdapterEndpoint({
  name: 'commerce',
  endpoint: 'http://magento:8000/graphql',
  restEndpoint: 'http://magento:8000',
  restPrefix: '/rest/V1',  // Applied when constructing REST paths
  graphqlFirst: true  // Try GraphQL first, then REST
})
```

The transport layer will automatically:
1. Try GraphQL query
2. If it fails with unsupported pattern → try REST equivalent
3. Only expose REST through same-origin routes (security)

## Error Handling

### Missing Endpoint

If adapter registration fails:

```typescript
try {
  registerAdapterEndpoint({...})
} catch (error) {
  console.error('Failed to register adapter:', error)
  // Adapter won't be available in mesh
}
```

### No Adapters Registered

If mesh builds with no adapters:

```typescript
// buildComposeConfig() logs warning
// Falls back to buildFallbackComposeConfig()
// Uses env var: MAPI_ENDPOINT or http://localhost:4000/graphql
```

## Environment Variables

Adapters use environment variables for configuration:

```bash
# Commerce Adapter
MAGENTO_GRAPHQL_ENDPOINT=http://magento:8000/graphql
MAGENTO_REST_ENDPOINT=http://magento:8000
COMMERCE_API_TOKEN=bearer_token
COMMERCE_BACKEND_TYPE=magento

# Lists Adapter
LISTS_GRAPHQL_ENDPOINT=http://directus:8055/graphql
DIRECTUS_URL=http://directus:8055
DIRECTUS_TOKEN=your_token
LISTS_BACKEND_TYPE=directus

# Social Adapter
SOCIAL_GRAPHQL_ENDPOINT=http://wordpress:8000/graphql
SOCIAL_REST_ENDPOINT=http://wordpress:8000
SOCIAL_API_TOKEN=app_password

# Chat Adapter (optional)
CHAT_GRAPHQL_ENDPOINT=http://chat-service:3000/graphql
CHAT_API_TOKEN=api_key
```

## Logging

The mesh builder logs adapter registration:

```
[commerce-adapter] Registered: http://magento:8000/graphql (magento)
[lists-adapter] Registered: http://directus:8055/graphql (directus)
[social-adapter] Registered: http://wordpress:8000/graphql (wordpress)
[MeshBuilder] Added subgraph: commerce -> http://magento:8000/graphql
[MeshBuilder] Added subgraph: lists -> http://directus:8055/graphql
[MeshBuilder] Added subgraph: social -> http://wordpress:8000/graphql
```

## Testing

### Test Adapter Registration

```typescript
import { getAllAdapterEndpoints } from '@mframework/api-client/mesh'

describe('Adapter Registration', () => {
  it('should register commerce adapter', () => {
    const adapters = getAllAdapterEndpoints()
    expect(adapters).toContainEqual(
      expect.objectContaining({ name: 'commerce' })
    )
  })
})
```

### Mock Adapters in Tests

```typescript
import { 
  registerAdapterEndpoint, 
  clearAdapterRegistry 
} from '@mframework/api-client/mesh'

beforeEach(() => {
  clearAdapterRegistry()
  
  registerAdapterEndpoint({
    name: 'test-adapter',
    endpoint: 'http://localhost:4000/graphql'
  })
})

afterEach(() => {
  clearAdapterRegistry()
})
```

## Security Best Practices

✅ **Do:**
- Store endpoint URLs in `process.env` (server-only)
- Register adapters in Nitro plugins at startup
- Forward client auth securely within server context
- Use authorization functions for custom logic
- Keep backend URLs out of public runtimeConfig

❌ **Don't:**
- Expose backend URLs to frontend
- Include adapter configs in public runtimeConfig
- Store API tokens in files
- Leak backend system details in errors
- Allow clients to specify adapter endpoints

## Troubleshooting

### Adapter Not Showing in Mesh

```typescript
// Check if adapter is registered
import { getAllAdapterEndpoints } from '@mframework/api-client/mesh'
console.log(getAllAdapterEndpoints())

// If missing:
// 1. Check plugin file is in layers/*/server/plugins/*.server.ts
// 2. Verify defineNitroPlugin is used
// 3. Check env vars are set
// 4. Look for error logs during startup
```

### Authorization Not Forwarded

```typescript
// Make sure to provide authorization in config
registerAdapterEndpoint({
  authorization: (context) => context.headers['authorization']
})

// Or use static token
registerAdapterEndpoint({
  authorization: `Bearer ${process.env.TOKEN}`
})
```

### GraphQL Queries Failing Over to REST

```typescript
// This is expected behavior (working as designed)
// GraphQL fails → REST fallback triggered
// Check logs to see which queries are falling back
// May indicate schema mismatch
```

## Related Documentation

- [Backend-Agnostic Architecture](BACKEND_AGNOSTIC_ARCHITECTURE.md)
- [Adapter Migration Guide](ADAPTER_MIGRATION_GUIDE.md)
- [Layer Isolation Contract](LAYER_ISOLATION_CONTRACT.md)

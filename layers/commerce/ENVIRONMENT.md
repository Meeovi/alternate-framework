## Magento Commerce Layer: Environment Configuration

This document specifies the environment variables required to configure the Magento adapter for the mesh gateway and commerce layer.

### GraphQL Endpoint Configuration

The Magento GraphQL endpoint is resolved with fallback priority:

```
1. MAGENTO_GRAPHQL_ENDPOINT (most specific)
2. COMMERCE_GRAPHQL_ENDPOINT (generic commerce)
3. MAPI_ENDPOINT (platform default)
```

If none are set, the adapter registration will fail with a clear error.

**Example:**
```env
MAGENTO_GRAPHQL_ENDPOINT=https://magento.example.com/graphql
```

### REST Endpoint Configuration (Optional fallback)

For operations that need REST fallback, configure:

```
1. MAGENTO_REST_ENDPOINT (most specific)
2. COMMERCE_REST_ENDPOINT (generic)
3. MAGENTO_API_URL (legacy name)
```

REST is **disabled** by default if `COMMERCE_SUPPORT_REST=false`.

**Example:**
```env
MAGENTO_REST_ENDPOINT=https://magento.example.com/rest/default
```

### Authentication Configuration

#### Option 1: Bearer Token (Customer/Admin Token)
```env
COMMERCE_API_TOKEN=your_bearer_token_here
```

The adapter forwards this as `Authorization: Bearer {token}` to all Magento requests.

#### Option 2: Forward Client Authorization
If `COMMERCE_API_TOKEN` is not set, the adapter forwards the incoming request's authorization header:

```
Client Request:
  Authorization: Bearer {customer_token}
    ↓
Magento GraphQL Request:
  Authorization: Bearer {customer_token}
```

This allows customer-scoped queries (e.g., getting customer's own orders).

### Backend Type Specification

```env
COMMERCE_BACKEND_TYPE=magento
```

**Currently supported values:**
- `magento` (required, default)

Future versions may support additional backends (Vendure, Medusa, etc.).

### Version Configuration

```env
COMMERCE_VERSION=2.4.6
```

Specifies the Magento version for adapter compatibility checks. Defaults to `2.4.6` if not set.

### Complete Configuration Example

#### Local Development
```env
# GraphQL endpoint
MAGENTO_GRAPHQL_ENDPOINT=http://localhost:4000/graphql

# Optional: REST fallback
MAGENTO_REST_ENDPOINT=http://localhost:4000/rest/default

# Auth: use token
COMMERCE_API_TOKEN=test_token_12345

# Backend metadata
COMMERCE_BACKEND_TYPE=magento
COMMERCE_VERSION=2.4.6
COMMERCE_SUPPORT_REST=true
```

#### Staging
```env
COMMERCE_GRAPHQL_ENDPOINT=https://staging-magento.example.com/graphql
MAGENTO_REST_ENDPOINT=https://staging-magento.example.com/rest/default
COMMERCE_API_TOKEN=${STAGING_MAGENTO_API_TOKEN}
COMMERCE_BACKEND_TYPE=magento
COMMERCE_VERSION=2.4.6
COMMERCE_SUPPORT_REST=true
```

#### Production
```env
COMMERCE_GRAPHQL_ENDPOINT=https://magento.example.com/graphql
MAGENTO_REST_ENDPOINT=https://magento.example.com/rest/default

# Use customer token forwarding; no hardcoded token
# COMMERCE_API_TOKEN is NOT set

COMMERCE_BACKEND_TYPE=magento
COMMERCE_VERSION=2.4.6
COMMERCE_SUPPORT_REST=false  # Disable REST in production
```

### Adapter Registration at Server Startup

When the Nuxt server starts, the Nitro plugin `server/plugins/register-commerce-adapter.server.ts`:

1. Calls `getCommerceAdapterRegistration()`
2. Loads the Magento adapter from `server/adapters/magento/adapter.config.ts`
3. Resolves endpoints using the fallback chain above
4. Registers with the mesh gateway via `registerAdapterEndpoint()`
5. Logs success/failure to console

**Console Output:**
```
[commerce-adapter] Registered Magento adapter: https://magento.example.com/graphql
```

If registration fails, the error is logged and the app continues (mesh has no commerce subgraph, but other layer adapters may still work).

### Mesh Gateway Composition

After all adapters register, the mesh gateway is built with:

- **Commerce subgraph** (from Magento)
- **Lists subgraph** (from Directus/configured source)
- **Social subgraph** (from WordPress/Mastodon/configured source)
- **Chat subgraph** (if configured)

Frontend composables call through the mesh:

```
Composable (useProducts, useCart, etc.)
  ↓
Server Endpoint /api/...
  ↓
meshClient.executeQuery()
  ↓
Mesh Gateway
  ↓
Commerce Subgraph (Magento GraphQL)
```

### Troubleshooting

#### "No Magento GraphQL endpoint configured, adapter disabled"
- Set one of: `MAGENTO_GRAPHQL_ENDPOINT`, `COMMERCE_GRAPHQL_ENDPOINT`, or `MAPI_ENDPOINT`

#### "Failed to initialize mesh: No adapters loaded"
- At least one adapter endpoint must be registered
- Check that at least `COMMERCE_GRAPHQL_ENDPOINT` or equivalent is set

#### "Authorization failed / 401 Unauthorized"
- Verify `COMMERCE_API_TOKEN` is valid, or ensure client auth headers are being forwarded
- Check Magento token hasn't expired

#### "GraphQL query failed: Cannot query field..."
- Verify the Magento instance is at version 2.4.6+ (or adjust `COMMERCE_VERSION`)
- Some fields may require additional setup in Magento admin

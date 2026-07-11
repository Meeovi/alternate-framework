# Gateway Adapter for MFramework

GraphQL Mesh adapter for integrating multiple API backends into a unified gateway with security, rate limiting, caching, and transforms.

## Installation

```bash
npm install @mframework/adapter-gateway @graphql-mesh/core @graphql-mesh/http
```

For database sources, install additional handlers:
```bash
npm install @graphql-mesh/mongoose @graphql-mesh/mysql @graphql-mesh/postgraphile
```

## Features

- **Multiple Source Types**: REST, GraphQL, OpenAPI, gRPC, Mongoose, MySQL, MariaDB, PostGraphile, Webhooks, Subscriptions
- **Environment-based Configuration**: Configure sources via `.env` without touching mesh config
- **Security Plugins**: API Key and JWT authentication via Envelop
- **Rate Limiting**: Built-in rate limiting via Envelop
- **Response Caching**: Automatic response caching
- **Hive Telemetry**: Optional Hive integration for schema registry and monitoring
- **Schema Transforms**: Prefix, Rename, Naming Convention, Filter, Hoist, Encapsulate, Prune, Federation

## Quick Start

### Environment Variable Configuration

Create a `.env` file:

```env
# REST API
MESH_SOURCE_API_ENDPOINT=https://api.example.com
MESH_SOURCE_API_TYPE=rest
MESH_SOURCE_API_HEADERS={}

# GraphQL API
MESH_SOURCE_SHOPIFY_ENDPOINT=https://your-store.myshopify.com/api/2023-10/graphql.json
MESH_SOURCE_SHOPIFY_TYPE=graphql
MESH_SOURCE_SHOPIFY_HEADERS={"X-Shopify-Storefront-Access-Token":"token"}

# Mongoose (MongoDB)
MESH_SOURCE_DB_ENDPOINT=mongodb://localhost:27017/mydb
MESH_SOURCE_DB_TYPE=mongoose

# MySQL
MESH_SOURCE_MYSQL_ENDPOINT=mysql://user:pass@localhost:3306/mydb
MESH_SOURCE_MYSQL_TYPE=mysql

# PostGraphile (PostgreSQL)
MESH_SOURCE_GRAPHILE_ENDPOINT=postgres://user:pass@localhost:5432/mydb
MESH_SOURCE_GRAPHILE_TYPE=postgraphile
```

### Using mesh.config.ts

```typescript
// your-mesh.config.ts
import meshConfig from '@mframework/adapter-gateway/mesh.config.ts'
export default meshConfig
```

Then run GraphQL Mesh:

```bash
npx mesh dev
```

## Transforms

GraphQL Mesh transforms allow you to modify schemas dynamically:

### Prefix Transform

Add a prefix to all types:

```env
MESH_TRANSFORMS_PREFIX=MyApi_
```

### Rename Transform

Rename types:

```env
MESH_TRANSFORMS_RENAME=User:Account,Product:StoreProduct
```

### Naming Convention

Convert field/type names to consistent conventions:

```env
MESH_TRANSFORMS_NAMING_CONVENTION_TYPES=true
MESH_TRANSFORMS_NAMING_CONVENTION_FIELDS=true
```

### Filter Schema

Filter specific types or fields:

```env
MESH_TRANSFORMS_FILTER_TYPES=User,Product
MESH_TRANSFORMS_FILTER_FIELDS=User:password,Product:internalId
```

### Hoist Field

Hoist nested fields to parent:

```env
MESH_TRANSFORMS_HOIST_FIELDS=Query:user:me,Query:product:featured
```

### Encapsulate

Encapsulate schema under namespace:

```env
MESH_TRANSFORMS_ENCAPSULATE={"rules":[{"applyTo":"User","remove":false}]}
```

### Prune

Remove unused/deprecated schema elements (enabled by default):

```env
MESH_TRANSFORMS_PRUNE=true
```

### Federation

Enable Apollo Federation support:

```env
MESH_TRANSFORMS_FEDERATION=true
```

## Security Configuration

### API Key Authentication

```env
MESH_SECURITY_API_KEY=your-secret-api-key
```

### JWT Authentication

```env
MESH_SECURITY_JWT_SECRET=your-jwt-secret
```

### CORS

```env
MESH_SECURITY_CORS_ORIGIN=http://localhost:3000,https://your-app.com
```

## Rate Limiting

```env
MESH_RATELIMIT_MAX=100
MESH_RATELIMIT_WINDOW_MS=60000
```

Limits to 100 requests per 60 seconds (1 minute window).

## Response Caching

```env
MESH_CACHE_TTL=300
MESH_CACHE_MAX_SIZE=1000
```

Caches responses for 300 seconds (5 minutes) with max 1000 entries.

## Hive Telemetry

Connect to [Hive](https://the-guild.dev/graphql/hive) for schema registry and monitoring:

```env
MESH_HIVE_TOKEN=your-hive-token
MESH_HIVE_ENDPOINT=https://hive.your-domain.com
```

## Supported Source Types

| Type | Endpoint Format | Description |
|------|---------------|-------------|
| `rest` | `https://api.example.com` | REST API |
| `graphql` | `https://api.example.com/graphql` | GraphQL API |
| `openapi` | `https://api.example.com/openapi.json` | OpenAPI schema |
| `swagger` | `https://api.example.com/swagger.json` | Swagger schema |
| `grpc` | `localhost:50051` | gRPC service |
| `mongoose` | `mongodb://localhost:27017/db` | MongoDB via Mongoose |
| `mysql` | `mysql://user:pass@host:3306/db` | MySQL database |
| `mariadb` | `mysql://user:pass@host:3306/db` | MariaDB database |
| `postgraphile` | `postgres://user:pass@host:5432/db` | PostgreSQL via PostGraphile |
| `subscription` | `ws://localhost:4000/graphql` | WebSocket subscription |
| `webhook` | `https://hooks.stripe.com` | Webhook endpoint |

## Programmatic API

```typescript
import { GatewayAdapter, loadSourcesFromEnvPublic } from '@mframework/adapter-gateway'

// Initialize with sources from .env
const adapter = new GatewayAdapter({
  sources: loadSourcesFromEnvPublic(process.env)
})

// Add/remove sources dynamically
adapter.addSource({
  name: 'custom',
  type: 'rest',
  endpoint: 'https://api.example.com'
})

adapter.removeSource('custom')

// Get services
const services = await adapter.getServices()
```

## With Nuxt Module

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@mframework/adapter-gateway/nuxt'],
  gatewayAdapter: {
    sources: [] // Empty - loads from MESH_SOURCE_* env vars
  }
})
```

## Environment Variables

```
MESH_SOURCE_<NAME>_ENDPOINT=<url>
MESH_SOURCE_<NAME>_TYPE=<type>
MESH_SOURCE_<NAME>_HEADERS=<json-headers>
MESH_SOURCE_<NAME>_SECRET=<webhook-secret>

MESH_TRANSFORMS_PREFIX=<prefix>
MESH_TRANSFORMS_RENAME=<from:to,from2:to2>
MESH_TRANSFORMS_NAMING_CONVENTION_TYPES=<true|false>
MESH_TRANSFORMS_NAMING_CONVENTION_FIELDS=<true|false>
MESH_TRANSFORMS_FILTER_TYPES=<type1,type2>
MESH_TRANSFORMS_FILTER_FIELDS=<type:field,type:field2>
MESH_TRANSFORMS_HOIST_FIELDS=<type:path,type:path2>
MESH_TRANSFORMS_ENCAPSULATE=<json-rules>
MESH_TRANSFORMS_PRUNE=<true|false>
MESH_TRANSFORMS_FEDERATION=<true|false>

MESH_SECURITY_API_KEY=<api-key>
MESH_SECURITY_JWT_SECRET=<jwt-secret>
MESH_SECURITY_CORS_ORIGIN=<origins>

MESH_RATELIMIT_MAX=<requests-per-window>
MESH_RATELIMIT_WINDOW_MS=<window-ms>

MESH_CACHE_TTL=<seconds>
MESH_CACHE_MAX_SIZE=<entries>

MESH_HIVE_TOKEN=<token>
MESH_HIVE_ENDPOINT=<endpoint>
```
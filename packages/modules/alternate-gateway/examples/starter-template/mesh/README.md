# Mesh Architecture in Meeovi App

This directory contains the GraphQL Mesh configuration and implementation for the Meeovi app. It enables a backend-agnostic architecture where the UI communicates with a unified GraphQL gateway instead of directly with backend services.

## Directory Structure

```
server/mesh/              # Mesh runtime configuration
  ├── meshInstance.ts     # Mesh initialization and caching
  ├── meshClient.ts       # Query execution interface
  ├── mesh.config.base.yaml       # Base configuration (all envs)
  ├── mesh.config.local.yaml      # Development overrides
  ├── mesh.config.staging.yaml    # Staging overrides
  └── mesh.config.production.yaml # Production overrides

server/adapters/          # Backend adapter configurations
  ├── index.ts            # Adapter registry and loader
  ├── graphql-backend/    # GraphQL backend adapter
  │   ├── adapter.config.yaml
  │   └── mapping.ts
  ├── rest-backend/       # REST API adapter
  │   ├── adapter.config.yaml
  │   └── mapping.ts
  └── magento/            # Magento commerce adapter
      ├── adapter.config.yaml
      └── mapping.ts

app/domain/               # Stable domain schema (source of truth)
  ├── schema.graphql      # Unified domain schema
  ├── types.d.ts          # TypeScript types
  └── operations/         # GraphQL queries and mutations
      ├── artworks.graphql
      └── artwork.graphql

app/composables/          # Vue composables using Mesh
  └── useArtworks.ts      # Artwork data fetching

modules/mesh/             # Nuxt module for Mesh initialization
  └── module.ts
```

## How It Works

### 1. Mesh Initialization

When the app starts, `getMeshInstance()`:
- Loads the base mesh configuration
- Applies environment-specific overrides (local/staging/production)
- Loads the active adapter configuration
- Merges all sources and transforms
- Initializes a single Mesh instance (lazy-loaded, cached)

### 2. Backend Adapter System

The adapter registry allows runtime backend switching:

```typescript
// Get adapter configuration
const config = getAdapterConfig('magento')

// Check available adapters
const adapters = getAvailableAdapters() // ['graphql-backend', 'magento']
```

Switch adapters via environment variable:
```bash
MESH_ADAPTER=magento npm run dev
```

Each adapter:
- Defines how to connect to its backend via `adapter.config.yaml`
- Maps backend types to the unified schema via `mapping.ts`
- Provides transforms for schema composition

### 3. Unified Domain Schema

`app/domain/schema.graphql` is the source of truth for the UI contract. It:
- Remains stable across backend changes
- Adapters implement mapping to its types
- Frontend uses only these types
- Enables safe backend migration

### 4. Query Execution

From composables or server routes:

```typescript
// In components or composables
const { data } = useArtworks()

// In server routes
const { artworks } = await executeQuery(query, variables)

// Mutations
const artwork = await executeMutation(createMutation, input)
```

## Environment Configuration

### Local (Development)
- Playground enabled
- Introspection enabled
- No caching
- Debug logging

```bash
NODE_ENV=local npm run dev
```

### Staging
- Introspection enabled for debugging
- Caching enabled (1800s TTL)
- Info-level logging

```bash
NODE_ENV=staging npm run build && npm run preview
```

### Production
- Playground disabled
- Introspection disabled (security)
- Caching enabled (3600s TTL)
- Warn-level logging (performance)

```bash
NODE_ENV=production npm run build && npm run start
```

## Adding a New Adapter

1. Create a new directory under `server/adapters/`:
   ```bash
   mkdir -p server/adapters/my-backend
   ```

2. Add `adapter.config.yaml`:
   ```yaml
   sources:
     - name: MyBackend
       handler:
         graphql:
           endpoint: ${MY_BACKEND_URL}
   ```

3. Add `mapping.ts` for type mappings:
   ```typescript
   export const fieldMapping = {
     artwork: {
       remoteId: 'id',
       remoteTitle: 'title'
     }
   }
   ```

4. Register in `server/adapters/index.ts`:
   ```typescript
   const ADAPTERS: Record<AdapterId, MeshAdapterConfig> = {
     'my-backend': {
       id: 'my-backend',
       configPath: join(process.cwd(), 'server/adapters/my-backend/adapter.config.yaml')
     }
   }
   ```

5. Use via env variable:
   ```bash
   MESH_ADAPTER=my-backend npm run dev
   ```

## Adding a New Query Operation

1. Create GraphQL query in `app/domain/operations/`:
   ```graphql
   # app/domain/operations/myQuery.graphql
   query myData($id: ID!) {
     myType(id: $id) {
       id
       name
     }
   }
   ```

2. Update `app/domain/types.d.ts` with types:
   ```typescript
   export interface MyQueryResponse {
     myType: MyType
   }
   ```

3. Create composable in `app/composables/`:
   ```typescript
   import myQuery from '~/app/domain/operations/myQuery.graphql'
   
   export function useMyData(id: string) {
     return useAsyncData(`my-data-${id}`, () =>
       executeQuery(myQuery.loc.source.body, { id })
     )
   }
   ```

4. Use in components:
   ```vue
   <script setup>
   const { data } = useMyData('123')
   </script>
   
   <template>
     <div>{{ data?.myType?.name }}</div>
   </template>
   ```

## Debugging

### Check Mesh Health
Visit `http://localhost:3000/api/mesh-health` to verify Mesh is initialized.

### GraphQL Playground
In development mode, visit `http://localhost:3000/graphql` to explore the schema.

### Logging
Adjust log level in environment config files (base.yaml, local.yaml, etc.)

### Runtime Adapter
Check which adapter is active:
```typescript
import { getActiveAdapter } from '~/server/utils/env'
console.log(getActiveAdapter()) // 'magento'
```

## Performance

- **Mesh Instance**: Lazy-loaded and cached on first request
- **Schema Composition**: Happens at server startup, not per-request
- **Caching**: Configurable per environment
- **SSR**: Full support via `useAsyncData` in composables
- **Hydration**: Automatic client-side hydration

## Security

### Production Defaults
- Playground disabled
- Introspection disabled
- Rate limiting enabled
- Authentication enforcement

### Adapter Configuration
- Backend URLs in private config only
- No tokens in public config
- Environment-based endpoint resolution
- Upstream error sanitization

## Related Documentation

- [Mesh Architecture Guide](../mesh-architecture.md)
- [Backend-Agnostic Architecture](../BACKEND_AGNOSTIC_ARCHITECTURE.md)
- [GraphQL Mesh Docs](https://the-guild.dev/graphql/mesh)

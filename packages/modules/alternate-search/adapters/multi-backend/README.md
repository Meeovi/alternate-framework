# Multi-Backend Search Adapter - Security-First Design

## Overview

The multi-backend adapter enables searching across multiple backends simultaneously with intelligent result aggregation, while maintaining **complete separation of backend credentials from client-side code**.

**Key Security Features:**
- ✅ All backend credentials stored server-side only
- ✅ Clients never see individual backend auth details
- ✅ Backend endpoints completely hidden from frontend
- ✅ Access control enforced at adapter level
- ✅ Audit trail via backend result tracking
- ✅ Graceful degradation without exposing errors

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client/Frontend                        │
│                   No auth details exposed                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                  /api/search/[index]
                         │
┌─────────────────────────▼────────────────────────────────────┐
│                    Server-Side Adapter                        │
│                 (Multi-Backend Proxy)                         │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Backend 1          Backend 2         Backend 3       │   │
│  │ (Magento)          (Elasticsearch)   (Meilisearch)   │   │
│  │ + Token            + API Key         + API Key       │   │
│  │ Private            Private           Private         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Result Aggregation & Ranking Engine                  │   │
│  │ - Merge results intelligently                        │   │
│  │ - Weight by backend priority/quality                 │   │
│  │ - Deduplicate items                                  │   │
│  │ - Combine facets                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬────────────────────────────────────┘
                         │
              Aggregated Results
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Client/Frontend                            │
│              (Unified search experience)                      │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

### Basic Setup

```typescript
import { createSearch, multiBackendAdapter, elasticsearchAdapter, meilisearchAdapter } from '@mframework/alternate-search';
import { magento } from '@mframework/adapter-magento';

// Configure backends with credentials (SERVER-SIDE ONLY)
const multiBackend = multiBackendAdapter({
  backends: [
    {
      id: 'magento',
      adapter: magento({
        // ⚠️  NEVER expose this to clients
        graphqlEndpoint: process.env.MAGENTO_GRAPHQL_URL,
        accessToken: process.env.MAGENTO_TOKEN,
      }),
      priority: 10,        // Higher priority = checked first
      weight: 100,         // 100% weight in result ranking
      optional: false,     // Failure blocks entire query
      maxResults: 50,
    },
    {
      id: 'elasticsearch',
      adapter: elasticsearchAdapter({
        node: process.env.ALTERNATE_SEARCH_ELASTICSEARCH_URL,
        auth: {
          username: process.env.ALTERNATE_SEARCH_ELASTICSEARCH_USER,
          password: process.env.ALTERNATE_SEARCH_ELASTICSEARCH_PASSWORD,
        },
      }),
      priority: 20,
      weight: 80,          // 80% weight in merged results
      optional: true,      // Can fail without breaking query
      maxResults: 100,
    },
    {
      id: 'meilisearch',
      adapter: meilisearchAdapter({
        baseUrl: process.env.ALTERNATE_SEARCH_MEILISEARCH_URL,
        apiKey: process.env.ALTERNATE_SEARCH_MEILISEARCH_KEY,
      }),
      priority: 30,
      weight: 60,
      optional: true,
      maxResults: 100,
    },
  ],
  aggregationStrategy: 'merge', // 'merge' or 'cascade'
  parallel: true,               // Query all backends simultaneously
  debug: process.env.NODE_ENV === 'development',
});

// Create search instance
const search = createSearch({
  adapter: multiBackend,
  indexes: {
    products: {
      fields: [
        { name: 'id', type: 'keyword' },
        { name: 'title', type: 'text', searchable: true },
        { name: 'price', type: 'number', facetable: true },
      ],
    },
  },
});
```

## Aggregation Strategies

### 1. Merge Strategy (Recommended for Result Relevance)

Executes queries against all backends in parallel and intelligently merges results.

**When to use:**
- You want to combine results from multiple sources
- Backend priority/weight matters
- Results should be ranked by relevance across sources
- Single unified result set is desired

```typescript
multiBackendAdapter({
  backends: [...],
  aggregationStrategy: 'merge',
  parallel: true,
});
```

**Result combination:**
- Items ranked by weighted score
- Facets combined (e.g., price ranges from all backends together)
- Duplicates handled (optional, can be configured)
- Total count is weighted average

### 2. Cascade Strategy (For Failover)

Queries backends in priority order, stops at first successful result.

**When to use:**
- Primary/backup scenario (e.g., Magento primary, Elasticsearch fallback)
- You want fast response (don't wait for all backends)
- Results from one backend are preferred
- Fallback for resilience

```typescript
multiBackendAdapter({
  backends: [...],
  aggregationStrategy: 'cascade',
  parallel: false,  // Sequential for cascade
});
```

**Behavior:**
- Queries priority 10 backend first
- If success, returns immediately
- If failure and optional=true, tries next backend
- If required backend fails, throws error

## Circuit Breakers and Fallback Chains

Protect UX from flaky backends by opening the circuit after repeated failures.

```typescript
const adapter = multiBackendAdapter({
  backends: [
    { id: "elasticsearch", adapter: elasticsearchAdapter(...), priority: 10, optional: false },
    { id: "sqlite", adapter: sqliteAdapter(...), priority: 20, optional: true },
  ],
  circuitBreaker: {
    failureThreshold: 3,
    cooldownMs: 30_000,
    probeRequests: 1,
    fallbackResult: "cached", // or "empty"
  },
  fallbackChains: {
    elasticsearch: ["sqlite"],
  },
});
```

Behavior:

- If a backend fails N times in a row, its circuit is opened.
- While open, requests are short-circuited to empty/cached result instantly.
- After cooldown, probe requests test recovery.
- Fallback chain provides a Plan B backend automatically.

## Security Best Practices

### 1. Environment Variables for Credentials

**✅ Correct:**
```typescript
// server/utils/search-config.ts
const multiBackend = multiBackendAdapter({
  backends: [
    {
      id: 'magento',
      adapter: magento({
        graphqlEndpoint: process.env.MAGENTO_GRAPHQL_URL,    // From .env
        accessToken: process.env.MAGENTO_ACCESS_TOKEN,       // From .env
      }),
    },
  ],
});
```

**❌ Wrong:**
```typescript
// NEVER hardcode or send from client
const config = await fetch('/api/config'); // ← Exposes credentials!
```

### 2. No Credential Leakage to Frontend

**✅ Correct - Server-side only:**
```typescript
// server/utils/search-config.ts
export const searchInstance = createSearch({
  adapter: multiBackendAdapter({ backends: [...] }),
  indexes: { products: {...} },
});

// server/api/search/[index].ts
export default defineEventHandler(async (event) => {
  const { index, q } = getQuery(event);
  return searchInstance.query(index, { search: q });
});
```

**❌ Wrong - Credential exposure:**
```typescript
// Client-side ← NEVER do this
const query = await fetch('/api/backends/config').then(r => r.json());
// Now client knows all backend URLs and tokens!
```

### 3. Per-Backend Timeout & Resource Limits

```typescript
{
  id: 'untrusted-backend',
  adapter: externalAdapter({...}),
  timeoutMs: 5000,        // Kill after 5s
  maxResults: 10,         // Limit to 10 items
  optional: true,         // Don't fail entire query
},
```

### 4. Audit Trail via Backend Tracking

```typescript
// Each result item includes backend source
const result = await search.query('products', { search: 'laptop' });

result.items.forEach(item => {
  console.log(`${item.title} from ${item._source}`); // Track origin
});
```

### 5. Error Handling Without Exposing Details

**✅ Correct:**
```typescript
// server/api/search/[index].ts
export default defineEventHandler(async (event) => {
  try {
    const result = await searchInstance.query(index, query);
    return result;
  } catch (error) {
    console.error('Search failed', error); // Server log
    return { items: [], total: 0, error: 'Search unavailable' }; // Safe client message
  }
});
```

**❌ Wrong:**
```typescript
catch (error) {
  return { error: error.message }; // ← Exposes backend details!
  // "Backend elasticsearch failed: elasticsearch is down at 10.0.1.5:9200"
}
```

## Production Configuration Example

```typescript
// server/utils/search-config.ts
import { defineEventHandler } from 'h3';
import {
  createSearch,
  multiBackendAdapter,
  elasticsearchAdapter,
  meilisearchAdapter,
} from '@mframework/alternate-search';
import { magentoAdapter } from '@mframework/adapter-magento';

// Validate required env vars at startup
const requiredEnv = [
  'MAGENTO_GRAPHQL_URL',
  'MAGENTO_ACCESS_TOKEN',
  'ALTERNATE_SEARCH_ELASTICSEARCH_URL',
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

/**
 * Multi-backend search with:
 * - Magento as primary (highest priority)
 * - Elasticsearch as secondary with degraded weight
 * - Meilisearch as optional fallback
 * - All auth kept server-side
 * - Parallel queries with per-backend timeout
 * - Production error handling
 */
export const searchInstance = createSearch({
  adapter: multiBackendAdapter({
    backends: [
      {
        id: 'magento',
        adapter: magentoAdapter({
          graphqlEndpoint: process.env.MAGENTO_GRAPHQL_URL!,
          accessToken: process.env.MAGENTO_ACCESS_TOKEN!,
        }),
        priority: 10,        // Query first
        weight: 100,         // Full weight in results
        optional: false,     // Required - query fails if down
        timeoutMs: 8000,
        maxResults: 100,
      },
      {
        id: 'elasticsearch',
        adapter: elasticsearchAdapter({
          node: process.env.ALTERNATE_SEARCH_ELASTICSEARCH_URL || 'http://localhost:9200',
          auth: {
            username: process.env.ALTERNATE_SEARCH_ELASTICSEARCH_USER || 'elastic',
            password: process.env.ALTERNATE_SEARCH_ELASTICSEARCH_PASSWORD || '',
          },
        }),
        priority: 20,        // Query second
        weight: 80,          // Slightly lower weight
        optional: true,      // Can fail gracefully
        timeoutMs: 6000,
        maxResults: 100,
      },
      {
        id: 'meilisearch',
        adapter: meilisearchAdapter({
          baseUrl: process.env.ALTERNATE_SEARCH_MEILISEARCH_URL || 'http://localhost:7700',
          apiKey: process.env.ALTERNATE_SEARCH_MEILISEARCH_KEY,
        }),
        priority: 30,        // Last resort
        weight: 60,          // Lower confidence
        optional: true,      // Nice to have
        timeoutMs: 5000,
        maxResults: 100,
      },
    ],
    aggregationStrategy: 'merge',
    parallel: true,
    defaultTimeoutMs: 7000,
    debug: process.env.NODE_ENV === 'development',
  }),
  indexes: {
    products: {
      fields: [
        { name: 'id', type: 'keyword' },
        { name: 'title', type: 'text', searchable: true },
        { name: 'description', type: 'text', searchable: true },
        { name: 'price', type: 'number', facetable: true },
        { name: 'category', type: 'keyword', facetable: true },
        { name: 'rating', type: 'number', facetable: true },
      ],
    },
  },
  queryTimeoutMs: 10000,
});

// Initialize on server startup
export async function initializeSearch() {
  try {
    await searchInstance.setup();
    console.log('✅ Multi-backend search initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize search', error);
    throw error;
  }
}
```

## API Endpoint Implementation

```typescript
// server/api/search/[index].ts
export default defineEventHandler(async (event) => {
  const index = getRouterParam(event, 'index');
  const query = getQuery(event);

  // Input validation
  if (!index) {
    throw createError({ statusCode: 400, message: 'Index required' });
  }

  if (!query.q) {
    return { items: [], total: 0, page: 1, pageSize: 20 };
  }

  try {
    // Execute search against all configured backends
    const result = await searchInstance.query(index, {
      search: query.q as string,
      page: parseInt(query.page as string) || 1,
      pageSize: parseInt(query.pageSize as string) || 20,
      filters: query.filters ? JSON.parse(query.filters as string) : [],
      facets: query.facets ? (query.facets as string).split(',') : [],
    });

    // Add cache headers for search results
    setHeader(event, 'cache-control', 'public, max-age=60');

    return result;
  } catch (error) {
    console.error(`Search failed for index "${index}"`, error);

    // Map errors to safe client message
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw createError({
          statusCode: 504,
          message: 'Search timeout - try with fewer results',
        });
      }

      if (error.message.includes('Required backends failed')) {
        throw createError({
          statusCode: 503,
          message: 'Primary search service unavailable',
        });
      }
    }

    throw createError({
      statusCode: 500,
      message: 'Search service error',
    });
  }
});
```

## Monitoring & Observability

### Logging Backend Performance

```typescript
// In production config with debug enabled:
multiBackendAdapter({
  backends: [...],
  debug: process.env.NODE_ENV === 'development' || process.env.DEBUG_SEARCH,
});

// Output:
// [MultiBackendAdapter 2024-04-02T14:22:01.234Z] Executing parallel queries
// [MultiBackendAdapter 2024-04-02T14:22:01.345Z] Backend magento succeeded
// [MultiBackendAdapter 2024-04-02T14:22:01.456Z] Backend elasticsearch succeeded
// [MultiBackendAdapter 2024-04-02T14:22:01.487Z] Results merged
```

### Metrics to Track

- Per-backend query latency
- Success/failure rate by backend
- Result quality by backend (relevance scoring)
- Fallback activation frequency
- Cache hit rates

### Example Prometheus Metrics

```typescript
// Add to your observability stack
const backendLatency = new Histogram({
  name: 'search_backend_latency_ms',
  help: 'Search latency per backend',
  labelNames: ['backend', 'status'],
});

const backendErrors = new Counter({
  name: 'search_backend_errors_total',
  help: 'Total errors per backend',
  labelNames: ['backend'],
});
```

## Cost Optimization

### Limiting Backend Queries

```typescript
backends: [
  {
    id: 'expensive-api',
    adapter: expensiveAdapter({...}),
    optional: true,           // Skip if we have results
    maxResults: 10,           // Limit response size
    timeoutMs: 3000,          // Short timeout
  },
],
```

### Caching Multi-Backend Results

```typescript
// Extend with Redis caching
const cached = multiBackendAdapter({
  backends: [...],
  // Could integrate with cache plugin
});
```

## Testing

### Unit Test Example

```typescript
describe('multiBackendAdapter', () => {
  it('merges results from multiple backends', async () => {
    const mockMagento = { query: async () => ({ items: [{ id: '1', title: 'Product 1' }], total: 1 }) };
    const mockES = { query: async () => ({ items: [{ id: '2', title: 'Product 2' }], total: 1 }) };

    const adapter = multiBackendAdapter({
      backends: [
        { id: 'magento', adapter: mockMagento, priority: 10, weight: 100 },
        { id: 'es', adapter: mockES, priority: 20, weight: 80 },
      ],
      aggregationStrategy: 'merge',
    });

    const result = await adapter.query('products', { search: 'product' });

    expect(result.items.length).toBe(2);
    expect(result.total).toBe(2);
  });

  it('handles optional backend failures gracefully', async () => {
    const mockRequired = { query: async () => ({ items: [{ id: '1' }], total: 1 }) };
    const mockOptional = { query: async () => { throw new Error('Service down'); } };

    const adapter = multiBackendAdapter({
      backends: [
        { id: 'required', adapter: mockRequired, priority: 10, optional: false },
        { id: 'optional', adapter: mockOptional, priority: 20, optional: true },
      ],
    });

    const result = await adapter.query('products', { search: 'test' });
    expect(result.items.length).toBe(1); // Only from required backend
  });
});
```

## Summary

The multi-backend adapter provides:

✅ **Security**: All credentials server-side, none exposed to clients
✅ **Resilience**: Graceful degradation, optional backends, per-backend timeouts
✅ **Performance**: Parallel querying, intelligent result aggregation
✅ **Flexibility**: Multiple aggregation strategies (merge/cascade)
✅ **Observability**: Debug logging, backend tracking, error handling
✅ **Production-Ready**: Error handling, timeouts, resource limits, validation

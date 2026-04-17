# Migration Guide: Single Backend → Multi-Backend Search

## Overview

This guide helps you migrate from single-backend search configuration to the security-first multi-backend adapter.

**Key Benefits:**
- Query multiple backends simultaneously
- Intelligent result aggregation and ranking
- Per-backend timeout and resource limits
- Graceful degradation
- No credential exposure on client-side
- Production-ready error handling

## Before & After

### Before: Single Backend (Current)

```typescript
// server/utils/search-instance.ts
import { createSearch, elasticsearchAdapter } from '@mframework/alternate-search';

export const search = createSearch({
  adapter: elasticsearchAdapter({
    node: process.env.ALTERNATE_SEARCH_ELASTICSEARCH_URL,
    auth: {
      username: process.env.ALTERNATE_SEARCH_ELASTICSEARCH_USER,
      password: process.env.ALTERNATE_SEARCH_ELASTICSEARCH_PASSWORD,
    },
  }),
  indexes: {
    products: { fields: [...] },
  },
});

// API Endpoint (server/api/search/[index].ts)
export default defineEventHandler(async (event) => {
  const { index, q } = getQuery(event);
  return search.query(index, { search: q });
});
```

**Limitations:**
- Single point of failure
- No redundancy
- Can't combine result sources

### After: Multi-Backend (New)

```typescript
// server/utils/search-multi-backend.ts
import { createSearch, multiBackendAdapter, elasticsearchAdapter, meilisearchAdapter } from '@mframework/alternate-search';
import { magentoAdapter } from '@mframework/adapter-magento';

export async function getSearchInstance() {
  return createSearch({
    adapter: multiBackendAdapter({
      backends: [
        {
          id: 'magento',
          adapter: magentoAdapter({
            graphqlEndpoint: process.env.MAGENTO_GRAPHQL_URL,
            accessToken: process.env.MAGENTO_ACCESS_TOKEN,
          }),
          priority: 10,
          weight: 100,
          optional: false,
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
          weight: 80,
          optional: true, // Can fail
        },
      ],
      aggregationStrategy: 'merge',
      parallel: true,
    }),
    indexes: {
      products: { fields: [...] },
    },
  });
}

// API Endpoint (server/api/search/multi/[index].ts)
export default defineEventHandler(async (event) => {
  const search = await getSearchInstance();
  const { index, q } = getQuery(event);
  return search.query(index, { search: q });
});
```

**Improvements:**
- Multiple backends for redundancy
- Weighted result merging
- Per-backend timeout and limits
- Graceful degradation
- Better observability

## Step-by-Step Migration

### Step 1: Install Multi-Backend Adapter

The multi-backend adapter is already included in `@mframework/alternate-search`.

```bash
npm update @mframework/alternate-search
```

### Step 2: Create New Configuration File

Create `server/utils/search-multi-backend.ts`:

```typescript
import { createSearch, multiBackendAdapter, elasticsearchAdapter } from '@mframework/alternate-search';

export async function getSearchInstance() {
  return createSearch({
    adapter: multiBackendAdapter({
      backends: [
        {
          id: 'elasticsearch',
          adapter: elasticsearchAdapter({
            node: process.env.ALTERNATE_SEARCH_ELASTICSEARCH_URL,
            auth: {
              username: process.env.ALTERNATE_SEARCH_ELASTICSEARCH_USER,
              password: process.env.ALTERNATE_SEARCH_ELASTICSEARCH_PASSWORD,
            },
          }),
          priority: 10,
          optional: false, // Start with current backend as required
        },
      ],
      parallel: true,
      debug: process.env.NODE_ENV === 'development',
    }),
    indexes: {
      products: { fields: [...] }, // Use same schema
    },
  });
}
```

### Step 3: Validate Configuration

Test the new configuration works with existing backends:

```typescript
import { getSearchInstance } from '~/server/utils/search-multi-backend';

export default defineEventHandler(async (event) => {
  try {
    const search = await getSearchInstance();
    await search.setup(); // Initialize

    const query = getQuery(event);
    const result = await search.query('products', { search: query.q });
    return result;
  } catch (error) {
    console.error('Search error', error);
    return { items: [], total: 0 };
  }
});
```

### Step 4: Add Secondary Backends Incrementally

Once the primary backend works, add optional backends:

```typescript
backends: [
  {
    id: 'elasticsearch',
    adapter: elasticsearchAdapter({...}),
    priority: 10,
    weight: 100,
    optional: false, // Keep required for now
  },
  {
    id: 'meilisearch',
    adapter: meilisearchAdapter({
      baseUrl: process.env.ALTERNATE_SEARCH_MEILISEARCH_URL || 'http://localhost:7700',
      apiKey: process.env.ALTERNATE_SEARCH_MEILISEARCH_KEY,
    }),
    priority: 20,
    weight: 60,
    optional: true, // Can fail without breaking query
  },
]
```

### Step 5: Switch API Endpoints

Once comfortable, create the new multi-backend endpoint:

```typescript
// server/api/search/multi/[index].ts
import { getSearchInstance } from '~/server/utils/search-multi-backend';

export default defineEventHandler(async (event) => {
  const index = getRouterParam(event, 'index');
  const query = getQuery(event);

  try {
    const search = await getSearchInstance();
    return await search.query(index, {
      search: query.q,
      page: query.page || 1,
      pageSize: query.pageSize || 20,
    });
  } catch (error) {
    // Safe error response
    return createError({
      statusCode: 500,
      message: 'Search service error',
    });
  }
});
```

### Step 6: Update Frontend

Update components to use the new endpoint:

```vue
<template>
  <div>
    <input v-model="query" @keyup.enter="search">
    <div v-for="item in results" :key="item.id">
      <h3>{{ item.title }}</h3>
      <small>{{ item._source }}</small> <!-- Shows backend source -->
    </div>
  </div>
</template>

<script setup>
import { useMultiBackendSearch } from '~/composables/useMultiBackendSearch';

const { results, search } = useMultiBackendSearch('products');
const query = ref('');

const onSearch = async () => {
  await search({ query: query.value });
};
</script>
```

### Step 7: Monitor & Optimize

With multi-backend running, monitor performance:

```typescript
// Add logging for backend performance
backends.forEach((backend) => {
  console.log(`Backend ${backend.id}: ${backend.priority} (weight: ${backend.weight})`);
});

// Watch for timeout patterns
multiBackendAdapter({
  backends: [...],
  defaultTimeoutMs: 7000, // Adjust based on metrics
  debug: process.env.DEBUG_SEARCH, // Enable for troubleshooting
});
```

## Configuration Patterns

### Pattern 1: Primary + Fallback (Production Safe)

```typescript
{
  backends: [
    {
      id: 'magento',
      adapter: magentoAdapter({...}),
      priority: 10,
      weight: 100,
      optional: false, // Must work
    },
    {
      id: 'elasticsearch',
      adapter: elasticsearchAdapter({...}),
      priority: 20,
      weight: 80,
      optional: true, // Nice to have
    },
  ],
  aggregationStrategy: 'merge',
  parallel: true,
}
```

### Pattern 2: Cascade (Fast-Fail)

```typescript
{
  backends: [
    {
      id: 'primary',
      adapter: primaryAdapter({...}),
      priority: 10,
      optional: false,
    },
    {
      id: 'backup',
      adapter: backupAdapter({...}),
      priority: 20,
      optional: true,
    },
  ],
  aggregationStrategy: 'cascade', // Stop at first success
  parallel: false, // Query sequentially
}
```

### Pattern 3: Federated Search (Multiple Sources)

```typescript
{
  backends: [
    {
      id: 'products-db',
      adapter: productAdapter({...}),
      priority: 10,
      weight: 100,
    },
    {
      id: 'articles-db',
      adapter: articleAdapter({...}),
      priority: 20,
      weight: 80,
    },
    {
      id: 'faqs-db',
      adapter: faqAdapter({...}),
      priority: 30,
      weight: 60,
    },
  ],
  aggregationStrategy: 'merge',
  parallel: true,
}
```

## Environment Configuration

### Required Variables

```bash
# .env
# Primary backend (required)
MAGENTO_GRAPHQL_URL=https://meeovi.com/graphql
MAGENTO_ACCESS_TOKEN=your_token_here

# Secondary backends (optional)
ALTERNATE_SEARCH_ELASTICSEARCH_URL=http://localhost:9200
ALTERNATE_SEARCH_ELASTICSEARCH_USER=elastic
ALTERNATE_SEARCH_ELASTICSEARCH_PASSWORD=password

ALTERNATE_SEARCH_MEILISEARCH_URL=http://localhost:7700
ALTERNATE_SEARCH_MEILISEARCH_KEY=key_here
```

### Optional Debug Variables

```bash
# Enable debug logging
DEBUG_SEARCH=true

# Set timeouts
SEARCH_TIMEOUT_MS=10000

# Set batch sizes
SEARCH_BATCH_SIZE=100
```

## Rollback Plan

If multi-backend is unstable, rollback to single backend:

```typescript
// Revert to single backend temporarily
import { createSearch, elasticsearchAdapter } from '@mframework/alternate-search';

export const search = createSearch({
  adapter: elasticsearchAdapter({...}),
  indexes: {...},
});
```

Then deploy original API endpoint:

```typescript
// server/api/search/[index].ts (old version)
export default defineEventHandler(async (event) => {
  return search.query(index, { search: query.q });
});
```

## Troubleshooting

### Issue: "Required backends failed"

**Cause**: A required backend is down or timing out.

**Solution:**
```typescript
// Add timeout override for slow backend
{
  id: 'slow-backend',
  adapter: slowAdapter({...}),
  timeoutMs: 10000, // Give it more time
  optional: true,   // Or make it optional
}
```

### Issue: Results take too long

**Cause**: Waiting for slowest backend.

**Solution:**
```typescript
// Reduce timeout or make backends optional
{
  id: 'backend',
  adapter: slowAdapter({...}),
  timeoutMs: 3000, // Timeout faster
  optional: true,  // Allow fallback
}
```

### Issue: Duplicate results in merge

**Cause**: Same products indexed in multiple backends.

**Solution:** Add deduplication in composable or reduce weights for secondary backends.

## Testing Multi-Backend

### Unit Tests

See `multi-backend.test.ts` for comprehensive test examples.

```bash
npm test -- multi-backend.test.ts
```

### Integration Test

```typescript
export default defineEventHandler(async (event) => {
  // Test all backends are reachable
  const search = await getSearchInstance();
  
  try {
    const result = await search.query('products', { search: 'test' });
    return {
      status: 'ok',
      backends: result.items.map(item => item._source),
      total: result.total,
    };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
});
```

## Performance Tips

1. **Set appropriate timeouts** - Balance responsiveness vs completeness
2. **Use cascade for primary/backup** - Faster than merging
3. **Make non-critical backends optional** - Graceful degradation
4. **Monitor latency by backend** - Adjust weights based on performance
5. **Cache results** - Multi-backend results benefit from caching
6. **Limit maxResults** - Don't fetch more than needed

## Success Checklist

- [ ] New configuration file created
- [ ] All backends configured with credentials
- [ ] New endpoint created and tested
- [ ] Frontend updated to new endpoint
- [ ] Debug logging confirmed working
- [ ] Error handling tested (backend failures)
- [ ] Performance monitored (latency acceptable)
- [ ] Security verified (no credential leakage)
- [ ] Rollback plan documented
- [ ] Team trained on new system

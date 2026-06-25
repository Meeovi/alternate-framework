import type { SearchAdapter } from '../../../index'
import {
  createSearch,
  multiBackendAdapter,
  elasticsearchAdapter,
  meilisearchAdapter,
} from '../../../index'

function validateEnv() {
  const required = ['ALTERNATE_SEARCH_ELASTICSEARCH_URL']
  const missing = required.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}. These should be set in .env`)
  }
}

function buildMultiBackendAdapter(): SearchAdapter {
  const backends = [
    {
      id: 'elasticsearch' as const,
      adapter: elasticsearchAdapter({
        node: process.env.ALTERNATE_SEARCH_ELASTICSEARCH_URL || 'http://localhost:9200',
        auth: {
          username: process.env.ALTERNATE_SEARCH_ELASTICSEARCH_USER || 'elastic',
          password: process.env.ALTERNATE_SEARCH_ELASTICSEARCH_PASSWORD || '',
        },
      }),
      priority: 10,
      weight: 100,
      optional: false,
      timeoutMs: 6000,
      maxResults: 100,
    },
    ...(process.env.ALTERNATE_SEARCH_MEILISEARCH_URL
      ? [{
          id: 'meilisearch' as const,
          adapter: meilisearchAdapter({
            baseUrl: process.env.ALTERNATE_SEARCH_MEILISEARCH_URL,
            apiKey: process.env.ALTERNATE_SEARCH_MEILISEARCH_KEY,
          }),
          priority: 30,
          weight: 60,
          optional: true,
          timeoutMs: 5000,
          maxResults: 100,
        }]
      : []),
  ]

  return multiBackendAdapter({
    backends,
    aggregationStrategy: 'merge',
    parallel: true,
    defaultTimeoutMs: 7000,
    debug: process.env.NODE_ENV === 'development',
  })
}

async function initializeSearch() {
  validateEnv()

  const multiBackend = buildMultiBackendAdapter()
  const searchInstance = createSearch({
    adapter: multiBackend,
    indexes: {
      products: {
        fields: [
          { name: 'id', type: 'keyword' },
          { name: 'title', type: 'text', searchable: true },
          { name: 'description', type: 'text', searchable: true },
          { name: 'sku', type: 'keyword' },
          { name: 'price', type: 'number', facetable: true },
          { name: 'category', type: 'keyword', facetable: true },
          { name: 'rating', type: 'number', facetable: true },
          { name: 'availability', type: 'keyword', facetable: true },
          { name: 'image', type: 'text' },
        ],
      },
      articles: {
        fields: [
          { name: 'id', type: 'keyword' },
          { name: 'title', type: 'text', searchable: true },
          { name: 'content', type: 'text', searchable: true },
          { name: 'author', type: 'keyword' },
          { name: 'published', type: 'date', facetable: true },
          { name: 'tags', type: 'keyword', facetable: true },
        ],
      },
    },
    queryTimeoutMs: 10000,
  })

  await searchInstance.setup()
  return searchInstance
}

let searchInstance: ReturnType<typeof createSearch> | null = null

export async function getMultiBackendSearchInstance() {
  if (!searchInstance) {
    searchInstance = await initializeSearch()
  }
  return searchInstance
}

export { getMultiBackendSearchInstance as default }

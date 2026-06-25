import { createRequire } from 'node:module'
import { $fetch } from 'ofetch'
import { useRuntimeConfig } from '#imports'
import {
  createSearch,
  multiBackendProxyAdapter,
  memoryAdapter,
  createCsvAnalyticsProvider,
  createFileAnalyticsProvider,
  createOpenTelemetryAnalyticsProvider,
  createPostHogAnalyticsProvider,
  createSegmentAnalyticsProvider,
  type ProxyBackendPreset,
  type SearchAdapter,
  type SearchAnalyticsProvider,
  type SearchInstance,
  type SearchQuery,
  type SearchResult,
} from '../../../index'
import {
  caching,
  createMemoryCacheStorage,
  createRedisCacheStorage,
  type RedisCacheClient,
} from '../../../plugins/caching'

let instance: SearchInstance | null = null
let redisClient: RedisCacheClient | null = null
let demoSeedPromise: Promise<void> | null = null

type AlternateSearchAdapterName =
  | 'opensearch'
  | 'elasticsearch'
  | 'meilisearch'
  | 'typesense'
  | 'memory'
  | 'algolia'
  | 'sqlite'
  | 'pgvector'
  | 'multi-backend'

function buildDemoDocuments(indexName: string): Array<Record<string, unknown>> {
  const normalized = indexName.toLowerCase()

  if (normalized.includes('article') || normalized.includes('blog') || normalized.includes('post')) {
    return [
      {
        id: `${indexName}-launch-checklist`,
        title: 'Weekend launch checklist',
        body: 'Health endpoint, search endpoint, responsive layout, and seeded demo content are all in place.',
        author: 'Alternate Framework',
        tags: ['launch', 'demo', 'ops'],
        published: true,
        createdAt: '2026-04-03T08:00:00.000Z',
        url: 'https://framework.meeovi.com/docs',
      },
      {
        id: `${indexName}-memory-fallback`,
        title: 'Memory fallback explained',
        body: 'When no backend is configured, the starter-template seeds a small in-memory search index so the demo still works.',
        author: 'Alternate Framework',
        tags: ['search', 'memory'],
        published: true,
        createdAt: '2026-04-03T08:15:00.000Z',
      },
    ]
  }

  return [
    {
      id: `${indexName}-demo-starter-kit`,
      title: 'Demo Starter Kit',
      description: 'A seeded product record used to verify the search flow without an external backend.',
      category: 'demo',
      brand: 'Alternate Framework',
      price: 49,
      published: true,
      createdAt: '2026-04-03T08:00:00.000Z',
      url: 'https://framework.meeovi.com',
    },
    {
      id: `${indexName}-weekend-launch`,
      title: 'Weekend Launch Bundle',
      description: 'Focused starter experience with health checks, seeded data, and minimal runtime dependencies.',
      category: 'operations',
      brand: 'Meeovi',
      price: 99,
      published: true,
      createdAt: '2026-04-03T08:10:00.000Z',
    },
    {
      id: `${indexName}-search-observability`,
      title: 'Search Observability Pack',
      description: 'Shows runtime analytics hooks and cache-aware search behavior in a compact demo.',
      category: 'search',
      brand: 'Alternate Framework',
      price: 129,
      published: true,
      createdAt: '2026-04-03T08:20:00.000Z',
    },
  ]
}

function seedDemoData(instanceToSeed: SearchInstance, configuredIndexes: string[]) {
  if (demoSeedPromise) return demoSeedPromise

  const indexNames = configuredIndexes.length > 0 ? configuredIndexes : ['products', 'articles']

  demoSeedPromise = (async () => {
    try {
      await Promise.all(indexNames.map((indexName) => instanceToSeed.index(indexName, buildDemoDocuments(indexName), { upsert: true })))
    } catch (error) {
      console.warn('[alternate-search] failed to seed demo data', error)
    }
  })()

  return demoSeedPromise
}

function normalizeUrl(raw: unknown): string {
  const text = String(raw ?? '').trim()
  if (!text) return ''
  if ((text.startsWith('[') && text.endsWith(']')) || (text.startsWith('{') && text.endsWith('}'))) {
    try {
      const parsed = JSON.parse(text.replace(/'/g, '"'))
      if (Array.isArray(parsed)) return String(parsed[0] ?? '').trim()
      if (typeof parsed === 'string') return parsed.trim()
    } catch {
      return text
    }
  }

  const csvCandidate = text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (csvCandidate.length > 0) return csvCandidate[0]
  return text
}

function parseUrlList(raw: unknown): string[] {
  const text = String(raw ?? '').trim()
  if (!text) return []

  if ((text.startsWith('[') && text.endsWith(']')) || (text.startsWith('{') && text.endsWith('}'))) {
    try {
      const parsed = JSON.parse(text.replace(/'/g, '"'))
      if (Array.isArray(parsed)) {
        return parsed.map((value) => String(value).trim()).filter(Boolean)
      }
      if (typeof parsed === 'string') {
        return [parsed.trim()].filter(Boolean)
      }
    } catch {
      return text
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
    }
  }

  return text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

function parseIndexes(raw: unknown): string[] {
  return String(raw ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

function buildDefaultIndexes(indexNames: string[]): Record<string, { fieldMap: Record<string, { type: string; filterable?: boolean; searchable?: boolean; sortable?: boolean; facetable?: boolean }> }> {
  const fallback = ['products', 'articles']
  const names = indexNames.length > 0 ? indexNames : fallback

  return Object.fromEntries(names.map((name) => {
    const normalized = name.toLowerCase()
    if (normalized.includes('article') || normalized.includes('blog') || normalized.includes('post')) {
      return [name, {
        fieldMap: {
          id: { type: 'string', filterable: true },
          title: { type: 'string', searchable: true, sortable: true },
          body: { type: 'string', searchable: true },
          author: { type: 'string', filterable: true, facetable: true },
          tags: { type: 'string[]', filterable: true, facetable: true },
          published: { type: 'boolean', filterable: true },
          createdAt: { type: 'date', sortable: true },
        },
      }]
    }

    return [name, {
      fieldMap: {
        id: { type: 'string', filterable: true },
        title: { type: 'string', searchable: true, sortable: true },
        description: { type: 'string', searchable: true },
        price: { type: 'number', filterable: true, sortable: true, facetable: true },
        category: { type: 'string', filterable: true, facetable: true },
        brand: { type: 'string', filterable: true, facetable: true },
        published: { type: 'boolean', filterable: true },
        createdAt: { type: 'date', sortable: true },
      },
    }]
  }))
}

function getRedisClient(redisUrl: string): RedisCacheClient | null {
  if (!redisUrl) return null
  if (redisClient) return redisClient

  try {
    const require = createRequire(import.meta.url)
    const redisModule = require('redis')
    const createClient = redisModule?.createClient
    if (typeof createClient !== 'function') return null

    const client = createClient({ url: redisUrl })
    client.on?.('error', (error: unknown) => {
      console.warn('[alternate-search] Redis client error', error)
    })
    void client.connect?.()
    redisClient = client as RedisCacheClient
    return redisClient
  } catch (error) {
    console.warn('[alternate-search] redis package is not installed, using in-memory cache', error)
    return null
  }
}

function buildAnalyticsProviders(config: ReturnType<typeof useRuntimeConfig>): SearchAnalyticsProvider[] {
  const providers: SearchAnalyticsProvider[] = []

  const posthogApiKey = String(config.alternateSearchAnalyticsPosthogApiKey || '').trim()
  const posthogHost = String(config.alternateSearchAnalyticsPosthogHost || '').trim()
  if (posthogApiKey) {
    providers.push(createPostHogAnalyticsProvider({
      apiKey: posthogApiKey,
      ...(posthogHost ? { host: posthogHost } : {}),
    }))
  }

  const segmentWriteKey = String(config.alternateSearchAnalyticsSegmentWriteKey || '').trim()
  const segmentHost = String(config.alternateSearchAnalyticsSegmentHost || '').trim()
  if (segmentWriteKey) {
    providers.push(createSegmentAnalyticsProvider({
      writeKey: segmentWriteKey,
      ...(segmentHost ? { host: segmentHost } : {}),
    }))
  }

  const jsonlPath = String(config.alternateSearchAnalyticsJsonlPath || '').trim()
  if (jsonlPath) {
    providers.push(createFileAnalyticsProvider({ filePath: jsonlPath }))
  }

  const csvPath = String(config.alternateSearchAnalyticsCsvPath || '').trim()
  if (csvPath) {
    providers.push(createCsvAnalyticsProvider({ filePath: csvPath }))
  }

  const otelEnabled = String(config.alternateSearchAnalyticsOpenTelemetryEnabled || '').toLowerCase() === 'true'
  if (otelEnabled) {
    try {
      const require = createRequire(import.meta.url)
      const otelApi = require('@opentelemetry/api')
      const serviceName = String(config.alternateSearchAnalyticsOpenTelemetryServiceName || 'alternate-search-proxy')
      const tracer = otelApi?.trace?.getTracer?.(serviceName)
      const meter = otelApi?.metrics?.getMeter?.(serviceName)

      providers.push(createOpenTelemetryAnalyticsProvider({
        tracer,
        meter,
        serviceName,
        staticAttributes: {
          'deployment.environment': process.env.NODE_ENV || 'development',
        },
      }))
    } catch (error) {
      console.warn('[alternate-search] @opentelemetry/api is not installed, OpenTelemetry provider skipped', error)
    }
  }

  return providers
}

export function getSearchInstance(): SearchInstance {
  if (instance) return instance

  const config = useRuntimeConfig()
  const provider = String((config.public as { meeoviProvider?: string })?.meeoviProvider || '').toLowerCase()
  const explicitAdapter = String(config.alternateSearchAdapter || process.env.ALTERNATE_SEARCH_ADAPTER || '').trim().toLowerCase() as AlternateSearchAdapterName | ''
  const adapter = explicitAdapter || ''

  const protocol = String(config.alternateSearchProtocol || process.env.ALTERNATE_SEARCH_PROTOCOL || 'http').trim() || 'http'
  const host = String(config.alternateSearchHost || process.env.ALTERNATE_SEARCH_HOST || '').trim()
  const port = Number(config.alternateSearchPort || process.env.ALTERNATE_SEARCH_PORT || 0)
  const hostPortUrl = host
    ? `${protocol}://${host}${port > 0 ? `:${port}` : ''}`
    : ''

  const configuredUrlRaw = String(config.alternateSearchUrl || process.env.ALTERNATE_SEARCH_URL || '').trim()
  const configuredUrl = normalizeUrl(configuredUrlRaw)
  const baseUrl = configuredUrl || hostPortUrl || 'http://localhost:9200'
  const username = String(config.alternateSearchUsername || '')
  const password = String(config.alternateSearchPassword || '')
  const apiKey = String(config.alternateSearchApiKey || '')
  const configuredIndexes = parseIndexes(config.alternateSearchIndexes || process.env.ALTERNATE_SEARCH_INDEXES || '')

  const publicConfig = config.public as {
    magento?: { baseUrl?: string; accessToken?: string }
    directus?: { url?: string; staticToken?: string }
  }
  const magentoBaseUrl = String(publicConfig.magento?.baseUrl || process.env.MAGE_STORE_URL || '')
  const magentoToken = String(publicConfig.magento?.accessToken || process.env.WEBSITE_TOKEN || process.env.GQL_KEY || '')
  const directusBaseUrl = String(publicConfig.directus?.url || process.env.DIRECTUS_URL || '')
  const directusToken = String(publicConfig.directus?.staticToken || process.env.DIRECTUS_STATIC_TOKEN || process.env.NUXTUS_DIRECTUS_STATIC_TOKEN || '')
  const directusCollections = String(process.env.ALTERNATE_SEARCH_DIRECTUS_COLLECTIONS || 'posts,articles,pages')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  const directusSearchFields = String(process.env.ALTERNATE_SEARCH_DIRECTUS_FIELDS || 'title,name,description,excerpt,body,content,slug')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  const redisUrl = String(config.alternateSearchRedisUrl || '').trim()
  const redisPrefix = String(config.alternateSearchRedisPrefix || 'alternate-search:proxy:').trim()
  const cacheTtlMs = Number(config.alternateSearchCacheTtlMs || 120_000) || 120_000
  const indexPrefix = String(config.alternateSearchIndexPrefix || '').trim()

  const indexAliases = (() => {
    const raw = String(config.alternateSearchIndexAliases || '').trim()
    if (!raw) return {}
    try {
      const parsed = JSON.parse(raw)
      return typeof parsed === 'object' && parsed !== null ? parsed : {}
    } catch {
      return {}
    }
  })() as Record<string, string>

  const virtualIndexes = (() => {
    const raw = String(config.alternateSearchVirtualIndexes || '').trim()
    if (!raw) return {}
    try {
      const parsed = JSON.parse(raw)
      return typeof parsed === 'object' && parsed !== null ? parsed : {}
    } catch {
      return {}
    }
  })() as Record<string, { sourceIndex: string; filters?: Array<{ field: string; operator?: string; value: unknown }> | Record<string, unknown> }>

  const resolvedRedisClient = getRedisClient(redisUrl)
  const cacheStorage = resolvedRedisClient
    ? createRedisCacheStorage(resolvedRedisClient, { prefix: redisPrefix })
    : createMemoryCacheStorage({ maxSize: 1000 })

  const analyticsProviders = buildAnalyticsProviders(config)
  const magentoGraphqlUrl = `${magentoBaseUrl.replace(/\/$/, '')}/graphql`

  const magentoAdapter: SearchAdapter = {
    async setup() {},
    async index() {},
    async delete() {},
    async query(_indexName: string, query: SearchQuery): Promise<SearchResult> {
      const page = Number(query.page || 1) || 1
      const pageSize = Number(query.pageSize || 12) || 12
      const term = String((query as SearchQuery & { search?: string; term?: string }).search || query.q || (query as SearchQuery & { term?: string }).term || '').trim()
      const startedAt = Date.now()

      if (!magentoBaseUrl) {
        return { items: [], total: 0, page, pageSize, facets: [], took: Date.now() - startedAt }
      }

      const response = await $fetch<{ data?: { products?: { total_count?: number; items?: Array<Record<string, unknown>> } } }>(magentoGraphqlUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(process.env.MAGENTO_FORCE_AUTH === 'true' && magentoToken ? { Authorization: `Bearer ${magentoToken}` } : {}),
        },
        body: {
          query: `
            query SearchProducts($search: String!, $pageSize: Int!, $currentPage: Int!) {
              products(filter: { name: { match: $search } }, pageSize: $pageSize, currentPage: $currentPage) {
                total_count
                items {
                  sku
                  name
                  image { url }
                  small_image { url }
                  price_range {
                    minimum_price {
                      final_price { value }
                    }
                  }
                }
              }
            }
          `,
          variables: {
            search: term,
            pageSize,
            currentPage: page,
          },
        },
      })

      const items = (response?.data?.products?.items || []).map((item) => {
        const product = item as {
          sku?: string
          name?: string
          image?: { url?: string }
          small_image?: { url?: string }
          price_range?: { minimum_price?: { final_price?: { value?: number } } }
        }
        return {
          id: product.sku || '',
          title: product.name || product.sku || 'Untitled',
          name: product.name || product.sku || 'Untitled',
          image: product.small_image?.url || product.image?.url || null,
          price: product.price_range?.minimum_price?.final_price?.value ?? null,
        }
      })

      return {
        items,
        total: Number(response?.data?.products?.total_count || items.length),
        page,
        pageSize,
        facets: [],
        took: Date.now() - startedAt,
      }
    },
    async stats() {
      return { count: 0 }
    },
  }

  const directusAdapter: SearchAdapter = {
    async setup() {},
    async index() {},
    async delete() {},
    async query(_indexName: string, query: SearchQuery): Promise<SearchResult> {
      const page = Number(query.page || 1) || 1
      const pageSize = Number(query.pageSize || 12) || 12
      const term = String((query as SearchQuery & { search?: string; term?: string }).search || query.q || (query as SearchQuery & { term?: string }).term || '').trim()
      const startedAt = Date.now()

      if (!directusBaseUrl || !term) {
        return { items: [], total: 0, page, pageSize, facets: [], took: Date.now() - startedAt }
      }

      const perCollectionLimit = Math.max(1, Math.ceil(pageSize / Math.max(1, directusCollections.length)))

      const results = await Promise.allSettled(
        directusCollections.map(async (collection) => {
          const filter = {
            _or: directusSearchFields.map((field) => ({ [field]: { _icontains: term } })),
          }

          const response = await $fetch<{ data?: Array<Record<string, unknown>>; meta?: { filter_count?: number } }>(`${directusBaseUrl.replace(/\/$/, '')}/items/${collection}`, {
            method: 'GET',
            headers: {
              ...(directusToken ? { Authorization: `Bearer ${directusToken}` } : {}),
            },
            query: {
              page,
              limit: perCollectionLimit,
              fields: '*.*',
              meta: 'filter_count',
              filter: JSON.stringify(filter),
            },
          })

          const data = Array.isArray(response?.data) ? response.data : []
          const total = Number(response?.meta?.filter_count || data.length || 0)

          return {
            collection,
            total,
            items: data.map((item) => {
              const rawTitle = item.title || item.name || item.slug || item.id || 'Untitled'
              const rawDescription = item.description || item.excerpt || item.body || item.content || ''
              return {
                id: item.id ? `${collection}:${String(item.id)}` : `${collection}:${rawTitle}`,
                title: String(rawTitle),
                name: String(rawTitle),
                description: typeof rawDescription === 'string' ? rawDescription : JSON.stringify(rawDescription),
                collection,
                slug: item.slug || null,
                image: item.image || item.thumbnail || null,
                createdAt: item.date_created || item.createdAt || null,
                updatedAt: item.date_updated || item.updatedAt || null,
              }
            }),
          }
        }),
      )

      const mergedItems: Array<Record<string, unknown>> = []
      let total = 0
      for (const result of results) {
        if (result.status !== 'fulfilled') continue
        total += result.value.total
        mergedItems.push(...result.value.items)
      }

      return {
        items: mergedItems.slice(0, pageSize),
        total,
        page,
        pageSize,
        facets: [],
        took: Date.now() - startedAt,
      }
    },
    async stats() {
      return { count: 0 }
    },
  }

  const backends: ProxyBackendPreset[] = []
  const shouldUseEnvAdapter = adapter !== ''

  if (shouldUseEnvAdapter) {
    if (adapter === 'memory') {
      instance = createSearch({
        adapter: memoryAdapter(),
        indexPrefix,
        indexAliases,
        virtualIndexes,
        plugins: [
          caching({
            ttl: cacheTtlMs,
            storage: cacheStorage,
          }),
        ],
        analytics: analyticsProviders,
        indexes: buildDefaultIndexes(configuredIndexes),
      })
      void seedDemoData(instance, configuredIndexes)
      return instance
    }

    if (adapter === 'multi-backend') {
      const urls = parseUrlList(configuredUrlRaw)
      const resolvedUrls = urls.length > 0 ? urls : [baseUrl]

      resolvedUrls.forEach((url, index) => {
        backends.push({
          kind: 'elasticsearch',
          id: `multi-backend-${index + 1}`,
          config: {
            baseUrl: url,
            ...(apiKey ? { apiKey } : {}),
            ...(username && password ? { username, password } : {}),
          },
          priority: 10 + index,
          optional: index > 0,
          weight: 100,
        })
      })
    } else if (adapter === 'opensearch' || adapter === 'elasticsearch') {
      backends.push({
        kind: 'elasticsearch',
        id: adapter,
        config: {
          baseUrl: hostPortUrl || baseUrl,
          ...(apiKey ? { apiKey } : {}),
          ...(username && password ? { username, password } : {}),
        },
        priority: 10,
        optional: false,
        weight: 100,
      })
    } else if (adapter === 'meilisearch') {
      backends.push({
        kind: 'meilisearch',
        id: 'meilisearch',
        config: {
          baseUrl: hostPortUrl || baseUrl,
          ...(apiKey ? { apiKey } : {}),
        },
        priority: 10,
        optional: false,
        weight: 100,
      })
    } else if (adapter === 'typesense') {
      const typesenseHost = hostPortUrl || baseUrl
      if (apiKey && typesenseHost) {
        backends.push({
          kind: 'typesense',
          id: 'typesense',
          config: {
            host: typesenseHost,
            apiKey,
          },
          priority: 10,
          optional: false,
          weight: 100,
        })
      }
    }
  }

  const opensearchEnabled = !shouldUseEnvAdapter && (
    provider === 'opensearch'
    || provider === 'elasticsearch'
    || provider === 'all'
    || provider === 'multi'
    || provider === ''
  )

  if (opensearchEnabled && baseUrl) {
    backends.push({
      kind: 'elasticsearch',
      id: 'opensearch',
      config: {
        baseUrl,
        ...(apiKey ? { apiKey } : {}),
        ...(username && password ? { username, password } : {}),
      },
      priority: 20,
      optional: true,
      weight: 80,
    })
  }

  const magentoEnabled = !shouldUseEnvAdapter && (
    provider === 'magento'
    || provider === 'all'
    || provider === 'multi'
    || provider === ''
  )

  if (magentoEnabled && magentoBaseUrl) {
    backends.push({
      kind: 'custom',
      id: 'magento',
      adapter: magentoAdapter,
      priority: 10,
      optional: true,
      weight: 100,
    })
  }

  const directusEnabled = !shouldUseEnvAdapter && (
    provider === 'directus'
    || provider === 'all'
    || provider === 'multi'
    || provider === ''
  )

  if (directusEnabled && directusBaseUrl) {
    backends.push({
      kind: 'custom',
      id: 'directus',
      adapter: directusAdapter,
      priority: 15,
      optional: true,
      weight: 90,
    })
  }

  const selectedBackends: ProxyBackendPreset[] = backends.length > 0 ? backends : []
  const selectedAdapter: SearchAdapter = selectedBackends.length > 0
    ? multiBackendProxyAdapter({
      backends: selectedBackends,
      aggregationStrategy: 'merge',
      parallel: true,
      debug: process.env.DEBUG_SEARCH === 'true',
    })
    : memoryAdapter()

  instance = createSearch({
    adapter: selectedAdapter,
    indexPrefix,
    indexAliases,
    virtualIndexes,
    plugins: [
      caching({
        ttl: cacheTtlMs,
        storage: cacheStorage,
      }),
    ],
    analytics: analyticsProviders,
    indexes: buildDefaultIndexes(configuredIndexes),
  })

  if (selectedBackends.length === 0) {
    void seedDemoData(instance, configuredIndexes)
  }

  return instance
}

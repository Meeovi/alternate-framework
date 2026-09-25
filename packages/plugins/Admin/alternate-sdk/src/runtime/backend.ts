type APISource = {
  name: string
  type: string
  endpoint: string
  headers?: Record<string, string>
}

type GatewayResult<T = any> = {
  ok: boolean
  data?: T
  error?: string
}

class GatewayAdapter {
  constructor(opts: { sources: APISource[]; envPrefix?: string }) {
    void opts
  }

  async executeRequest(_sourceName: string, _path: string, _opts?: {
    method?: string
    query?: Record<string, any>
    body?: any
    headers?: Record<string, string>
  }): Promise<GatewayResult> {
    throw new Error('GatewayAdapter not implemented.')
  }
}

const isBrowser = typeof (globalThis as any).window !== 'undefined'

const getRuntimeEnv = (): Record<string, string | undefined> => {
  if (typeof process !== 'undefined' && process.env) return process.env
  if (isBrowser && (globalThis as any).window?.__env__) return (globalThis as any).window.__env__
  return {}
}

let gatewayAdapter: GatewayAdapter | null = null

const createAdapterFromEnv = (prefix = 'MESH_SOURCE_'): GatewayAdapter => {
  const env = getRuntimeEnv()
  const sources: APISource[] = []

  const sourceNames = new Set<string>()
  for (const key of Object.keys(env)) {
    const match = key.match(new RegExp(`^${prefix}([A-Z]+)_ENDPOINT$`))
    if (match) sourceNames.add(match[1].toLowerCase())
  }

  for (const sourceName of sourceNames) {
    const endpoint = env[`${prefix}${sourceName.toUpperCase()}_ENDPOINT`]
    const type = (env[`${prefix}${sourceName.toUpperCase()}_TYPE`] || 'rest') as string
    const headersRaw = env[`${prefix}${sourceName.toUpperCase()}_HEADERS`]

    if (endpoint) {
      const source: APISource = {
        name: sourceName,
        type,
        endpoint,
        headers: headersRaw ? JSON.parse(headersRaw) : undefined
      }
      sources.push(source)
    }
  }

  return new GatewayAdapter({ sources, envPrefix: prefix })
}

const getGatewayAdapter = (): GatewayAdapter => {
  if (gatewayAdapter) return gatewayAdapter

  const env = getRuntimeEnv()

  if (env.DIRECTUS_URL && env.DIRECTUS_STATIC_TOKEN) {
    gatewayAdapter = new GatewayAdapter({
      sources: [{
        name: 'cms',
        type: 'rest',
        endpoint: env.DIRECTUS_URL,
        headers: { Authorization: `Bearer ${env.DIRECTUS_STATIC_TOKEN}` }
      }]
    })
    return gatewayAdapter
  }

  gatewayAdapter = createAdapterFromEnv()
  return gatewayAdapter
}

export const resetBackend = () => {
  gatewayAdapter = null
}

export const setGatewayAdapter = (adapter: GatewayAdapter) => {
  gatewayAdapter = adapter
}

export const getBackendAdapter = () => getGatewayAdapter()

const executeDataSource = async (sourceName: string, path: string, opts?: {
  method?: string
  query?: Record<string, any>
  body?: any
  headers?: Record<string, string>
}): Promise<GatewayResult> => {
  const adapter = getGatewayAdapter()
  return adapter.executeRequest(sourceName, path, opts)
}

const backend = {
  async readItem(source: string, id: string): Promise<GatewayResult> {
    return executeDataSource(source, `/items/${id}`, { method: 'GET' })
  },

  async readItems(source: string, params?: {
    fields?: string[]
    filter?: Record<string, any>
    limit?: number
    meta?: string[]
    query?: Record<string, any>
  }): Promise<GatewayResult> {
    const query: Record<string, any> = {}
    if (params?.fields) query.fields = params.fields
    if (params?.filter) query.filter = params.filter
    if (params?.limit) query.limit = params.limit
    if (params?.meta) query.meta = params.meta

    const opts: any = { method: 'GET' }
    if (Object.keys(query).length > 0) opts.query = query
    if (params?.query) opts.query = { ...opts.query, ...params.query }

    return executeDataSource(source, '/items', opts)
  },

  async createItem(source: string, item: any): Promise<GatewayResult> {
    return executeDataSource(source, '/items', { method: 'POST', body: item })
  },

  async updateItem(source: string, id: string, item: any): Promise<GatewayResult> {
    return executeDataSource(source, `/items/${id}`, { method: 'PATCH', body: item })
  },

  async deleteItem(source: string, id: string): Promise<GatewayResult> {
    return executeDataSource(source, `/items/${id}`, { method: 'DELETE' })
  },

  async search(source: string, params: {
    query?: string
    limit?: number
    [key: string]: any
  }): Promise<GatewayResult> {
    const query: Record<string, any> = {}
    if (params.query) query.search = params.query
    if (params.limit) query.limit = params.limit

    Object.keys(params).forEach((key) => {
      if (!['query', 'limit'].includes(key)) query[key] = params[key]
    })

    return executeDataSource(source, '/search', { method: 'GET', query })
  },

  async get(source: string, path: string, opts?: {
    method?: string
    query?: Record<string, any>
    body?: any
    headers?: Record<string, string>
  }): Promise<GatewayResult> {
    return executeDataSource(source, path, opts)
  }
}

export { backend, executeDataSource, getGatewayAdapter, createAdapterFromEnv }

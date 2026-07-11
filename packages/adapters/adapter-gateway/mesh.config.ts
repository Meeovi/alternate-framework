import type { APISource, SecurityConfig, RateLimitConfig, CacheConfig, HiveConfig } from './types'

const loadSourcesFromEnvRuntime = (prefix = 'MESH_SOURCE_'): APISource[] => {
  const sources: APISource[] = []
  const env = typeof process !== 'undefined' ? process.env : undefined

  if (!env) {
    return sources
  }

  const sourceNames = new Set<string>()
  for (const key of Object.keys(env)) {
    const match = key.match(new RegExp(`^${prefix}([A-Z]+)_ENDPOINT$`))
    if (match) {
      sourceNames.add(match[1].toLowerCase())
    }
  }

  for (const sourceName of sourceNames) {
    const endpoint = env[`${prefix}${sourceName.toUpperCase()}_ENDPOINT`]
    const type = (env[`${prefix}${sourceName.toUpperCase()}_TYPE`] || 'rest') as string
    const headersRaw = env[`${prefix}${sourceName.toUpperCase()}_HEADERS`]
    const secret = env[`${prefix}${sourceName.toUpperCase()}_SECRET`]

    if (endpoint) {
      const source: APISource = {
        name: sourceName,
        type,
        endpoint,
        headers: headersRaw ? JSON.parse(headersRaw) : undefined,
        secret
      }
      sources.push(source)
    }
  }

  return sources
}

const createSourceHandler = (source: APISource): any => {
  const mergeConfig = {
    ...(source.headers && { headers: source.headers })
  }

  switch (source.type) {
    case 'graphql':
      return {
        name: source.name,
        handler: 'http',
        config: {
          endpoint: source.endpoint,
          ...mergeConfig
        } as any
      }
    case 'openapi':
    case 'swagger':
      return {
        name: source.name,
        handler: '@omnigraph/openapi',
        config: {
          source: source.endpoint,
          ...mergeConfig
        } as any
      }
    case 'grpc':
      return {
        name: source.name,
        handler: '@omnigraph/grpc',
        config: {
          endpoint: source.endpoint,
          ...mergeConfig
        } as any
      }
    case 'mongoose':
      return {
        name: source.name,
        handler: '@graphql-mesh/mongoose',
        config: {
          connectionString: source.endpoint,
          ...(source.headers && { dbOptions: source.headers })
        } as any
      }
    case 'mysql':
    case 'mariadb':
      return {
        name: source.name,
        handler: '@omnigraph/mysql',
        config: {
          connectionString: source.endpoint,
          ...(source.headers && { connectionOptions: source.headers })
        } as any
      }
    case 'postgraphile':
      return {
        name: source.name,
        handler: '@graphql-mesh/postgraphile',
        config: {
          connectionString: source.endpoint,
          ...mergeConfig
        } as any
      }
    case 'subscription':
      return {
        name: source.name,
        handler: 'http',
        config: {
          endpoint: source.endpoint,
          ...mergeConfig
        } as any
      }
    case 'webhook':
      return {
        name: source.name,
        handler: 'webhook',
        config: {
          endpoint: source.endpoint,
          secret: source.secret,
          ...mergeConfig
        } as any
      }
    case 'rest':
    default:
      return {
        name: source.name,
        handler: 'http',
        config: {
          endpoint: source.endpoint,
          ...mergeConfig
        } as any
      }
  }
}

type TransformsConfig = {
  prefix?: string
  rename?: Array<{ from: string; to: string }>
  namingConvention?: { typeNames?: boolean; fieldNames?: boolean; transformRootTypes?: boolean }
  filterSchema?: { type?: string[]; field?: string[] }
  hoistField?: Array<{ type: string; path: string }>
  encapsulate?: { rules?: Array<{ applyTo: string; remove?: boolean }> }
  prune?: { enabled?: boolean }
  federation?: { enabled?: boolean }
}

const loadTransformsFromEnv = (): TransformsConfig | undefined => {
  if (typeof process === 'undefined' || !process.env) return undefined
  const env = process.env
  const transforms: TransformsConfig = {}

  // Prefix transform
  if (env.MESH_TRANSFORMS_PREFIX) {
    transforms.prefix = env.MESH_TRANSFORMS_PREFIX
  }

  // Rename transform (comma-separated pairs like "User:UserAccount,Product:StoreProduct")
  if (env.MESH_TRANSFORMS_RENAME) {
    try {
      transforms.rename = env.MESH_TRANSFORMS_RENAME.split(',').map(pair => {
        const [from, to] = pair.split(':')
        return { from, to }
      })
    } catch {
      transforms.rename = []
    }
  }

  // Naming convention
  transforms.namingConvention = {
    typeNames: env.MESH_TRANSFORMS_NAMING_CONVENTION_TYPES !== 'false',
    fieldNames: env.MESH_TRANSFORMS_NAMING_CONVENTION_FIELDS !== 'false',
    transformRootTypes: env.MESH_TRANSFORMS_NAMING_CONVENTION_ROOT !== 'false'
  }

  // Filter schema
  transforms.filterSchema = {}
  if (env.MESH_TRANSFORMS_FILTER_TYPES) {
    transforms.filterSchema.type = env.MESH_TRANSFORMS_FILTER_TYPES.split(',')
  }
  if (env.MESH_TRANSFORMS_FILTER_FIELDS) {
    transforms.filterSchema.field = env.MESH_TRANSFORMS_FILTER_FIELDS.split(',')
  }

  // Hoist field
  if (env.MESH_TRANSFORMS_HOIST_FIELDS) {
    try {
      transforms.hoistField = env.MESH_TRANSFORMS_HOIST_FIELDS.split(',').map(pair => {
        const [type, path] = pair.split(':')
        return { type, path }
      })
    } catch {
      transforms.hoistField = []
    }
  }

  // Encapsulate
  if (env.MESH_TRANSFORMS_ENCAPSULATE) {
    try {
      transforms.encapsulate = JSON.parse(env.MESH_TRANSFORMS_ENCAPSULATE)
    } catch {
      transforms.encapsulate = {}
    }
  }

  // Prune
  transforms.prune = {
    enabled: env.MESH_TRANSFORMS_PRUNE !== 'false'
  }

  // Federation
  transforms.federation = {
    enabled: env.MESH_TRANSFORMS_FEDERATION === 'true'
  }

  return Object.keys(transforms).length > 0 ? transforms : undefined
}

const getSecurityConfig = (): SecurityConfig | undefined => {
  if (typeof process === 'undefined' || !process.env) return undefined

  const env = process.env
  const apiKey = env.MESH_SECURITY_API_KEY
  const jwtSecret = env.MESH_SECURITY_JWT_SECRET
  const corsOrigin = env.MESH_SECURITY_CORS_ORIGIN

  if (!apiKey && !jwtSecret && !corsOrigin) return undefined

  return { apiKey, jwtSecret, corsOrigin }
}

const getRateLimitConfig = (): RateLimitConfig | undefined => {
  if (typeof process === 'undefined' || !process.env) return undefined

  const env = process.env
  const maxRequests = env.MESH_RATELIMIT_MAX ? parseInt(env.MESH_RATELIMIT_MAX, 10) : undefined
  const windowMs = env.MESH_RATELIMIT_WINDOW_MS ? parseInt(env.MESH_RATELIMIT_WINDOW_MS, 10) : undefined

  if (!maxRequests && !windowMs) return undefined

  return { maxRequests, windowMs }
}

const getCacheConfig = (): CacheConfig | undefined => {
  if (typeof process === 'undefined' || !process.env) return undefined

  const env = process.env
  const ttl = env.MESH_CACHE_TTL ? parseInt(env.MESH_CACHE_TTL, 10) : undefined
  const maxSize = env.MESH_CACHE_MAX_SIZE ? parseInt(env.MESH_CACHE_MAX_SIZE, 10) : undefined

  if (!ttl && !maxSize) return undefined

  return { ttl, maxSize }
}

const getHiveConfig = (): HiveConfig | undefined => {
  if (typeof process === 'undefined' || !process.env) return undefined

  const env = process.env
  const token = env.MESH_HIVE_TOKEN
  const endpoint = env.MESH_HIVE_ENDPOINT

  if (!token) return undefined

  return { token, endpoint }
}

const sources = loadSourcesFromEnvRuntime().map(createSourceHandler)
const transforms = loadTransformsFromEnv()

const meshConfig: any = {
  sources,
  transforms: transforms && [
    // Prefix transform
    ...(transforms.prefix ? [{
      name: 'prefix',
      config: {
        value: transforms.prefix,
        propagate: true
      } as any
    }] : []),

    // Rename transform
    ...(transforms.rename && transforms.rename.length > 0 ? [{
      name: 'rename',
      config: transforms.rename as any
    }] : []),

    // Naming convention transform
    ...(transforms.namingConvention ? [{
      name: 'naming-convention',
      config: transforms.namingConvention as any
    }] : []),

    // Filter schema transform
    ...(transforms.filterSchema && (transforms.filterSchema.type || transforms.filterSchema.field) ? [{
      name: 'filter-schema',
      config: transforms.filterSchema as any
    }] : []),

    // Hoist field transform
    ...(transforms.hoistField && transforms.hoistField.length > 0 ? [{
      name: 'hoist-field',
      config: { rules: transforms.hoistField } as any
    }] : []),

    // Encapsulate transform
    ...(transforms.encapsulate && transforms.encapsulate.rules ? [{
      name: 'encapsulate',
      config: transforms.encapsulate as any
    }] : []),

    // Prune transform
    ...(transforms.prune?.enabled !== false ? [{
      name: 'prune',
      config: {} as any
    }] : []),

    // Federation transform
    ...(transforms.federation?.enabled ? [{
      name: 'federation',
      config: {} as any
    }] : [])
  ],
  // Envelop plugins for security
  ...(getSecurityConfig() && {
    plugins: [
      // API Key authentication
      ...(getSecurityConfig()?.apiKey ? [{
        name: 'apiKey-auth',
        config: {
          apiKeyHeader: getSecurityConfig()?.apiKey
        } as any
      }] : []),
      // Rate limiting
      ...(getRateLimitConfig() ? [{
        name: 'rate-limit',
        config: {
          maxRequests: getRateLimitConfig()?.maxRequests,
          windowMs: getRateLimitConfig()?.windowMs
        } as any
      }] : []),
      // Response caching
      ...(getCacheConfig() ? [{
        name: 'cache',
        config: {
          ttl: getCacheConfig()?.ttl,
          maxSize: getCacheConfig()?.maxSize
        } as any
      }] : [])
    ]
  }),
  // Hive integration
  ...(getHiveConfig() && {
    telemetry: {
      ...getHiveConfig()
    } as any
  })
}

export default meshConfig
/**
 * Settings, from Directus's env (the endpoint context) with process.env as
 * a fallback. Only MAGEOS_URL is required; live stock (/commerce/realtime/stock)
 * needs MAGEOS_TOKEN, plus MAGEOS_CONSUMER_KEY/_SECRET and MAGEOS_TOKEN_SECRET
 * unless the store accepts integration tokens as Bearer tokens.
 */
export interface CommerceConfig {
  mageos: {
    /** Store base URL, no trailing slash, e.g. https://shop.example.com */
    url: string
    /** Integration access token (System › Integrations), used for REST. */
    token: string
    /** With token, the integration's other credentials: REST calls are then OAuth 1.0a-signed. */
    consumerKey: string
    consumerSecret: string
    tokenSecret: string
    /** `Store` header — store view code; empty = the default store. */
    storeCode: string
    timeoutMs: number
    /** Category tree depth fetched below the root category. */
    categoryDepth: number
  }
  cache: {
    store: 'redis' | 'memory'
    /** ioredis connection string; empty = Directus's own REDIS_* settings. */
    redisUrl: string
    namespace: string
    /** Seconds a catalog read is fresh (also the CDN s-maxage). */
    ttl: number
    /** Seconds a stale read is served while it refreshes (stale-while-revalidate). */
    staleWhileRevalidate: number
    /** Seconds a stale read may still be served when Mage-OS is failing. */
    staleIfError: number
    /** Seconds live stock answers are reused (0 = never). */
    stockTtl: number
  }
  stockRequiresAuth: boolean
  /**
   * Who may call the privileged routes (customers, orders, sellers, sync,
   * admin): Directus admins, plus these Directus user / role ids — e.g. the
   * user behind the app server's static token.
   */
  trusted: { users: string[], roles: string[] }
}

type Env = Record<string, unknown>

const str = (env: Env, key: string, fallback = '') => {
  const value = env[key] ?? process.env[key]
  return value === undefined || value === null ? fallback : String(value).trim()
}
const int = (env: Env, key: string, fallback: number, min = 0) => {
  const value = Number.parseInt(str(env, key), 10)
  return Number.isFinite(value) && value >= min ? value : fallback
}
const list = (env: Env, key: string) => {
  const value = env[key] ?? process.env[key]
  const items = Array.isArray(value) ? value.map(String) : str(env, key).split(',')
  return items.map((item) => item.trim()).filter(Boolean)
}
const bool = (env: Env, key: string, fallback: boolean) => {
  const value = str(env, key).toLowerCase()
  return value === '' ? fallback : value === 'true' || value === '1'
}

export function readConfig(env: Env = {}): CommerceConfig {
  return {
    mageos: {
      url: str(env, 'MAGEOS_URL').replace(/\/+$/, ''),
      token: str(env, 'MAGEOS_TOKEN'),
      consumerKey: str(env, 'MAGEOS_CONSUMER_KEY'),
      consumerSecret: str(env, 'MAGEOS_CONSUMER_SECRET'),
      tokenSecret: str(env, 'MAGEOS_TOKEN_SECRET'),
      storeCode: str(env, 'MAGEOS_STORE_CODE'),
      timeoutMs: int(env, 'MAGEOS_TIMEOUT_MS', 8000, 500),
      categoryDepth: Math.min(int(env, 'MAGEOS_CATEGORY_DEPTH', 6, 1), 10),
    },
    cache: {
      store: str(env, 'MAGEOS_CACHE_STORE', 'redis') === 'memory' ? 'memory' : 'redis',
      redisUrl: str(env, 'MAGEOS_CACHE_REDIS_URL'),
      namespace: str(env, 'MAGEOS_CACHE_NAMESPACE', 'mageos-commerce'),
      ttl: int(env, 'MAGEOS_CACHE_TTL', 300),
      staleWhileRevalidate: int(env, 'MAGEOS_CACHE_SWR', 60),
      staleIfError: int(env, 'MAGEOS_CACHE_STALE_IF_ERROR', 86_400),
      stockTtl: int(env, 'MAGEOS_STOCK_CACHE_SECONDS', 5),
    },
    stockRequiresAuth: bool(env, 'MAGEOS_STOCK_REQUIRE_AUTH', false),
    trusted: { users: list(env, 'MAGEOS_TRUSTED_USERS'), roles: list(env, 'MAGEOS_TRUSTED_ROLES') },
  }
}

/** Directus's own Redis settings (REDIS or REDIS_HOST/PORT/…), for reuse when MAGEOS_CACHE_REDIS_URL isn't set. */
export function directusRedisOptions(env: Env): string | { host: string, port: number, username?: string, password?: string, db?: number } | null {
  const url = str(env, 'REDIS')
  if (url) return url
  const host = str(env, 'REDIS_HOST')
  if (!host) return null
  return {
    host,
    port: int(env, 'REDIS_PORT', 6379, 1),
    username: str(env, 'REDIS_USERNAME') || undefined,
    password: str(env, 'REDIS_PASSWORD') || undefined,
    db: str(env, 'REDIS_DB') ? int(env, 'REDIS_DB', 0) : undefined,
  }
}

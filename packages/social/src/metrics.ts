export interface SocialMetrics {
  requests: number
  successes: number
  failures: number
  cacheHits: number
  cacheMisses: number
  backgroundRefreshes: number
}

const metrics = new Map<string, SocialMetrics>()

function getProviderMetrics(provider: string): SocialMetrics {
  if (!metrics.has(provider)) {
    metrics.set(provider, {
      requests: 0,
      successes: 0,
      failures: 0,
      cacheHits: 0,
      cacheMisses: 0,
      backgroundRefreshes: 0
    })
  }
  return metrics.get(provider)!
}

export function recordRequest(provider: string) {
  getProviderMetrics(provider).requests++
}

export function recordSuccess(provider: string) {
  getProviderMetrics(provider).successes++
}

export function recordFailure(provider: string) {
  getProviderMetrics(provider).failures++
}

export function recordCacheHit(provider: string) {
  getProviderMetrics(provider).cacheHits++
}

export function recordCacheMiss(provider: string) {
  getProviderMetrics(provider).cacheMisses++
}

export function recordBackgroundRefresh(provider: string) {
  getProviderMetrics(provider).backgroundRefreshes++
}

export function getMetrics(provider: string) {
  return getProviderMetrics(provider)
}

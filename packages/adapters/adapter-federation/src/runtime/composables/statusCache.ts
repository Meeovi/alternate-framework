import type { mastodon } from '../../clients/mastodon'

export interface StatusCacheToolsDeps {
  getCurrentServer: () => string
}

export function createStatusCacheTools(deps: StatusCacheToolsDeps) {
  const statusCache = new Map<string, Map<string, mastodon.v1.Status>>()

  function cacheStatus(status: mastodon.v1.Status, server?: string, override = false) {
    const cacheKeyServer = server || deps.getCurrentServer()

    if (!statusCache.has(cacheKeyServer))
      statusCache.set(cacheKeyServer, new Map())

    const serverCache = statusCache.get(cacheKeyServer)!
    if (override || !serverCache.has(status.id))
      serverCache.set(status.id, status)
  }

  function removeCachedStatus(id: string, server?: string) {
    const cacheKeyServer = server || deps.getCurrentServer()
    const serverCache = statusCache.get(cacheKeyServer)
    if (serverCache)
      serverCache.delete(id)
  }

  function getCachedStatus(id: string, server?: string): mastodon.v1.Status | undefined {
    const cacheKeyServer = server || deps.getCurrentServer()
    return statusCache.get(cacheKeyServer)?.get(id)
  }

  function clearStatusCache(server?: string) {
    if (server)
      statusCache.delete(server)
    else
      statusCache.clear()
  }

  return {
    cacheStatus,
    removeCachedStatus,
    getCachedStatus,
    clearStatusCache,
  }
}

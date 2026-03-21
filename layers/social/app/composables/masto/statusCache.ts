import type { mastodon } from 'masto'
import { currentServer } from '../users'

const statusCache = new Map<string, Map<string, mastodon.v1.Status>>()

/**
 * Cache a status for a given server
 */
export function cacheStatus(status: mastodon.v1.Status, server?: string, override = false) {
  const cacheKeyServer = server || currentServer.value
  
  if (!statusCache.has(cacheKeyServer)) {
    statusCache.set(cacheKeyServer, new Map())
  }

  const serverCache = statusCache.get(cacheKeyServer)!
  
  if (override || !serverCache.has(status.id)) {
    serverCache.set(status.id, status)
  }
}

/**
 * Remove a cached status from the cache for a given server
 */
export function removeCachedStatus(id: string, server?: string) {
  const cacheKeyServer = server || currentServer.value
  const serverCache = statusCache.get(cacheKeyServer)
  
  if (serverCache) {
    serverCache.delete(id)
  }
}

/**
 * Get a cached status from the cache for a given server
 */
export function getCachedStatus(id: string, server?: string): mastodon.v1.Status | undefined {
  const cacheKeyServer = server || currentServer.value
  const serverCache = statusCache.get(cacheKeyServer)
  
  return serverCache?.get(id)
}

/**
 * Clear all cached statuses for a given server, or all servers if no server is specified
 */
export function clearStatusCache(server?: string) {
  if (server) {
    statusCache.delete(server)
  } else {
    statusCache.clear()
  }
}

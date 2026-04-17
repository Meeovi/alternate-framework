import {
  createStatusCacheTools,
  type mastodon,
} from '@mframework/adapter-federation'
import { currentServer } from '../..'

const statusCacheTools = createStatusCacheTools({
  getCurrentServer: () => currentServer.value,
})

/**
 * Cache a status for a given server
 */
export function cacheStatus(status: mastodon.v1.Status, server?: string, override = false) {
  statusCacheTools.cacheStatus(status, server, override)
}

/**
 * Remove a cached status from the cache for a given server
 */
export function removeCachedStatus(id: string, server?: string) {
  statusCacheTools.removeCachedStatus(id, server)
}

/**
 * Get a cached status from the cache for a given server
 */
export function getCachedStatus(id: string, server?: string): mastodon.v1.Status | undefined {
  return statusCacheTools.getCachedStatus(id, server)
}

/**
 * Clear all cached statuses for a given server, or all servers if no server is specified
 */
export function clearStatusCache(server?: string) {
  statusCacheTools.clearStatusCache(server)
}

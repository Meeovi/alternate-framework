import type { mastodon } from '../../clients/mastodon'

export interface FetchStatusToolsDeps {
  useFederationClient: () => mastodon.rest.Client
  getCachedStatus: (cacheKey: string) => mastodon.v1.Status | null
  setCachedStatus: (cacheKey: string, status: mastodon.v1.Status) => void
}

export interface FetchStatusTools {
  fetchStatus: (id: string, force?: boolean) => Promise<mastodon.v1.Status | null>
}

export function createFetchStatusTools(deps: FetchStatusToolsDeps): FetchStatusTools {
  async function fetchStatus(id: string, force = false): Promise<mastodon.v1.Status | null> {
    try {
      const cacheKey = `status:${id}`
      if (!force) {
        const cached = deps.getCachedStatus(cacheKey)
        if (cached)
          return cached
      }

      const status = await deps.useFederationClient().v1.statuses.$select(id).fetch()
      deps.setCachedStatus(cacheKey, status)
      return status
    }
    catch {
      return null
    }
  }

  return {
    fetchStatus,
  }
}

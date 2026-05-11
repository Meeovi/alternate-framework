import {
  createFetchStatusTools,
  type mastodon,
} from '@mframework/adapter-federation'
import { useFederationClient as useMastoClient } from '.'

const fetchStatusTools = createFetchStatusTools({
  useFederationClient: () => {
    const client = useMastoClient()
    if (!client)
      throw new Error('Mastodon client unavailable')
    return client
  },
  getCachedStatus: cacheKey => useState<mastodon.v1.Status | null>(cacheKey, () => null).value,
  setCachedStatus: (cacheKey, status) => {
    useState<mastodon.v1.Status | null>(cacheKey, () => status).value = status
  },
})

export const fetchStatus = fetchStatusTools.fetchStatus
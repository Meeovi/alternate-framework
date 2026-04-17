import {
  createFetchStatusTools,
  type mastodon,
} from '@mframework/adapter-federation'
import { useFederationClient as useMastoClient } from '.'

const fetchStatusTools = createFetchStatusTools({
  useFederationClient: () => useMastoClient(),
  getCachedStatus: cacheKey => useState<mastodon.v1.Status | null>(cacheKey, () => null).value,
  setCachedStatus: (cacheKey, status) => {
    useState<mastodon.v1.Status | null>(cacheKey, () => status).value = status
  },
})

export const fetchStatus = fetchStatusTools.fetchStatus
import type { mastodon } from 'masto'
import { useMastoClient } from './federation/masto/masto'

export async function fetchStatus(id: string, force = false): Promise<mastodon.v1.Status | null> {
  try {
    const cacheKey = `status:${id}`
    if (!force) {
      const cached = useState<mastodon.v1.Status | null>(cacheKey, () => null)
      if (cached.value)
        return cached.value
    }

    const status = await useMastoClient().v1.statuses.$select(id).fetch()
    useState<mastodon.v1.Status | null>(cacheKey, () => status).value = status
    return status
  }
  catch {
    return null
  }
}
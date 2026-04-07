import { useMastoClient } from '../composables/masto-client'

export async function fetchAccountInfo(id: string): Promise<any> {
  try {
    const client = useMastoClient()
    const fn = client.v1?.accounts?.$select?.(id)?.fetch || client.v1?.accounts?.fetch
    if (typeof fn === 'function') {
      return await fn()
    }
    // try common REST shape
    const maybe = client.client?.value ?? client
    if (maybe?.v1?.accounts?.$select) return maybe.v1.accounts.$select(id).fetch()
  } catch (e) {
    // swallow and return null for callers to handle
    return null
  }
  return null
}

export function cacheAccount(_account: any): void {
  // For production, a shared in-memory cache could be implemented here.
  // Keep no-op for now; callers rely on return value from fetchAccountInfo.
}

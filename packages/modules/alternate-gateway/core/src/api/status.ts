import { useMastoClient } from '../composables/masto-client'

export async function fetchStatus(id: string): Promise<any> {
  try {
    const client = useMastoClient()
    const fn = client.v1?.statuses?.$select?.(id)?.fetch || client.v1?.statuses?.fetch
    if (typeof fn === 'function') {
      return await fn()
    }
    const maybe = client.client?.value ?? client
    if (maybe?.v1?.statuses?.$select) return maybe.v1.statuses.$select(id).fetch()
  } catch (e) {
    return null
  }
  return null
}

// Additional context or functions can go here
// Additional helpers may be added here

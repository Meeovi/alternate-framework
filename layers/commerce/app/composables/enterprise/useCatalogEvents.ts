import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfEvent } from '~/composables/system/models'

export function useCatalogEvents() {
  const client = getCommerceClient() as CommerceClient

  async function listCatalogEvents(params: Record<string, any> = {}): Promise<SfEvent[]> {
    return client.listCatalogEvents(params)
  }

  async function getCatalogEventById(id: string): Promise<SfEvent | null> {
    return client.getCatalogEventById(id)
  }

  return {
    listCatalogEvents,
    getCatalogEventById,
  }
}

export default useCatalogEvents

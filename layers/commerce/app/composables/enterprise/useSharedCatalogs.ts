import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfSharedCatalog } from '~/composables/system/models'

export function useSharedCatalogs() {
  const client = getCommerceClient() as CommerceClient

  async function listSharedCatalogs(params: Record<string, any> = {}): Promise<SfSharedCatalog[]> {
    return client.listSharedCatalogs(params)
  }

  async function getSharedCatalogById(id: string): Promise<SfSharedCatalog | null> {
    return client.getSharedCatalogById(id)
  }

  return {
    listSharedCatalogs,
    getSharedCatalogById,
  }
}

export default useSharedCatalogs

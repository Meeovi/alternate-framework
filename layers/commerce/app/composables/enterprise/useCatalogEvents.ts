import { createEnterpriseResource } from './useEnterpriseResource'
import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfEvent } from '../system/models'

export function useCatalogEvents() {
  const client = getCommerceClient() as CommerceClient
  return createEnterpriseResource({
    listCatalogEvents: (c, params: Record<string, any> = {}) => c.listCatalogEvents(params),
    getCatalogEventById: (c, id: string) => c.getCatalogEventById(id),
  } as Record<string, (client: CommerceClient, ...args: any[]) => Promise<any>>)
}
export default useCatalogEvents

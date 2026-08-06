import { createEnterpriseResource } from './useEnterpriseResource'
import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfDynamicBlock } from '~/composables/system/models'

export function useDynamicBlocks() {
  const client = getCommerceClient() as CommerceClient
  return createEnterpriseResource({
    listDynamicBlocks: (c, params: Record<string, any> = {}) => c.listDynamicBlocks(params),
    getDynamicBlockById: (c, id: string) => c.getDynamicBlockById(id),
  } as Record<string, (client: CommerceClient, ...args: any[]) => Promise<any>>)
}
export default useDynamicBlocks

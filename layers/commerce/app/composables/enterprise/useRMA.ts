import { createEnterpriseResource } from './useEnterpriseResource'
import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfRMARequest, SfRMAItem } from '../system/models'

export function useRMA() {
  const client = getCommerceClient() as CommerceClient
  return createEnterpriseResource({
    createRMA: (c, orderId: string, items: SfRMAItem[]) => c.createRMA({ orderId, items }),
    getReturns: (c, opts: Record<string, any> = {}) => c.listReturns(opts),
    getReturnById: (c, id: string) => c.getReturn(id),
  } as Record<string, (client: CommerceClient, ...args: any[]) => Promise<any>>)
}
export default useRMA

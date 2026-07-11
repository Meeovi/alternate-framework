import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfRMARequest, SfRMAItem } from '~/composables/system/models'

export function useRMA() {
  const client = getCommerceClient() as CommerceClient

  async function createRMA(orderId: string, items: SfRMAItem[]): Promise<SfRMARequest | null> {
    return client.createRMA({ orderId, items })
  }

  async function getReturns(opts: Record<string, any> = {}): Promise<SfRMARequest[]> {
    return client.listReturns(opts)
  }

  async function getReturnById(id: string): Promise<SfRMARequest | null> {
    return client.getReturn(id)
  }

  return {
    createRMA,
    getReturns,
    getReturnById,
  }
}

export default useRMA

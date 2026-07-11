import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfStoreCredit } from '~/composables/system/models'

export function useStoreCredit() {
  const client = getCommerceClient() as CommerceClient

  async function getStoreCredit(customerId: string): Promise<SfStoreCredit | null> {
    return client.getStoreCredit(customerId)
  }

  async function updateStoreCredit(customerId: string, amount: number) {
    return client.updateStoreCredit({ customerId, amount })
  }

  async function applyStoreCreditToCart(cartId: string, amount: number) {
    return client.applyStoreCreditToCart({ cartId, amount })
  }

  return {
    getStoreCredit,
    updateStoreCredit,
    applyStoreCreditToCart,
  }
}

export default useStoreCredit

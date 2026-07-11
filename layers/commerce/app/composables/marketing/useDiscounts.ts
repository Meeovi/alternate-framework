import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'

export function useDiscounts() {
  const client = getCommerceClient() as CommerceClient

  async function listDiscounts(opts: Record<string, unknown> = {}) {
    return client.listDiscounts(opts)
  }

  async function getDiscountForCart(cartId: string) {
    return client.getDiscountForCart(cartId)
  }

  return {
    listDiscounts,
    getDiscountForCart,
  }
}

export default useDiscounts

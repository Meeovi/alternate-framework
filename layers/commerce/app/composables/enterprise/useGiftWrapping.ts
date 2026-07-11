import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'

export interface GiftWrappingOption {
  id: string
  name: string
  price: number
  image?: string
  isDefault?: boolean
}

export interface GiftWrapRequest {
  itemId: string
  wrappingId: string
}

export function useGiftWrapping() {
  const client = getCommerceClient() as CommerceClient

  async function listGiftWrappingOptions(params: Record<string, any> = {}): Promise<GiftWrappingOption[]> {
    return client.listGiftWrappingOptions(params)
  }

  async function addGiftWrapToCart(cartId: string, request: GiftWrapRequest) {
    return client.addGiftWrapToCart({ cartId, ...request })
  }

  async function removeGiftWrapFromCart(cartId: string, itemId: string) {
    return client.removeGiftWrapFromCart({ cartId, itemId })
  }

  return {
    listGiftWrappingOptions,
    addGiftWrapToCart,
    removeGiftWrapFromCart,
  }
}

export default useGiftWrapping

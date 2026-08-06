import { createEnterpriseResource } from './useEnterpriseResource'
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
  return createEnterpriseResource({
    listGiftWrappingOptions: (c, params: Record<string, any> = {}) =>
      c.listGiftWrappingOptions(params),
    addGiftWrapToCart: (c, cartId: string, request: GiftWrapRequest) =>
      c.addGiftWrapToCart({ cartId, ...request }),
    removeGiftWrapFromCart: (c, cartId: string, itemId: string) =>
      c.removeGiftWrapFromCart({ cartId, itemId }),
  } as Record<string, (client: CommerceClient, ...args: any[]) => Promise<any>>)
}
export default useGiftWrapping

import { createEnterpriseResource } from './useEnterpriseResource'
import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfCart } from '~/composables/system/models'

export interface OrderBySkuPayload {
  sku: string
  qty: number
  productOptions?: Record<string, any>
}

export interface OrderBySkuResult {
  success: boolean
  cart: SfCart
  message?: string
}

export function useOrderBySku() {
  const client = getCommerceClient() as CommerceClient
  return createEnterpriseResource({
    orderBySku: (c, payload: OrderBySkuPayload) => c.orderBySku(payload),
    addToCartBySku: (c, sku: string, qty: number, cartId?: string) =>
      c.addCartLineItem({ sku, qty, cartId }),
  } as Record<string, (client: CommerceClient, ...args: any[]) => Promise<any>>)
}
export default useOrderBySku

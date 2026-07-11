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

  async function orderBySku(payload: OrderBySkuPayload): Promise<OrderBySkuResult> {
    return client.orderBySku(payload)
  }

  async function addToCartBySku(sku: string, qty: number, cartId?: string) {
    return client.addCartLineItem({ sku, qty, cartId })
  }

  return {
    orderBySku,
    addToCartBySku,
  }
}

export default useOrderBySku

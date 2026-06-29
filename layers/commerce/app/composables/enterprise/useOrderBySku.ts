import { getCommerceClient } from '../../utils/client'
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
	const client = getCommerceClient()

	async function orderBySku(payload: OrderBySkuPayload): Promise<OrderBySkuResult> {
		if (client && typeof client.orderBySku === 'function') {
			return client.orderBySku(payload) as Promise<OrderBySkuResult>
		}
		return { success: false, message: 'Not implemented' }
	}

	async function addToCartBySku(sku: string, qty: number, cartId?: string) {
		if (client && typeof client.addCartLineItem === 'function') {
			return client.addCartLineItem({ sku, qty, cartId })
		}
		return { success: false, message: 'Not implemented' }
	}

	return {
		orderBySku,
		addToCartBySku,
	}
}

export default useOrderBySku

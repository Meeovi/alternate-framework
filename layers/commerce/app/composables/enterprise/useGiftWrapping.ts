import { getCommerceClient } from '../../utils/client'
import type { SfProduct } from '~/composables/system/models'

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
	const client = getCommerceClient()

	async function listGiftWrappingOptions(params: Record<string, any> = {}): Promise<GiftWrappingOption[]> {
		if (client && typeof client.listGiftWrappingOptions === 'function') {
			return client.listGiftWrappingOptions(params) as Promise<GiftWrappingOption[]>
		}
		return []
	}

	async function addGiftWrapToCart(cartId: string, request: GiftWrapRequest) {
		if (client && typeof client.addGiftWrapToCart === 'function') {
			return client.addGiftWrapToCart(cartId, request)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function removeGiftWrapFromCart(cartId: string, itemId: string) {
		if (client && typeof client.removeGiftWrapFromCart === 'function') {
			return client.removeGiftWrapFromCart(cartId, itemId)
		}
		return { success: false, reason: 'Not implemented' }
	}

	return {
		listGiftWrappingOptions,
		addGiftWrapToCart,
		removeGiftWrapFromCart,
	}
}

export default useGiftWrapping

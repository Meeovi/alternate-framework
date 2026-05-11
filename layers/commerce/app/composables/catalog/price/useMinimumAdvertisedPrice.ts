import { getCommerceClient } from '../../../utils/client'

export function useMinimumAdvertisedPrice() {
	const client = getCommerceClient()

	async function getMinimumAdvertisedPrice(product: Record<string, any>, context: Record<string, unknown> = {}) {
		if (client && typeof client.getMinimumAdvertisedPrice === 'function') {
			return client.getMinimumAdvertisedPrice(product, context)
		}
		// Fallback: try to read from product.minimumAdvertisedPrice or similar
		return product?.minimumAdvertisedPrice ?? product?.map ?? null
	}

	return { getMinimumAdvertisedPrice }
}

export default useMinimumAdvertisedPrice

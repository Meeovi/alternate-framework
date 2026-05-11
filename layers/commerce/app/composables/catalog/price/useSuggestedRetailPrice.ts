import { getCommerceClient } from '../../../utils/client'

export function useSuggestedRetailPrice() {
	const client = getCommerceClient()

	async function getSuggestedRetailPrice(product: Record<string, any>, context: Record<string, unknown> = {}) {
		if (client && typeof client.getSuggestedRetailPrice === 'function') {
			return client.getSuggestedRetailPrice(product, context)
		}
		// Fallback: try to read from product.suggestedRetailPrice or similar
		return product?.suggestedRetailPrice ?? product?.msrp ?? null
	}

	return { getSuggestedRetailPrice }
}

export default useSuggestedRetailPrice

import { getCommerceClient } from '../../utils/client'

export function useRelatedProductsRules() {
	const client = getCommerceClient()

	async function getRelatedProductsRules(productId: string) {
		if (client && typeof client.getRelatedProductsRules === 'function') {
			return client.getRelatedProductsRules(productId)
		}
		return []
	}

	return { getRelatedProductsRules }
}

export default useRelatedProductsRules

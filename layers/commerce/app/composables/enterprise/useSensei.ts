import { getCommerceClient } from '../../utils/client'
import type { SfProduct } from '~/composables/system/models'

export interface SenseiRecommendation {
  productId: string
  score: number
  reason: string
  product?: SfProduct
}

export function useSensei() {
	const client = getCommerceClient()

	async function getSenseiRecommendations(context: Record<string, any> = {}): Promise<SenseiRecommendation[]> {
		if (client && typeof client.getSenseiRecommendations === 'function') {
			return client.getSenseiRecommendations(context) as Promise<SenseiRecommendation[]>
		}
		return []
	}

	async function getProductRecommendations(productId: string, limit = 4) {
		if (client && typeof client.getProductRecommendations === 'function') {
			return client.getProductRecommendations(productId, limit)
		}
		return []
	}

	return {
		getSenseiRecommendations,
		getProductRecommendations,
	}
}

export default useSensei

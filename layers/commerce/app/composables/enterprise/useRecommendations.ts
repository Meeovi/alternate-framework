import { getCommerceClient } from '../../utils/client'
import type { SfRecommendation, SfDynamicBlock } from '~/composables/system/models'

export function useRecommendations() {
	const client = getCommerceClient()

	async function getRecommendations(context: Record<string, any> = {}): Promise<SfRecommendation[]> {
		if (client && typeof client.getRecommendations === 'function') {
			return client.getRecommendations(context) as Promise<SfRecommendation[]>
		}
		return []
	}

	async function getRecommendationRules(productId: string) {
		if (client && typeof client.getRecommendationRules === 'function') {
			return client.getRecommendationRules(productId)
		}
		return []
	}

	return {
		getRecommendations,
		getRecommendationRules,
	}
}

export default useRecommendations

import { getCommerceClient } from '../../utils/client'

export function useRecommendations() {
	const client = getCommerceClient()

	async function getRecommendations(context = {}) {
		if (client && typeof client.getRecommendations === 'function') {
			return client.getRecommendations(context)
		}
		return []
	}

	return { getRecommendations }
}

export default useRecommendations

import { getCommerceClient } from '../../utils/client'

export function useSensei() {
	const client = getCommerceClient()

	async function getSenseiRecommendations(context = {}) {
		if (client && typeof client.getSenseiRecommendations === 'function') {
			return client.getSenseiRecommendations(context)
		}
		return []
	}

	return { getSenseiRecommendations }
}

export default useSensei

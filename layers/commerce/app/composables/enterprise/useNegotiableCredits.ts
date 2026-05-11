import { getCommerceClient } from '../../utils/client'

export function useNegotiableCredits() {
	const client = getCommerceClient()

	async function getNegotiableCredits(companyId: string) {
		if (client && typeof client.getNegotiableCredits === 'function') {
			return client.getNegotiableCredits(companyId)
		}
		return null
	}

	return { getNegotiableCredits }
}

export default useNegotiableCredits

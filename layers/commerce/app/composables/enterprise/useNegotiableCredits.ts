import { getCommerceClient } from '../../utils/client'
import type { SfNegotiableCredit } from '~/composables/system/models'

export function useNegotiableCredits() {
	const client = getCommerceClient()

	async function getNegotiableCredits(companyId: string): Promise<SfNegotiableCredit[]> {
		if (client && typeof client.getNegotiableCredits === 'function') {
			return client.getNegotiableCredits(companyId) as Promise<SfNegotiableCredit[]>
		}
		return []
	}

	async function applyCreditToQuote(creditId: string, quoteId: string) {
		if (client && typeof client.applyCreditToQuote === 'function') {
			return client.applyCreditToQuote(creditId, quoteId)
		}
		return { success: false, reason: 'Not implemented' }
	}

	return {
		getNegotiableCredits,
		applyCreditToQuote,
	}
}

export default useNegotiableCredits

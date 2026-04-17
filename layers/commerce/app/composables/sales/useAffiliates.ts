import { getCommerceClient } from '../../utils/client'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useAffiliates() {
	const client = clientOrNull()

	async function listAffiliates(opts: Record<string, unknown> = {}) {
		if (client && typeof client.listAffiliates === 'function') return client.listAffiliates(opts)
		return []
	}

	async function getAffiliateSummary(affiliateId: string) {
		if (client && typeof client.getAffiliateSummary === 'function') return client.getAffiliateSummary(affiliateId)
		return null
	}

	async function trackReferral(payload: Record<string, unknown>) {
		if (client && typeof client.trackReferral === 'function') return client.trackReferral(payload)
		return { success: false, reason: 'trackReferral not implemented by provider' }
	}

	return {
		listAffiliates,
		getAffiliateSummary,
		trackReferral,
	}
}

export default useAffiliates

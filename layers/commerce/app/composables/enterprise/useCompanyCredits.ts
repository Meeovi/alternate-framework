import { getCommerceClient } from '../../utils/client'
import type { SfCompanyCredit } from '~/composables/system/models'

export function useCompanyCredits() {
	const client = getCommerceClient()

	async function getCompanyCredits(companyId: string): Promise<SfCompanyCredit | null> {
		if (client && typeof client.getCompanyCredits === 'function') {
			return client.getCompanyCredits(companyId) as Promise<SfCompanyCredit>
		}
		return null
	}

	async function updateCreditBalance(companyId: string, amount: number) {
		if (client && typeof client.updateCreditBalance === 'function') {
			return client.updateCreditBalance(companyId, amount)
		}
		return { success: false, reason: 'Not implemented' }
	}

	return {
		getCompanyCredits,
		updateCreditBalance,
	}
}

export default useCompanyCredits

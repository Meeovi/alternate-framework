import { getCommerceClient } from '../../utils/client'

export function useCompanyCredits() {
	const client = getCommerceClient()

	async function getCompanyCredits(companyId: string) {
		if (client && typeof client.getCompanyCredits === 'function') {
			return client.getCompanyCredits(companyId)
		}
		return null
	}

	return { getCompanyCredits }
}

export default useCompanyCredits

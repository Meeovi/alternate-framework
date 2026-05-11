import { getCommerceClient } from '../../utils/client'

export function useCompanyHierarchy() {
	const client = getCommerceClient()

	async function getCompanyHierarchy(companyId: string) {
		if (client && typeof client.getCompanyHierarchy === 'function') {
			return client.getCompanyHierarchy(companyId)
		}
		return null
	}

	return { getCompanyHierarchy }
}

export default useCompanyHierarchy

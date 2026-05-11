import { getCommerceClient } from '../../utils/client'

export function useCatalogPermissions() {
	const client = getCommerceClient()

	async function getCatalogPermissions(userId: string) {
		if (client && typeof client.getCatalogPermissions === 'function') {
			return client.getCatalogPermissions(userId)
		}
		return null
	}

	return { getCatalogPermissions }
}

export default useCatalogPermissions

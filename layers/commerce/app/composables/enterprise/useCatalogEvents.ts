import { getCommerceClient } from '../../utils/client'

export function useCatalogEvents() {
	const client = getCommerceClient()

	async function listCatalogEvents(params = {}) {
		if (client && typeof client.listCatalogEvents === 'function') {
			return client.listCatalogEvents(params)
		}
		return []
	}

	return { listCatalogEvents }
}

export default useCatalogEvents

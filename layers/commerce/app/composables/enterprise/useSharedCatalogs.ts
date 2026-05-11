import { getCommerceClient } from '../../utils/client'

export function useSharedCatalogs() {
	const client = getCommerceClient()

	async function listSharedCatalogs(params = {}) {
		if (client && typeof client.listSharedCatalogs === 'function') {
			return client.listSharedCatalogs(params)
		}
		return []
	}

	return { listSharedCatalogs }
}

export default useSharedCatalogs
